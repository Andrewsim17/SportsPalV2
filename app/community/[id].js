import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  FlatList,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  UserPlus, 
  Info, 
  ChevronRight,
  Share2,
  Bell,
  BellOff,
  User,
  Plus
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { communitiesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';
import DiscussionItem from '../../components/DiscussionItem';
import { supabase } from '../../lib/supabase';

// Add a date formatting utility
const formatDate = (dateString, options = { year: 'numeric', month: 'long' }) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (e) {
    console.warn('Error formatting date:', e);
    return dateString; // fallback to original string if parsing fails
  }
};

export default function CommunityDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [discussions, setDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommunityData = useCallback(async () => {
    if (!user || !id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch community data with members count
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (communityError) throw communityError;
      
      // Fetch member count separately 
      const { count: memberCount, error: countError } = await supabase
        .from('community_members')
        .select('id', { count: 'exact', head: true })
        .eq('community_id', id);
        
      if (countError) {
        console.error('Error fetching member count:', countError);
      }
      
      // Fetch current user's membership status
      const { data: currentMembership, error: membershipError } = await supabase
        .from('community_members')
        .select('id, role')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (!membershipError) {
        setIsJoined(!!currentMembership);
      }
      
      // Create enhanced community object with proper data
      const enhancedCommunity = {
        ...communityData,
        memberCount: memberCount || 0,
        founded: formatDate(communityData.created_at), // Use created_at as the founded date
        featuredMembers: [] // Will populate later
      };
      
      setCommunity(enhancedCommunity);
      
      // Fetch featured members (admins/moderators)
      const { data: featuredMembersData, error: featuredError } = await supabase
        .from('community_members')
        .select(`
          id, 
          role,
          user:profiles(id, name, avatar_url)
        `)
        .eq('community_id', id)
        .in('role', ['admin', 'moderator'])
        .limit(3);
        
      if (!featuredError && featuredMembersData) {
        // Format featured members for display
        const formattedMembers = featuredMembersData.map(member => ({
          id: member.user.id,
          name: member.user.name || 'Community Member',
          image: member.user.avatar_url,
          role: member.role
        }));
        
        // Update community with featured members
        setCommunity(current => ({
          ...current,
          featuredMembers: formattedMembers
        }));
      }

      // Simplified query - just get the discussions without relationships
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('community_discussions') // Try the correct table name
        .select('*')
        .eq('community_id', id)
        .order('created_at', { ascending: false });

      if (discussionsError) {
        console.error('Discussion fetch error:', discussionsError);
        throw discussionsError;
      }
      
      console.log('Discussions raw data:', JSON.stringify(discussionsData?.slice(0, 1), null, 2));
      
      // Initialize with empty array if discussionsData is undefined
      const rawDiscussions = discussionsData || [];
      
      // Format the discussion data for the UI with basic fields
      const formattedDiscussions = rawDiscussions.map(d => ({
        id: d.id,
        title: d.title,
        content: d.content,
        createdAt: d.created_at,
        authorId: d.user_id || d.author_id, // Try both possible field names
        authorName: 'Loading...', // Will fetch separately if needed
        likes_count: d.likes_count || 0,
        replies_count: d.replies_count || 0,
      }));

      // Set initial data
      setDiscussions(formattedDiscussions);
      
      // If we have author IDs, fetch their profiles
      if (formattedDiscussions && formattedDiscussions.length > 0) {
        const authorIds = [...new Set(formattedDiscussions.filter(d => d.authorId).map(d => d.authorId))];
        
        if (authorIds && authorIds.length > 0) {
          const { data: authorsData, error: authorsError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', authorIds);
            
          if (!authorsError && authorsData) {
            // Create a lookup map
            const authorMap = {};
            authorsData.forEach(author => {
              authorMap[author.id] = author;
            });
            
            // Update discussions with author data
            const updatedDiscussions = formattedDiscussions.map(d => ({
              ...d,
              authorName: d.authorId && authorMap[d.authorId]?.name || 'Unknown Author',
              authorImage: d.authorId && authorMap[d.authorId]?.avatar_url || null,
            }));
            
            setDiscussions(updatedDiscussions);
      }
        }
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      setError(error.message || 'Failed to load community data');
      // Set empty discussions array to prevent undefined issues
      setDiscussions([]);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  // Add useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Community screen in focus, refreshing data...');
      fetchCommunityData();
    }, [fetchCommunityData])
  );

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // Add a refresh handler for discussions
  const handleDiscussionRefresh = useCallback(() => {
    console.log('Discussion refresh triggered, fetching fresh data...');
    fetchCommunityData();
  }, [fetchCommunityData]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredLoading]}>
        <Text>Loading community...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centeredLoading]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchCommunityData}><Text style={styles.retryText}>Try Again</Text></Pressable>
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Community Not Found',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.primary,
          }}
        />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Community not found</Text>
        </View>
      </View>
    );
  }

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to join communities.');
      router.push('/auth/login');
      return;
    }

    try {
      if (isJoined) {
        // Leave the community
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setIsJoined(false);
        setIsNotificationsEnabled(false);
        Alert.alert('Success', 'You have left the community');
      } else {
        // First check if user is already a member to prevent duplicate key errors
        const { data: existingMembership, error: checkError } = await supabase
          .from('community_members')
          .select('id')
          .eq('community_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (existingMembership) {
          // User is already a member, just update the UI state
          console.log('User is already a member of this community');
          setIsJoined(true);
          setIsNotificationsEnabled(true);
          Alert.alert('Info', 'You are already a member of this community');
          return;
        }
        
        // Join the community
        const { error: joinError } = await supabase
          .from('community_members')
          .insert({
            community_id: id,
            user_id: user.id,
            role: 'member'
          });
          
        if (joinError) throw joinError;
        
        setIsJoined(true);
        setIsNotificationsEnabled(true);
        Alert.alert('Success', 'You have joined the community');
      }
      
      // Refresh the community data to update the member count
      fetchCommunityData();
    } catch (error) {
      console.error('Error joining/leaving community:', error);
      Alert.alert('Error', error.message || 'Failed to update community membership');
    }
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };

  const handleMessage = () => {
    router.push(`/chat/community-${community.id}`);
  };

  const handleViewMember = (memberId) => {
    router.push(`/player/${memberId}`);
  };

  const handleViewDiscussion = (discussionId) => {
    router.push(`/community/discussion/${discussionId}`);
  };

  const handleCreateCommunity = () => {
    router.push('/community/create');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.aboutTab}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{community?.description || 'No description available.'}</Text>
              
              <View style={styles.infoRow}>
                <Info size={16} color={colors.textLight} />
                <Text style={styles.infoText}>Founded: {community?.founded || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={styles.infoText}>Location: {community?.location || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Users size={16} color={colors.textLight} />
                <Text style={styles.infoText}>Members: {community?.memberCount || 0}</Text>
              </View>
            </View>
            
            <View style={styles.featuredMembersSection}>
              <Text style={styles.sectionTitle}>Featured Members</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredMembersContainer}
              >
                {(community?.featuredMembers || []).map(member => (
                  <Pressable 
                    key={member?.id || Math.random().toString()}
                    style={styles.memberCard}
                    onPress={() => handleViewMember(member?.id)}
                  >
                    <Image 
                      source={member?.image} 
                      style={styles.memberImage}
                      contentFit="cover"
                    />
                    <Text style={styles.memberName}>{member?.name || 'Member'}</Text>
                    <View style={styles.memberRoleBadge}>
                      <Text style={styles.memberRoleText}>{member?.role || 'Member'}</Text>
                    </View>
                  </Pressable>
                ))}
                <Pressable 
                  style={styles.viewAllMembersCard}
                  onPress={() => router.push(`/community/members/${community.id}`)}
                >
                  <View style={styles.viewAllIconContainer}>
                    <Users size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.viewAllText}>View All Members</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        );
      
      case 'discussions':
        if (discussions && discussions.length > 0) {
        return (
              <FlatList
                data={discussions}
              keyExtractor={(item) => item?.id || Math.random().toString()}
              renderItem={({ item }) => (
                item ? (
                  <DiscussionItem 
                    discussion={item} 
                    onRefresh={handleDiscussionRefresh}
                  />
                ) : null
              )}
              contentContainerStyle={styles.discussionsListContent}
            />
          );
        } else {
          return (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyTabText}>No discussions started yet.</Text>
              <Pressable 
                style={styles.createDiscussionButton} 
                onPress={() => router.push(`/community/create-discussion/${id}`)}
              >
                <Text style={styles.createDiscussionText}>Start a Discussion</Text>
              </Pressable>
          </View>
        );
        }
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: community?.name || 'Community',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable 
                style={styles.headerButton} 
                onPress={handleCreateCommunity}
              >
                {/* <Plus size={22} color={colors.primary} /> */}
              </Pressable>
              <Pressable 
                style={styles.headerButton} 
                onPress={() => console.log('Share community')}
              >
                <Share2 size={22} color={colors.primary} />
              </Pressable>
            </View>
          ),
        }}
      />

        <View style={styles.header}>
          <Image 
          source={community?.coverImage} 
            style={styles.coverImage}
            contentFit="cover"
          />
          
          <View style={styles.communityInfo}>
            <Image 
            source={community?.image} 
              style={styles.communityImage}
              contentFit="cover"
            />
            
            <View style={styles.communityDetails}>
            <Text style={styles.communityName}>{community?.name || 'Community'}</Text>
              
              <View style={styles.locationContainer}>
                <MapPin size={16} color={colors.textLight} />
              <Text style={styles.locationText}>{community?.location || 'Location unknown'}</Text>
              </View>
              
              <View style={styles.membersContainer}>
                <Users size={16} color={colors.textLight} />
              <Text style={styles.membersText}>{community?.memberCount || 0} members</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable 
            style={[
              styles.joinButton, 
              isJoined && styles.joinedButton
            ]}
            onPress={handleJoin}
          >
            <UserPlus size={20} color={isJoined ? colors.card : colors.primary} />
            <Text style={[
              styles.joinButtonText,
              isJoined && styles.joinedButtonText
            ]}>
              {isJoined ? 'Joined' : 'Join'}
            </Text>
          </Pressable>
          
          {isJoined && (
            <Pressable 
              style={styles.notificationButton}
              onPress={handleToggleNotifications}
            >
              {isNotificationsEnabled ? (
                <Bell size={20} color={colors.primary} />
              ) : (
                <BellOff size={20} color={colors.textLight} />
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.tabsContainer}>
          <Pressable 
            style={[
              styles.tabButton,
              activeTab === 'about' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'about' && styles.activeTabButtonText
            ]}>
              About
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.tabButton,
              activeTab === 'discussions' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('discussions')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'discussions' && styles.activeTabButtonText
            ]}>
              Discussions
            </Text>
          </Pressable>
        </View>

      {activeTab === 'about' ? (
        <ScrollView style={styles.contentScrollView}>
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>
      ) : (
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      )}
      
      {activeTab === 'discussions' && (
        <Pressable 
          style={styles.fab}
          onPress={() => router.push(`/community/create-discussion/${id}`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Plus size={24} color="white" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 150,
  },
  communityInfo: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  communityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.card,
    marginTop: -40,
    marginRight: 16,
  },
  communityDetails: {
    flex: 1,
  },
  communityName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  joinButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: colors.card,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  messageButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  activeTabButtonText: {
    color: colors.primary,
  },
  tabContent: {
    paddingBottom: 24,
  },
  aboutTab: {
    padding: 16,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  featuredMembersSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuredMembersContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  memberCard: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  memberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  memberRoleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  memberRoleText: {
    fontSize: 10,
    color: colors.card,
    fontWeight: '500',
  },
  viewAllMembersCard: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabContentContainer: {
    padding: 16,
  },
  emptyTabText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginBottom: 10,
  },
  retryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: colors.danger,
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createDiscussionButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
  },
  createDiscussionText: {
    color: colors.card,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 999,
  },
  contentScrollView: {
    paddingBottom: 24,
  },
  discussionsListContent: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
});
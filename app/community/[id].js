import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  FlatList, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  UserPlus, 
  UserCheck,
  Info, 
  ChevronRight,
  Share2,
  Bell,
  BellOff,
  User,
  AlertCircle
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { communitiesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export default function CommunityDetailsScreen() {
  const { id: communityId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommunityData = useCallback(async () => {
    if (!communityId) {
      setError("Community ID not provided.");
      setIsLoading(false);
      return;
    }
    console.log('Fetching data for community:', communityId);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCommunity = await communitiesApi.getCommunity(communityId);
      console.log('Fetched community:', fetchedCommunity);
      if (!fetchedCommunity) {
        throw new Error('Community not found');
      }
      
      const adaptedCommunity = {
        id: fetchedCommunity.id,
        name: fetchedCommunity.name,
        image: fetchedCommunity.image_url,
        coverImage: fetchedCommunity.cover_image_url,
        location: fetchedCommunity.location,
        description: fetchedCommunity.description,
        founded: fetchedCommunity.created_at,
        memberCount: fetchedCommunity.members?.length || 0,
        events: [],
        discussions: [],
      };
      setCommunity(adaptedCommunity);

      const adaptedMembers = fetchedCommunity.members?.map(m => ({ 
        id: m.user.id,
        name: m.user.name || 'Unknown User',
        image: m.user.avatar_url, 
        role: m.role || 'Member'
      })) || [];
      setMembers(adaptedMembers);

      if (user && fetchedCommunity.members?.some(m => m.user_id === user.id)) {
        setIsJoined(true);
      } else {
        setIsJoined(false);
      }

    } catch (err) {
      console.error('Failed to fetch community data:', err);
      setError(err.message || 'Failed to load community details.');
    } finally {
      setIsLoading(false);
    }
  }, [communityId, user]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const handleJoinLeave = async () => {
    if (!user || isJoining || !community) return;
    
    setIsJoining(true);
    const currentlyJoined = isJoined;

    setIsJoined(!currentlyJoined);
    setCommunity(prev => ({ 
      ...prev, 
      memberCount: currentlyJoined ? (prev.memberCount || 1) - 1 : (prev.memberCount || 0) + 1
    }));
    if (!currentlyJoined) {
       setMembers(prev => [...prev, { id: user.id, name: user.name || 'You', image: user.avatar_url, role: 'Member' }])
    } else {
       setMembers(prev => prev.filter(m => m.id !== user.id))
    }

    try {
      if (currentlyJoined) {
        await communitiesApi.leaveCommunity(community.id, user.id);
        console.log('Left community');
      } else {
        await communitiesApi.joinCommunity(community.id, user.id);
        console.log('Joined community');
      }
      fetchCommunityData(); 
    } catch (err) {
      console.error(`Failed to ${currentlyJoined ? 'leave' : 'join'} community:`, err);
      Alert.alert('Error', `Could not ${currentlyJoined ? 'leave' : 'join'} the community. Please try again.`);
      setIsJoined(currentlyJoined);
      fetchCommunityData();
    } finally {
      setIsJoining(false);
    }
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(prev => !prev);
  };

  const handleMessage = () => {
    console.log('Navigate to community chat:', community?.id);
  };

  const handleViewEvent = (eventId) => {
    console.log('View event:', eventId);
  };

  const handleViewMember = (memberId) => {
    console.log('View member profile:', memberId);
    router.push(`/profile/${memberId}`);
  };

  const handleViewDiscussion = (discussionId) => {
    console.log('View discussion:', discussionId);
  };

  const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
     } catch (e) {
        return 'Invalid Date';
     }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{community?.description || 'No description provided.'}</Text>
              
              <View style={styles.infoRow}>
                <MapPin size={16} color={colors.textLight} />
              <Text style={styles.infoText}>{community?.location || 'Location not specified'}</Text>
              </View>
              <View style={styles.infoRow}>
              <Calendar size={16} color={colors.textLight} />
              <Text style={styles.infoText}>Founded {formatDate(community?.founded)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Users size={16} color={colors.textLight} />
              <Text style={styles.infoText}>{community?.memberCount || 0} members</Text>
            </View>
          </View>
        );
      case 'events':
        return (
          <View style={styles.tabContentContainer}>
             <Text style={styles.emptyTabText}>Upcoming events will be shown here.</Text>
                      </View>
        );
      case 'members':
        return (
          <View style={styles.tabContentContainer}>
            <FlatList
              data={members}
              renderItem={({item}) => (
                <Pressable style={styles.memberItem} onPress={() => handleViewMember(item.id)}>
                  <Image source={item.image || 'https://via.placeholder.com/100x100.png?text=User'} style={styles.memberImage} />
                  <View style={styles.memberInfo}>
                     <Text style={styles.memberName}>{item.name}</Text>
                     <Text style={styles.memberRole}>{item.role}</Text>
                  </View>
                   <ChevronRight size={20} color={colors.textLight} />
                </Pressable>
              )}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={styles.emptyTabText}>No members found.</Text>}
            />
          </View>
        );
      case 'discussions':
        return (
          <View style={styles.tabContentContainer}>
             <Text style={styles.emptyTabText}>Discussions will be shown here.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error || !community) {
    return (
      <View style={styles.errorContainer}>
         <Stack.Screen options={{ title: 'Error' }} />
         <AlertCircle size={40} color={colors.danger} />
        <Text style={styles.errorText}>{error || 'Community not found.'}</Text>
         {error && (
             <Pressable onPress={fetchCommunityData} style={styles.retryButton}>
               <Text style={styles.retryButtonText}>Try Again</Text>
             </Pressable>
         )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image 
            source={community.coverImage || 'https://via.placeholder.com/600x300.png?text=Community+Cover'} 
            style={styles.coverImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradient}
          />
          <View style={styles.headerContent}>
            <Text style={styles.communityTitle}>{community.name}</Text>
             <View style={styles.headerMeta}>
                <MapPin size={16} color={colors.card} />
                <Text style={styles.headerLocation}>{community.location || 'Location N/A'}</Text>
                <Users size={16} color={colors.card} style={{marginLeft: 12}} />
                <Text style={styles.headerMembers}>{community.memberCount || 0} members</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Pressable 
             style={[styles.actionButton, isJoined ? styles.joinedButton : styles.joinButton, isJoining && styles.disabledButton]} 
             onPress={handleJoinLeave}
             disabled={isJoining || !user}
          >
            {isJoining ? (
               <ActivityIndicator size="small" color={isJoined ? colors.primary : colors.card} /> 
            ) : (
               <>
                  {isJoined ? <UserCheck size={20} color={colors.primary} /> : <UserPlus size={20} color={colors.card} />}
                  <Text style={isJoined ? styles.joinedButtonText : styles.joinButtonText}>
                     {isJoined ? 'Joined' : 'Join Community'}
            </Text>
               </>
            )}
          </Pressable>
          <Pressable style={styles.iconButton} onPress={handleMessage}>
            <MessageCircle size={20} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={handleToggleNotifications}>
            {isNotificationsEnabled ? 
              <BellOff size={20} color={colors.primary} /> : 
                <Bell size={20} color={colors.primary} />
            }
            </Pressable>
           <Pressable style={styles.iconButton} onPress={() => {/* Share logic */}}>
            <Share2 size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.tabContainer}>
          {['about', 'events', 'members', 'discussions'].map((tab) => (
          <Pressable 
              key={tab} 
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} 
            </Text>
          </Pressable>
          ))}
        </View>

          {renderTabContent()}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
     backgroundColor: colors.primary,
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 8,
  },
  retryButtonText: {
     color: colors.card,
     fontSize: 16,
     fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 250,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%', 
  },
  headerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  communityTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLocation: {
    fontSize: 14,
    color: colors.card,
    marginLeft: 4,
  },
  headerMembers: {
    fontSize: 14,
    color: colors.card,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    gap: 6,
  },
  joinButton: {
     backgroundColor: colors.primary,
  },
  joinButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  joinedButton: {
     backgroundColor: colors.primaryLight,
     borderWidth: 1,
    borderColor: colors.primary,
  },
  joinedButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  iconButton: {
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border, 
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.textLight,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  memberRole: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  emptyTabText: {
     textAlign: 'center',
     marginTop: 40,
     color: colors.textLight,
    fontSize: 16,
  },
});
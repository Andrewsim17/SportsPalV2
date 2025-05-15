import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  Search, 
  X, 
  User,
  MessageCircle,
  UserPlus,
  Shield,
  Star
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { communitiesApi } from '../../../lib/api'; // Import the API

// Remove the MOCK_COMMUNITIES data

// Helper to format join date
const formatJoinDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch (e) {
    console.warn('Error formatting date:', e);
    return dateString;
  }
};

export default function CommunityMembersScreen() {
  const { id: communityId } = useLocalSearchParams();
  const router = useRouter();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch community data from the backend
  const fetchCommunityData = useCallback(async () => {
    if (!communityId) {
      setError("Community ID not provided.");
      setIsLoading(false);
      return;
    }
    console.log('Fetching members for community:', communityId);
    setIsLoading(true);
    try {
      const fetchedCommunity = await communitiesApi.getCommunity(communityId);
      console.log('Fetched community details:', JSON.stringify(fetchedCommunity, null, 2));
      if (!fetchedCommunity) {
        throw new Error('Community not found');
      }
      
      // Adapt the community data
      setCommunity({
        id: fetchedCommunity.id,
        name: fetchedCommunity.name,
        // Add other community fields if needed
      });

      // Adapt the members data
      const adaptedMembers = fetchedCommunity.members?.map(m => ({ 
        id: m.user.id,
        name: m.user.name || 'Unknown User',
        image: m.user.avatar_url,
        role: m.role || 'Member',
        level: m.user.level || 'Beginner', // Assuming profiles have a level field
        joinDate: formatJoinDate(m.created_at), // When the user joined the community
        location: m.user.location || 'Unknown Location' // Assuming profiles have a location field
      })) || [];

      setMembers(adaptedMembers);
      setFilteredMembers(adaptedMembers); // Initialize filtered members with all members
    } catch (err) {
      console.error('Failed to fetch community data:', err);
      setError(err.message || 'Failed to load community details.');
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // Filter members based on search query
  useEffect(() => {
    if (members) {
      if (searchQuery.trim() === '') {
        setFilteredMembers(members);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = members.filter(member => 
          member.name.toLowerCase().includes(query) || 
          member.role.toLowerCase().includes(query) ||
          (member.level && member.level.toLowerCase().includes(query)) ||
          (member.location && member.location.toLowerCase().includes(query))
        );
        setFilteredMembers(filtered);
      }
    }
  }, [searchQuery, members]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen 
          options={{
            title: 'Loading Members...',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.primary,
          }}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen 
          options={{
            title: 'Error',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.primary,
          }}
        />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchCommunityData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // Community not found state
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

  const handleViewProfile = (playerId) => {
    router.push(`/player/${playerId}`);
  };

  const handleMessage = (playerId) => {
    router.push(`/chat/${playerId}`);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return { backgroundColor: colors.primary };
      case 'moderator':
        return { backgroundColor: '#5E60CE' };
      case 'coach':
        return { backgroundColor: '#48BFE3' };
      default:
        return { backgroundColor: colors.textLight };
    }
  };

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Shield size={12} color="#fff" />;
      case 'moderator':
        return <Star size={12} color="#fff" />;
      case 'coach':
        return <Star size={12} color="#fff" />;
      default:
        return <User size={12} color="#fff" />;
    }
  };

  const renderMemberItem = ({ item }) => (
    <Pressable 
      style={styles.memberCard}
      onPress={() => handleViewProfile(item.id)}
    >
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.memberImage}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.memberImage, styles.memberImagePlaceholder]}>
          <User size={24} color={colors.textLight} />
        </View>
      )}
      
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{item.name}</Text>
          <View style={[styles.roleBadge, getRoleBadgeStyle(item.role)]}>
            {getRoleIcon(item.role)}
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>
        
        <View style={styles.memberDetails}>
          <Text style={styles.memberDetail}>Level: {item.level}</Text>
          <Text style={styles.memberDetail}>Joined: {item.joinDate}</Text>
          <Text style={styles.memberDetail}>Location: {item.location}</Text>
        </View>
      </View>
      
      <View style={styles.memberActions}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => handleMessage(item.id)}
        >
          <MessageCircle size={20} color={colors.primary} />
        </Pressable>
        
        <Pressable 
          style={styles.actionButton}
          onPress={() => console.log('Add friend:', item.name)}
        >
          <UserPlus size={20} color={colors.primary} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `${community.name} - Members`,
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textLight} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMemberItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 
                ? 'No members found matching your search' 
                : 'No members in this community yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.card,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  memberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  memberImagePlaceholder: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  roleText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
  memberDetails: {
    gap: 4,
  },
  memberDetail: {
    fontSize: 12,
    color: colors.textLight,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textLight,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
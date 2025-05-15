import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Search, Filter, MapPin, Award, Star, AlertCircle, Plus, UserPlus, UserCheck } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { communitiesApi, profilesApi, gamesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

const CATEGORIES = [
  { id: 'communities', name: 'Communities' },
  { id: 'players', name: 'Players' },
];

function CommunityCard({ community, onPress }) {
  return (
    <Pressable style={styles.communityCard} onPress={() => onPress(community.id)}>
      <Image 
        source={community.image || 'https://via.placeholder.com/300x200.png?text=Community'}
        style={styles.communityImage} 
        contentFit="cover" 
      />
      <View style={styles.communityContent}>
        <Text style={styles.communityName}>{community.name || 'Community Name'}</Text>
        <View style={styles.communityMeta}>
          <Text style={styles.communityMembers}>{community.members ?? '0'} members</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.locationText}>{community.location || 'Location N/A'}</Text>
          </View>
        </View>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {community.description || 'No description available.'}
        </Text>
      </View>
    </Pressable>
  );
}

function PlayerCard({ player, onPress }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuthStore();
  
  const handleFollow = (e) => {
    e.stopPropagation(); // Prevent card press
    
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to follow players');
      return;
    }
    
    // Toggle following state
    setIsFollowing(prev => !prev);
    
    // Here you would implement the actual follow/unfollow API call
    // For now, just show an alert
    if (!isFollowing) {
      Alert.alert('Success', `You are now following ${player.name}`);
    } else {
      Alert.alert('Success', `You have unfollowed ${player.name}`);
    }
  };

  return (
    <Pressable style={styles.playerCard} onPress={() => onPress(player.id)}>
      <Image 
        source={player.image || 'https://via.placeholder.com/150x150.png?text=Player'}
        style={styles.playerImage} 
        contentFit="cover" 
      />
      <View style={styles.playerContent}>
        <View style={styles.playerNameRow}>
        <Text style={styles.playerName}>{player.name || 'Player Name'}</Text>
          <Pressable 
            style={[
              styles.followButton, 
              isFollowing ? styles.followingButton : styles.unfollowButton
            ]} 
            onPress={handleFollow}
          >
            {isFollowing ? (
              <UserCheck size={16} color={colors.card} />
            ) : (
              <UserPlus size={16} color={colors.primary} />
            )}
            <Text style={[
              styles.followButtonText,
              isFollowing ? styles.followingButtonText : styles.unfollowButtonText
            ]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.sportsContainer}>
          {(player.sports && player.sports.length > 0) ? player.sports.map(sport => (
            <View key={sport} style={styles.sportTag}>
              <Text style={styles.sportTagText}>{sport}</Text>
            </View>
          )) : <Text style={styles.placeholderText}>No sports listed</Text>}
        </View>
        
        <View style={styles.playerMeta}>
          <View style={styles.levelContainer}>
            <Award size={14} color={colors.primary} />
            <Text style={styles.levelText}>{player.level || 'Level N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.locationText}>{player.location || 'Location N/A'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('communities');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  const [communities, setCommunities] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching data for: ${selectedCategory}`);

    try {
      switch (selectedCategory) {
        case 'communities':
          const fetchedCommunities = await communitiesApi.getCommunities();
          console.log('Fetched Communities:', fetchedCommunities);
          const adaptedCommunities = fetchedCommunities.map(c => ({
             id: c.id,
             name: c.name,
             image: c.image_url,
             members: c.members?.[0]?.count || 0,
             location: c.location,
             description: c.description
          }));
          setCommunities(adaptedCommunities);
          break;
        case 'players':
          const fetchedPlayers = await profilesApi.getProfiles({ is_coach: false });
           console.log('Fetched Players:', fetchedPlayers);
          
          // Debug log to check the structure of the first player's data
          if (fetchedPlayers && fetchedPlayers.length > 0) {
            console.log('First player data:', JSON.stringify(fetchedPlayers[0], null, 2));
          }
          
          const filteredPlayers = currentUser ? fetchedPlayers.filter(p => p.id !== currentUser.id) : fetchedPlayers;
          const adaptedPlayers = filteredPlayers.map(p => {
            // Debug sports data
            console.log(`Player ${p.name} sports data:`, p.sports);
            
            return {
             id: p.id,
             name: p.name,
             image: p.avatar_url,
              // Make sure we're properly handling the sports array
              sports: Array.isArray(p.sports) ? p.sports : 
                      (typeof p.sports === 'string' ? [p.sports] : []),
             level: p.level || 'Level N/A',
             location: p.location || 'Location N/A',
              // We're no longer using this, but keeping it in the data model for now
             availability: p.details?.availability || 'N/A'
            };
          });
          setPlayers(adaptedPlayers);
          break;
        case 'events':
           console.log('Fetching events...');
          setEvents([]);
          break;
        default:
          console.warn('Unknown category:', selectedCategory);
      }
    } catch (err) {
      console.error(`Failed to fetch ${selectedCategory}:`, err);
      setError(`Failed to load ${selectedCategory}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCommunityPress = (id) => {
     console.log("Navigate to community:", id);
     router.push(`/community/${id}`);
  };

  const handlePlayerPress = (id) => {
     console.log("Navigate to player:", id);
      router.push(`/player/${id}`);
  };
  
  const handleEventPress = (id) => {
      console.log("Navigate to event/game:", id);
  };

  const handleCreateCommunity = () => {
    console.log("Navigate to create community screen");
    router.push('/community/create');
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />;
    }
    
    if (error) {
      return (
         <View style={styles.errorContainer}>
            <AlertCircle size={40} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
             <Pressable onPress={fetchData} style={styles.retryButton}>
               <Text style={styles.retryButtonText}>Try Again</Text>
             </Pressable>
         </View>
      );
    }

    switch (selectedCategory) {
      case 'communities':
        return (
          <FlatList
            data={communities}
            renderItem={({ item }) => (
              <CommunityCard community={item} onPress={handleCommunityPress} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyListText}>No communities found.</Text>}
          />
        );
      case 'players':
        return (
          <FlatList
            data={players}
            renderItem={({ item }) => (
              <PlayerCard player={item} onPress={handlePlayerPress} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyListText}>No players found.</Text>}
          />
        );
      case 'events':
        return <Text style={styles.emptyListText}>Events coming soon!</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities, players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
        <Pressable style={styles.filterButton}>
          <Filter size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {CATEGORIES.map(item => (
            <Pressable
              key={item.id}
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.id && styles.categoryButtonTextActive
              ]}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {renderContent()}
      
      {selectedCategory === 'communities' && (
      <Pressable 
        style={styles.floatingActionButton}
        onPress={handleCreateCommunity}
      >
        <Plus size={24} color={colors.card} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.card,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  communityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityImage: {
    width: '100%',
    height: 120,
  },
  communityContent: {
    padding: 16,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  communityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  communityMembers: {
    fontSize: 14,
    color: colors.textLight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
  },
  communityDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  playerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  playerContent: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    gap: 4,
  },
  followingButton: {
    backgroundColor: colors.primary,
  },
  unfollowButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  followingButtonText: {
    color: colors.card,
  },
  unfollowButtonText: {
    color: colors.primary,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sportTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportTagText: {
    fontSize: 12,
    color: colors.card,
    fontWeight: '500',
  },
  playerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 30,
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
  emptyListText: {
     textAlign: 'center',
     marginTop: 50,
     color: colors.textLight,
     fontSize: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
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
});
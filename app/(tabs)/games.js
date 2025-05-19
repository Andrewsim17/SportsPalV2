import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Share, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Search, RefreshCw } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GameCard from '../../components/GameCard';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';
import { gamesApi } from '../../lib/api'; // Import the games API
import { useAuthStore } from '../../store/auth-store'; // Import auth store if needed for joining games
import { SportTypes } from '../../types/activity'; // Import sports from activity.js

// Add emojis to each sport
const SPORTS_WITH_EMOJIS = [
  { name: 'All', emoji: '🏆' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Running', emoji: '🏃' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Hiking', emoji: '🥾' },
  { name: 'Golf', emoji: '⛳' },
  { name: 'Table Tennis', emoji: '🏓' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Rugby', emoji: '🏉' },
  { name: 'Baseball', emoji: '⚾' },
  { name: 'Yoga', emoji: '🧘' },
  { name: 'Boxing', emoji: '🥊' },
  { name: 'Martial Arts', emoji: '🥋' },
  { name: 'Skiing', emoji: '⛷️' },
  { name: 'Snowboarding', emoji: '🏂' },
  { name: 'Surfing', emoji: '🏄' },
  { name: 'Rock Climbing', emoji: '🧗' },
  { name: 'Weight Training', emoji: '🏋️' },
  { name: 'CrossFit', emoji: '💪' },
  { name: 'Pilates', emoji: '🤸' },
  { name: 'Dance', emoji: '💃' },
  { name: 'Skateboarding', emoji: '🛹' },
  { name: 'Rowing', emoji: '🚣' },
  { name: 'Kayaking', emoji: '🛶' },
  { name: 'Archery', emoji: '🏹' },
  { name: 'Fencing', emoji: '🤺' },
  { name: 'Hockey', emoji: '🏑' },
  { name: 'Ice Hockey', emoji: '🏒' },
  { name: 'Handball', emoji: '🤾' },
  { name: 'Squash', emoji: '🥎' },
  { name: 'Triathlon', emoji: '🏊‍♂️' },
  { name: 'Ultimate Frisbee', emoji: '🥏' },
  { name: 'Parkour', emoji: '🏃‍♂️' },
  { name: 'Zumba', emoji: '💃' },
  { name: 'Walking', emoji: '🚶' },
  { name: 'Sailing', emoji: '⛵' },
  { name: 'Bowling', emoji: '🎳' },
  { name: 'Climbing', emoji: '🧗‍♀️' },
  { name: 'Gymnastics', emoji: '🤸‍♀️' },
  { name: 'Judo', emoji: '🥋' },
  { name: 'Karate', emoji: '🥋' },
  { name: 'Kickboxing', emoji: '🥊' },
  { name: 'Lacrosse', emoji: '🥍' },
  { name: 'Marathon', emoji: '🏃‍♀️' },
  { name: 'MMA', emoji: '🥋' },
  { name: 'Muay Thai', emoji: '🥊' },
  { name: 'Paddle Boarding', emoji: '🏄‍♂️' },
  { name: 'Pole Dancing', emoji: '💃' },
  { name: 'Racquetball', emoji: '🎾' },
  { name: 'Roller Skating', emoji: '🛼' },
  { name: 'Scuba Diving', emoji: '🤿' },
  { name: 'Snorkeling', emoji: '🤿' },
  { name: 'Softball', emoji: '🥎' },
  { name: 'Taekwondo', emoji: '🥋' },
  { name: 'Tai Chi', emoji: '🧘‍♂️' },
  { name: 'Water Polo', emoji: '🤽' }
];

// Format the emojis for display (emoji + name)
const FORMATTED_SPORTS = SPORTS_WITH_EMOJIS.map(sport => `${sport.emoji} ${sport.name}`);

// Function to extract the sport name without emoji
const extractSportName = (sportWithEmoji) => {
  if (!sportWithEmoji) return null;
  // Check if there's an emoji
  if (sportWithEmoji.match(/(\p{Emoji})/u)) {
    // Get everything after the first space
    return sportWithEmoji.split(' ').slice(1).join(' ');
  }
  return sportWithEmoji;
};

export default function GamesScreen() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const router = useRouter();
  const { user } = useAuthStore(); // Get user for join functionality

  // Function to fetch games based on current filters
  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Extract the sport name without emoji for filtering
    const sportName = selectedSport === '🏆 All' ? null : extractSportName(selectedSport);
    
    const filters = {
      ...activeFilters, // Include price, level etc. from FilterBar
      sport: sportName,
      location: selectedLocation || null, // Use the selected location
      distance: activeFilters.distance || null, // Include distance filter if it exists
      search: searchQuery || null, // Use search query for text search
    };
    
    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    console.log("Fetching games with filters:", filters);

    try {
      const fetchedGames = await gamesApi.getGames(filters);
      
      // Adapt fetched data structure to GameCard props with consistent player count logic
      const adaptedGames = fetchedGames.map(game => {
        // Get the actual number of participants
        const participantCount = game.participants?.length || 0;
        
        // Check if organizer is already in the participants
        const organizerInParticipants = game.participants?.some(p => 
          p.player?.id === game.organizer?.id
        );
        
        // Calculate current players count considering organizer
        const playersCurrent = organizerInParticipants 
          ? participantCount 
          : participantCount + 1; // Include organizer
        
        return {
          ...game,
          playersCurrent: playersCurrent,
          // Ensure organizer data structure matches expectations
          organizer: game.organizer ? { 
            id: game.organizer.id,
            name: game.organizer.name || 'Unknown Organizer', 
            rating: 4.5 /* TODO: Fetch real rating */
          } : { 
            name: 'Unknown Organizer', 
            rating: 0 
          }
        };
      });
      
      setGames(adaptedGames);
    } catch (err) {
      console.error("Failed to fetch games:", err);
      setError(err.message || 'Failed to load games');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, selectedLocation, searchQuery, activeFilters]);

  // Initial fetch and fetch on filter changes
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchGames();
    setIsRefreshing(false);
  }, [fetchGames]);

  const handleGamePress = (gameId) => {
    router.push(`/game/${gameId}`);
  };

  const handleCreateGame = () => {
    router.push('/game/organize'); // Assuming this route exists for creating games
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    // fetchGames will be triggered by the useEffect dependency change
  };

  const handleJoinGame = async (game) => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to join games.');
      router.push('/auth/login'); // Redirect to login
      return;
    }
    
    if (game.playersCurrent >= game.playersNeeded) {
      Alert.alert('Game Full', 'This game is already at capacity.');
      return;
    }
    
    // Check if user is already a participant
    const isAlreadyParticipant = game.participants?.some(p => 
      p.player?.id === user.id || p.user_id === user.id
    );
    if (isAlreadyParticipant) {
      Alert.alert('Already Joined', 'You are already part of this game.');
      return;
    }

    Alert.alert(
      'Confirm Join',
      'Are you sure you want to join this game?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: async () => {
            setIsLoading(true); // Show loading indicator
            try {
              // Join the game
              await gamesApi.joinGame(game.id, user.id);
              Alert.alert('Success', 'You have joined the game!');
              
              // Fetch the full game details again to ensure we have the latest participant count
              const updatedGame = await gamesApi.getGame(game.id);
              
              // Update the games list with the new participant count
              setGames(prevGames => 
                prevGames.map(g => {
                  if (g.id === game.id) {
                    // Calculate updated player count using the same logic consistently
                    const participantCount = updatedGame.participants?.length || 0;
                    
                    // Check if organizer is already in the participants 
                    const organizerInParticipants = updatedGame.participants?.some(p => 
                      p.player?.id === updatedGame.organizer?.id
                    );
                    
                    // Calculate player count properly
                    const updatedPlayerCount = organizerInParticipants
                      ? participantCount
                      : participantCount + 1; // Include organizer
                    
                    console.log("Game updated after join:", {
                      gameId: game.id,
                      title: game.title,
                      participantCount,
                      organizerInParticipants,
                      updatedPlayerCount
                    });
                    
                    return {
                      ...g,
                      playersCurrent: updatedPlayerCount,
                      participants: updatedGame.participants
                    };
                  }
                  return g;
                })
              );
            } catch (joinError) {
              console.error("Failed to join game:", joinError);
              
              let errorMessage = joinError.message || 'Could not join the game.';
              // Handle specific database constraint errors
              if (joinError.code === '23505') {
                errorMessage = 'You are already a participant in this game.';
                // Try to refresh the game data anyway
                await fetchGames();
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setIsLoading(false); // Hide loading indicator
            }
          },
        },
      ]
    );
  };

  const handleShareGame = async (game) => {
    try {
      const result = await Share.share({
        message: `Join me for ${game.title} at ${game.location} on ${new Date(game.date).toLocaleDateString()}! We need ${game.playersNeeded - game.playersCurrent} more players.`,
        title: `${game.sport} Game Invitation`,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderContent = () => {
    if (isLoading && games.length === 0 && !isRefreshing) {
      return <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable onPress={fetchGames}>
            <Text style={styles.resetText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={games}
        renderItem={({ item }) => (
          <GameCard 
            game={item} 
            onPress={() => handleGamePress(item.id)}
            onJoin={() => handleJoinGame(item)}
            onShare={() => handleShareGame(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No games found matching your criteria.</Text>
            <Pressable onPress={() => {
              setActiveFilters({});
              setSelectedSport('All');
              setSelectedLocation('');
              setSearchQuery('');
              // fetchGames will be triggered by useEffect
            }}>
              <Text style={styles.resetText}>Reset filters</Text>
            </Pressable>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Find Games',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable 
                onPress={() => setShowSearch(!showSearch)} 
                style={styles.headerButton}
              >
                <Search size={24} color={colors.primary} />
              </Pressable>
            </View>
          ),
        }}
      />

      {showSearch && (
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search games by title, location..."
          onClear={() => setSearchQuery('')}
        />
      )}

      <FilterBar
        sports={FORMATTED_SPORTS}
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        activeFilters={activeFilters}
        onApplyFilters={applyFilters} // Pass applyFilters to FilterBar
      />

      {renderContent()}

      <Pressable style={styles.createGameButton} onPress={handleCreateGame}>
        <Plus size={24} color={colors.card} />
      </Pressable>
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
  },
  headerButton: {
    padding: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 80, // Extra padding for the FAB
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 200, // Ensure it takes some space
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  createGameButton: {
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});
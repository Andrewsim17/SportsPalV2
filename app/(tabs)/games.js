import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Share } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GameCard from '../../components/GameCard';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';

const SPORTS = ['All', 'Basketball', 'Tennis', 'Football', 'Volleyball', 'Badminton'];

const MOCK_GAMES = [
  {
    id: '1',
    sport: 'Basketball',
    title: '3v3 Basketball Tournament',
    location: 'Downtown Sports Center',
    city: 'Petaling Jaya',
    date: '2024-02-25T14:00:00Z',
    duration: 120,
    playersNeeded: 6,
    playersCurrent: 4,
    level: 'Intermediate',
    price: 10,
    organizer: {
      name: 'Mike Chen',
      rating: 4.8,
    },
  },
  {
    id: '2',
    sport: 'Tennis',
    title: 'Casual Tennis Doubles',
    location: 'Central Tennis Club',
    city: 'Kuala Lumpur',
    date: '2024-02-26T09:00:00Z',
    duration: 90,
    playersNeeded: 4,
    playersCurrent: 2,
    level: 'Beginner Friendly',
    price: 15,
    organizer: {
      name: 'Sarah Johnson',
      rating: 4.9,
    },
  },
  {
    id: '3',
    sport: 'Badminton',
    title: 'Badminton Singles Practice',
    location: 'Elite Sports Hall',
    city: 'Shah Alam',
    date: '2024-02-27T18:00:00Z',
    duration: 60,
    playersNeeded: 2,
    playersCurrent: 1,
    level: 'Advanced',
    price: 8,
    organizer: {
      name: 'David Lee',
      rating: 4.7,
    },
  },
];

export default function GamesScreen() {
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const router = useRouter();

  const handleGamePress = (gameId) => {
    router.push(`/game/${gameId}`);
  };

  const handleCreateGame = () => {
    router.push('/game/organize');
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    console.log('Applied filters:', filters);
  };

  const handleJoinGame = (game) => {
    if (game.playersCurrent >= game.playersNeeded) {
      Alert.alert('Game Full', 'This game is already at capacity.');
      return;
    }
    
    Alert.alert(
      'Join Game',
      'By joining this game, you are making a commitment to attend. Cancellations may affect your user rating. Do you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: () => {
            Alert.alert('Success', 'You have joined the game!');
            // In a real app, update the game state here
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

  const filteredGames = MOCK_GAMES.filter(game => {
    // Filter by sport if not "All"
    const sportMatch = selectedSport === 'All' || game.sport === selectedSport;
    
    // Filter by location
    const locationMatch = !selectedLocation || game.city === selectedLocation;
    
    // Filter by search query
    const searchMatch = !searchQuery || 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.sport.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by price
    const priceMatch = !activeFilters.priceRange || 
      (game.price >= activeFilters.priceRange[0] && game.price <= activeFilters.priceRange[1]);
    
    // Filter by level
    const levelMatch = !activeFilters.levels || 
      activeFilters.levels.length === 0 || 
      activeFilters.levels.includes(game.level);
    
    return sportMatch && locationMatch && searchMatch && priceMatch && levelMatch;
  });

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
          placeholder="Search games..."
          onClear={() => setSearchQuery('')}
        />
      )}

      <FilterBar
        sports={SPORTS}
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        activeFilters={activeFilters}
        onApplyFilters={applyFilters}
      />

      <FlatList
        data={filteredGames}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No games match your filters</Text>
            <Pressable onPress={() => {
              setActiveFilters({});
              setSelectedSport('All');
              setSelectedLocation('');
              setSearchQuery('');
            }}>
              <Text style={styles.resetText}>Reset filters</Text>
            </Pressable>
          </View>
        }
      />

      <Pressable style={styles.createGameButton} onPress={handleCreateGame}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.createGameButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={24} color={colors.card} />
        </LinearGradient>
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  createGameButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
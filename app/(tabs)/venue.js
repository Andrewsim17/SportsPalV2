import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import VenueCard from '../../components/VenueCard';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';
import { venuesApi } from '../../lib/api';
import { processVenueImages } from '../../lib/storage';
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

export default function VenuesScreen() {
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const router = useRouter();

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Extract the sport name without emoji for filtering
    const sportName = selectedSport === '🏆 All' ? null : extractSportName(selectedSport);
    
    const filters = {
      ...activeFilters,
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
    
    console.log("Fetching venues with filters:", filters);
    
    try {
      const fetchedVenues = await venuesApi.getVenues(filters);
      console.log('Fetched venues:', fetchedVenues.length);
      
      // Process images for each venue
      const adaptedVenues = fetchedVenues.map(venue => {
        // Log the raw image data for debugging
        console.log(`Venue ${venue.id} raw images:`, JSON.stringify(venue.images));
        
        // Process the images
        const images = processVenueImages(venue.images);
        console.log(`Venue ${venue.id} processed images:`, images);
        
        return {
          ...venue,
          images: images,
          distance: '2.5 mi', // Placeholder
          pricePerHour: Math.floor(Math.random() * 50) + 20, // Placeholder
          availability: 'Available now', // Placeholder
        };
      });
      
      setVenues(adaptedVenues);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, selectedLocation, searchQuery, activeFilters]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleVenuePress = (venueId) => {
    router.push(`/venue/${venueId}`);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    console.log('Applied filters (from modal):', filters);
  };

  const handleResetFilters = () => {
    setSelectedSport('All');
    setSelectedLocation('');
    setSearchQuery('');
    setActiveFilters({});
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Book Venues',
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
          placeholder="Search venues by name..."
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
        onApplyFilters={applyFilters}
      />

      {isLoading && venues.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable onPress={fetchVenues}>
            <Text style={styles.resetText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={venues}
          renderItem={({ item }) => (
            <VenueCard 
              venue={item} 
              onPress={() => handleVenuePress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No venues found</Text>
                <Pressable onPress={handleResetFilters}>
                  <Text style={styles.resetText}>Reset filters</Text>
                </Pressable>
              </View>
            )
          }
        />
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
  },
  headerButton: {
    padding: 8,
  },
  list: {
    padding: 16,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
});
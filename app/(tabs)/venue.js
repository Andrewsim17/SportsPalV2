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

const SPORTS = ['All', 'Tennis', 'Basketball', 'Football', 'Badminton', 'Swimming', 'Soccer'];

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
    console.log('Fetching venues with filters:', { sport: selectedSport, location: selectedLocation, query: searchQuery });
    
    try {
      const apiFilters = {};
      if (selectedSport !== 'All') {
        apiFilters.sport = selectedSport;
      }
      if (selectedLocation) {
        apiFilters.city = selectedLocation;
      }
      if (searchQuery) {
        apiFilters.name = searchQuery;
      }
      
      const fetchedVenues = await venuesApi.getVenues(apiFilters);
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
  }, [selectedSport, selectedLocation, searchQuery]);

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
        sports={SPORTS}
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
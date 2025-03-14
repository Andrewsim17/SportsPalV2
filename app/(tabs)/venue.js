import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import VenueCard from '../../components/VenueCard';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/Filterbar';

const SPORTS = ['All', 'Tennis', 'Basketball', 'Football', 'Badminton', 'Swimming'];

const MOCK_VENUES = [
  {
    id: '1',
    name: 'Central Sports Complex',
    images: ['https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=1000'],
    sports: ['Tennis', 'Basketball'],
    rating: 4.8,
    reviews: 128,
    location: 'Downtown',
    city: 'Petaling Jaya',
    distance: '2.3 km',
    pricePerHour: 45,
    amenities: ['Parking', 'Showers', 'Equipment Rental'],
    availability: 'Available today',
    courts: [
      { id: 'c1', name: 'Tennis Court 1', sport: 'Tennis' },
      { id: 'c2', name: 'Tennis Court 2', sport: 'Tennis' },
      { id: 'c3', name: 'Basketball Court 1', sport: 'Basketball' },
      { id: 'c4', name: 'Basketball Court 2', sport: 'Basketball' },
    ]
  },
  {
    id: '2',
    name: 'Elite Tennis Club',
    images: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1000'],
    sports: ['Tennis'],
    rating: 4.9,
    reviews: 89,
    location: 'Westside',
    city: 'Kuala Lumpur',
    distance: '4.1 km',
    pricePerHour: 65,
    amenities: ['Pro Shop', 'Cafe', 'Coaching'],
    availability: '2 slots left today',
    courts: [
      { id: 'c5', name: 'Clay Court 1', sport: 'Tennis' },
      { id: 'c6', name: 'Clay Court 2', sport: 'Tennis' },
      { id: 'c7', name: 'Hard Court 1', sport: 'Tennis' },
      { id: 'c8', name: 'Hard Court 2', sport: 'Tennis' },
    ]
  },
  {
    id: '3',
    name: 'Badminton Paradise',
    images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000'],
    sports: ['Badminton'],
    rating: 4.7,
    reviews: 56,
    location: 'City Center',
    city: 'Shah Alam',
    distance: '3.5 km',
    pricePerHour: 35,
    amenities: ['Equipment Rental', 'Cafe', 'Parking'],
    availability: 'Available today',
    courts: [
      { id: 'c9', name: 'Court A', sport: 'Badminton' },
      { id: 'c10', name: 'Court B', sport: 'Badminton' },
      { id: 'c11', name: 'Court C', sport: 'Badminton' },
      { id: 'c12', name: 'Court D', sport: 'Badminton' },
    ]
  }
];

export default function VenuesScreen() {
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const router = useRouter();

  const handleVenuePress = (venueId) => {
    router.push(`/venue/${venueId}`);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    console.log('Applied filters:', filters);
  };

  const filteredVenues = MOCK_VENUES.filter(venue => {
    // Filter by sport if not "All"
    const sportMatch = selectedSport === 'All' || 
      venue.sports.includes(selectedSport);
    
    // Filter by location
    const locationMatch = !selectedLocation || venue.city === selectedLocation;
    
    // Filter by search query
    const searchMatch = !searchQuery || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.sports.some(sport => sport.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by price
    const priceMatch = !activeFilters.priceRange || 
      (venue.pricePerHour >= activeFilters.priceRange[0] && venue.pricePerHour <= activeFilters.priceRange[1]);
    
    return sportMatch && locationMatch && searchMatch && priceMatch;
  });

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
          placeholder="Search venues..."
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
        data={filteredVenues}
        renderItem={({ item }) => (
          <VenueCard 
            venue={item} 
            onPress={() => handleVenuePress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No venues match your filters</Text>
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
});
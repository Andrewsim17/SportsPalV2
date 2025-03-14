import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList } from 'react-native';
import { MapPin, Search, X } from 'lucide-react-native';
import { colors } from '../constants/colors';

// Mock locations for demonstration
const MOCK_LOCATIONS = [
  'Petaling Jaya',
  'Kuala Lumpur',
  'Shah Alam',
  'Subang Jaya',
  'Damansara',
  'Puchong',
  'Cheras',
  'Ampang',
  'Klang',
  'Cyberjaya',
  'Putrajaya',
];

export default function LocationInput({ selectedLocation, onSelectLocation, isModal = false }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = MOCK_LOCATIONS.filter(location => 
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isModal) {
    return (
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Select Location</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textLight} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={styles.locationItem}
              onPress={() => onSelectLocation(item)}
            >
              <MapPin size={18} color={colors.primary} />
              <Text style={styles.locationItemText}>{item}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No locations found</Text>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...MOCK_LOCATIONS]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.locationButton,
              selectedLocation === item && styles.selectedLocationButton
            ]}
            onPress={() => onSelectLocation(item === 'All' ? '' : item)}
          >
            <MapPin size={14} color={selectedLocation === item ? colors.card : colors.primary} />
            <Text
              style={[
                styles.locationButtonText,
                selectedLocation === item && styles.selectedLocationButtonText
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.locationsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  locationsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    gap: 4,
  },
  selectedLocationButton: {
    backgroundColor: colors.primary,
  },
  locationButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  selectedLocationButtonText: {
    color: colors.card,
  },
  modalContainer: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: colors.textLight,
  },
});
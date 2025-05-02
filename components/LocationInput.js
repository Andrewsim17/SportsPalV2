import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, ActivityIndicator, Modal } from 'react-native';
import { MapPin, Search, X, Navigation } from 'lucide-react-native';
import { colors } from '../constants/colors';
import LocationMap from './LocationMap';

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

export default function LocationInput({ 
  selectedLocation, 
  onSelectLocation, 
  onCoordinatesChange,
  isModal = false,
  initialCoordinates = null 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(initialCoordinates);
  const [customLocationName, setCustomLocationName] = useState('');

  const filteredLocations = MOCK_LOCATIONS.filter(location => 
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // When coordinates are selected from the map
  const handleMapSelection = (latitude, longitude) => {
    setSelectedCoordinates({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    });
    
    // If onCoordinatesChange prop exists, call it
    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });
    }
  };

  const handleSelectCustomLocation = () => {
    if (customLocationName.trim() && selectedCoordinates) {
      // Use custom location name
      onSelectLocation(customLocationName);
      
      // Close the map picker
      setShowMapPicker(false);
    }
  };

  // Map picker modal
  const MapPickerModal = () => (
    <Modal
      visible={showMapPicker}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.mapPickerContainer}>
        <View style={styles.mapPickerHeader}>
          <Text style={styles.mapPickerTitle}>Select Location on Map</Text>
          <Pressable onPress={() => setShowMapPicker(false)}>
            <X size={24} color={colors.text} />
          </Pressable>
        </View>
        
        <LocationMap
          style={styles.mapPicker}
          zoomLevel={0.01}
          showUserLocation={true}
          onLocationSelect={handleMapSelection}
          initialRegion={selectedCoordinates}
          draggableMarker={true}
        />
        
        <View style={styles.customLocationContainer}>
          <TextInput
            style={styles.customLocationInput}
            placeholder="Enter a name for this location"
            value={customLocationName}
            onChangeText={setCustomLocationName}
          />
          
          <Pressable 
            style={[
              styles.confirmButton,
              (!customLocationName.trim() || !selectedCoordinates) && styles.disabledButton
            ]}
            onPress={handleSelectCustomLocation}
            disabled={!customLocationName.trim() || !selectedCoordinates}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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

        <Pressable
          style={styles.customMapButton}
          onPress={() => setShowMapPicker(true)}
        >
          <Navigation size={18} color={colors.primary} />
          <Text style={styles.customMapButtonText}>
            Select Custom Location on Map
          </Text>
        </Pressable>

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

        <MapPickerModal />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapButtonContainer}>
        <Pressable
          style={styles.mapButton}
          onPress={() => setShowMapPicker(true)}
        >
          <Navigation size={18} color={colors.primary} />
          <Text style={styles.mapButtonText}>Select on Map</Text>
        </Pressable>
      </View>

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

      <MapPickerModal />
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
  customMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  customMapButtonText: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  mapButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: colors.primary,
    marginLeft: 4,
  },
  mapPickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  mapPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  mapPicker: {
    height: 300,
    marginBottom: 16,
    borderRadius: 12,
  },
  customLocationContainer: {
    marginTop: 16,
  },
  customLocationInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  confirmButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
});
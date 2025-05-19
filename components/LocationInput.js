import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { MapPin, Search, X, Navigation, Target, Check } from 'lucide-react-native';
import { colors } from '../constants/colors';
import MapboxMap from './MapboxMap';

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

// Distance options for filtering
const DISTANCE_OPTIONS = [
  { label: 'Any distance', value: null },
  { label: 'Within 5km', value: 5 },
  { label: '5-10km', value: 10 },
  { label: '10-20km', value: 20 },
  { label: '20km+', value: 30 }
];

export default function LocationInput({ 
  selectedLocation, 
  onSelectLocation,
  onCoordinatesChange,
  initialDistance = null,
  onDistanceChange,
  isModal = false,
  initialCoordinates = null 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(initialCoordinates);
  const [customLocationName, setCustomLocationName] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(initialDistance);
  const [showDistanceOptions, setShowDistanceOptions] = useState(false);

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

  const handleDistanceSelect = (distance) => {
    setSelectedDistance(distance);
    
    if (onDistanceChange) {
      onDistanceChange(distance);
    }
    
    setShowDistanceOptions(false);
  };

  // Get the selected distance label
  const getSelectedDistanceLabel = () => {
    const option = DISTANCE_OPTIONS.find(opt => opt.value === selectedDistance);
    return option ? option.label : DISTANCE_OPTIONS[0].label;
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
        
        <MapboxMap
          style={styles.mapPicker}
          zoomLevel={14}
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

  // Distance options modal
  const DistanceOptionsModal = () => (
    <Modal
      visible={showDistanceOptions}
      animationType="slide"
      transparent={true}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={() => setShowDistanceOptions(false)}
      >
        <View style={styles.distanceModalContainer}>
          <Text style={styles.distanceModalTitle}>Select Distance</Text>
          
          <FlatList
            data={DISTANCE_OPTIONS}
            keyExtractor={(item) => String(item.value || 'any')}
            renderItem={({ item }) => (
              <Pressable
                style={styles.distanceOption}
                onPress={() => handleDistanceSelect(item.value)}
              >
                <Text style={styles.distanceOptionText}>{item.label}</Text>
                {selectedDistance === item.value && (
                  <Check size={20} color={colors.primary} />
                )}
              </Pressable>
            )}
          />
        </View>
      </Pressable>
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

        {/* Distance filter section */}
        <Pressable
          style={styles.distanceFilterButton}
          onPress={() => setShowDistanceOptions(true)}
        >
          <Target size={18} color={colors.primary} />
          <Text style={styles.distanceFilterText}>
            {getSelectedDistanceLabel()}
          </Text>
          <Text style={styles.distanceFilterHint}>
            Tap to change
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
        <DistanceOptionsModal />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.mapButtonContainer}>
          <Pressable
            style={styles.mapButton}
            onPress={() => setShowMapPicker(true)}
          >
            <Navigation size={18} color={colors.primary} />
            <Text style={styles.mapButtonText}>Select on Map</Text>
          </Pressable>
        </View>

        <View style={styles.distanceContainer}>
          <Pressable
            style={styles.distancePicker}
            onPress={() => setShowDistanceOptions(true)}
          >
            <Target size={16} color={colors.primary} />
            <Text style={styles.distanceText}>
              {getSelectedDistanceLabel()}
            </Text>
          </Pressable>
        </View>
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
      <DistanceOptionsModal />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
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
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  customMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customMapButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationItemText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 24,
  },
  mapPickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mapPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  mapPicker: {
    height: 300,
  },
  customLocationContainer: {
    padding: 16,
    gap: 16,
  },
  customLocationInput: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  mapButtonContainer: {
    flex: 1,
    marginRight: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  mapButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  distanceContainer: {
    flex: 1,
  },
  distancePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  distanceModalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '50%',
  },
  distanceModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  distanceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  distanceOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  distanceFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceFilterText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  distanceFilterHint: {
    fontSize: 12,
    color: colors.textLight,
  },
});
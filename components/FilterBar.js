import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { MapPin, Filter, Calendar } from 'lucide-react-native';
import { colors } from '../constants/colors';
import SportDropdown from './SportDropdown';
import LocationInput from './LocationInput';
import FilterModal from './FilterModal';

export default function FilterBar({ 
  sports, 
  selectedSport, 
  onSelectSport,
  selectedLocation,
  onSelectLocation,
  activeFilters,
  onApplyFilters
}) {
  const [showSportModal, setShowSportModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.filterItem} 
        onPress={() => setShowSportModal(true)}
      >
        <Calendar size={16} color={colors.primary} />
        <Text style={styles.filterText} numberOfLines={1}>
          {selectedSport || 'Sport'}
        </Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable 
        style={styles.filterItem} 
        onPress={() => setShowLocationModal(true)}
      >
        <MapPin size={16} color={colors.primary} />
        <Text style={styles.filterText} numberOfLines={1}>
          {selectedLocation || 'Location'}
        </Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable 
        style={styles.filterItem} 
        onPress={() => setShowFilterModal(true)}
      >
        <Filter size={16} color={colors.primary} />
        <Text style={styles.filterText}>
          Filters {Object.keys(activeFilters).length > 0 ? `(${Object.keys(activeFilters).length})` : ''}
        </Text>
      </Pressable>

      {/* Sport Modal */}
      <Modal
        transparent={true}
        visible={showSportModal}
        animationType="fade"
        onRequestClose={() => setShowSportModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSportModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <SportDropdown 
                  sports={sports}
                  selectedSport={selectedSport}
                  onSelectSport={(sport) => {
                    onSelectSport(sport);
                    setShowSportModal(false);
                  }}
                  isModal={true}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Location Modal */}
      <Modal
        transparent={true}
        visible={showLocationModal}
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLocationModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <LocationInput
                  selectedLocation={selectedLocation}
                  onSelectLocation={(location) => {
                    onSelectLocation(location);
                    setShowLocationModal(false);
                  }}
                  isModal={true}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          onApplyFilters(filters);
          setShowFilterModal(false);
        }}
        initialFilters={activeFilters}
        type="games"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    backgroundColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
});
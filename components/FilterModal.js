import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Modal, 
  ScrollView,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { X, Check, Filter, DollarSign, Award } from 'lucide-react-native';
import { colors } from '../constants/colors';

export default function FilterModal({ 
  visible, 
  onClose, 
  onApply, 
  initialFilters = {},
  type = 'games' // 'games' or 'venues'
}) {
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 100]);
  const [selectedLevels, setSelectedLevels] = useState(initialFilters.levels || []);
  
  const LEVELS = ['Beginner Friendly', 'Intermediate', 'Advanced'];
  
  const toggleLevel = (level) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };
  
  const handleApply = () => {
    onApply({
      priceRange,
      levels: selectedLevels
    });
    onClose();
  };
  
  const handleReset = () => {
    setPriceRange([0, 100]);
    setSelectedLevels([]);
  };

  const handlePriceChange = (value) => {
    setPriceRange([priceRange[0], value]);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Filter {type === 'games' ? 'Games' : 'Venues'}</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.text} />
                </Pressable>
              </View>
              
              <ScrollView style={styles.content}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <DollarSign size={20} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Price Range</Text>
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>${priceRange[0]}</Text>
                    <Text style={styles.priceLabel}>${priceRange[1]}</Text>
                  </View>
                  
                  <View style={styles.sliderContainer}>
                    {Platform.OS === 'web' ? (
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                          height: 40,
                        }}
                      />
                    ) : (
                      <View style={styles.customSlider}>
                        <Pressable 
                          style={styles.sliderButton} 
                          onPress={() => handlePriceChange(Math.max(0, priceRange[1] - 10))}
                        >
                          <Text style={styles.sliderButtonText}>-</Text>
                        </Pressable>
                        <View style={styles.sliderTrack}>
                          <View 
                            style={[
                              styles.sliderFill, 
                              { width: `${(priceRange[1] / 100) * 100}%` }
                            ]} 
                          />
                        </View>
                        <Pressable 
                          style={styles.sliderButton} 
                          onPress={() => handlePriceChange(Math.min(100, priceRange[1] + 10))}
                        >
                          <Text style={styles.sliderButtonText}>+</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Award size={20} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Skill Level</Text>
                  </View>
                  
                  <View style={styles.optionsContainer}>
                    {LEVELS.map((level) => (
                      <Pressable
                        key={level}
                        style={[
                          styles.optionButton,
                          selectedLevels.includes(level) && styles.optionButtonSelected
                        ]}
                        onPress={() => toggleLevel(level)}
                      >
                        {selectedLevels.includes(level) && (
                          <Check size={16} color={colors.card} style={styles.checkIcon} />
                        )}
                        <Text style={[
                          styles.optionText,
                          selectedLevels.includes(level) && styles.optionTextSelected
                        ]}>
                          {level}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.footer}>
                <Pressable style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </Pressable>
                <Pressable style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.text,
  },
  sliderContainer: {
    height: 40,
    marginBottom: 16,
  },
  customSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    color: colors.card,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  sliderFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.card,
  },
  checkIcon: {
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    color: colors.textLight,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
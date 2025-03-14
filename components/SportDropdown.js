import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../constants/colors';

export default function SportDropdown({ sports, selectedSport, onSelectSport, isModal = false }) {
  if (isModal) {
    return (
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Select Sport</Text>
        <FlatList
          data={sports}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={styles.sportItem}
              onPress={() => onSelectSport(item)}
            >
              <Text style={styles.sportItemText}>{item}</Text>
              {selectedSport === item && (
                <Check size={20} color={colors.primary} />
              )}
            </Pressable>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={sports}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.sportButton,
              selectedSport === item && styles.selectedSportButton
            ]}
            onPress={() => onSelectSport(item)}
          >
            <Text
              style={[
                styles.sportButtonText,
                selectedSport === item && styles.selectedSportButtonText
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.sportsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sportsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  selectedSportButton: {
    backgroundColor: colors.primary,
  },
  sportButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  selectedSportButtonText: {
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
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sportItemText: {
    fontSize: 16,
    color: colors.text,
  },
});
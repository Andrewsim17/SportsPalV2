import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

export default function CourtSelector({ courts, selectedCourt, onSelectCourt }) {
  if (!courts || courts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No courts available for this sport</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {courts.map(court => (
        <Pressable
          key={court.id}
          style={[
            styles.courtItem,
            selectedCourt?.id === court.id && styles.selectedCourtItem
          ]}
          onPress={() => onSelectCourt(court)}
        >
          <Text style={[
            styles.courtName,
            selectedCourt?.id === court.id && styles.selectedCourtName
          ]}>
            {court.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  courtItem: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedCourtItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  courtName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectedCourtName: {
    color: colors.card,
  },
  emptyContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 14,
  },
});
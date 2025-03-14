import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Star } from 'lucide-react-native';
import { colors } from '../constants/colors';

export default function VenueCard({ venue, onPress }) {
  return (
    <Pressable 
      style={styles.card}
      onPress={onPress}
    >
      <Image
        source={venue.images[0]}
        style={styles.image}
        contentFit="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{venue.name}</Text>
          <View style={styles.rating}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text style={styles.ratingText}>{venue.rating}</Text>
          </View>
        </View>

        <View style={styles.sportsContainer}>
          {venue.sports.map((sport) => (
            <View key={sport} style={styles.sportTag}>
              <Text style={styles.sportText}>{sport}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MapPin size={16} color={colors.textLight} />
            <Text style={styles.infoText}>{venue.distance}</Text>
          </View>
          <Text style={styles.price}>${venue.pricePerHour}/hour</Text>
        </View>

        <Text style={styles.availability}>{venue.availability}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sportsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sportTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sportText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  availability: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
});
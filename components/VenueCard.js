import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';
import { colors } from '../constants/colors';

export default function VenueCard({ venue, onPress }) {
  const [imageError, setImageError] = useState(false);
  
  // Log full venue data 
  console.log("VenueCard received venue:", JSON.stringify(venue));
  
  // Determine the image source, using the first image or a placeholder
  const fallbackImage = 'https://picsum.photos/300/200?text=No+Image';
  const imageUrl = venue?.images && venue.images.length > 0 
    ? venue.images[0] 
    : fallbackImage;
  
  console.log(`VenueCard loading image:`, imageUrl);
  
  // The image source to use (either the venue image or fallback if there was an error)
  const imageSource = { uri: imageError ? fallbackImage : imageUrl };
  
  // Create a detailed location string
  const detailedLocation = `${venue.address || ''}, ${venue.city || ''}, ${venue.state || ''}`.trim();
  const locationDisplay = detailedLocation || 'No location data';
  
  return (
    <Pressable 
      style={styles.card}
      onPress={onPress}
    >
      <Image
        source={imageSource}
        style={styles.image}
        contentFit="cover"
        transition={300}
        onError={(e) => {
          console.error('Image failed to load:', imageUrl, e.nativeEvent);
          setImageError(true);
        }}
        placeholder={{ uri: fallbackImage }}
        recyclingKey={imageUrl}
      />
      
      <View style={styles.content}>
        <Text style={styles.name}>{venue.name}</Text>
        
        <View style={styles.location}>
          <MapPin size={14} color={colors.primary} style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={2}>{locationDisplay}</Text>
        </View>
        
        <View style={styles.sports}>
          {venue.sports && venue.sports.length > 0 ? (
            venue.sports.slice(0, 3).map((sport, index) => (
              <View key={index} style={styles.sport}>
                <Text style={styles.sportText}>{sport}</Text>
              </View>
            ))
          ) : (
            <View style={styles.sport}>
              <Text style={styles.sportText}>No sports</Text>
            </View>
          )}
        </View>
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationIcon: {
    marginTop: 3,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  sports: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sport: {
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
});
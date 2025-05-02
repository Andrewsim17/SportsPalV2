import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { gamesApi } from '../lib/api';
import LocationMap from './LocationMap';
import { colors } from '../constants/colors';
import { MapPin, Calendar } from 'lucide-react-native';
import * as Location from 'expo-location';

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate distance between two points
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

/**
 * A component that shows nearby games on a map
 */
export default function NearbyGamesMap({ style, sport, maxDistance = 20 }) {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [sortedGames, setSortedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // First get user location
  useEffect(() => {
    async function getUserLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (err) {
        console.error('Error getting user location:', err);
      }
    }
    
    getUserLocation();
  }, []);

  // Then fetch games
  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true);
      try {
        // We'll use the existing games API to fetch games
        const filters = sport ? { sport } : {};
        const fetchedGames = await gamesApi.getGames(filters);
        
        // Include games that have either:
        // 1. A venue with latitude and longitude OR
        // 2. Direct latitude and longitude coordinates
        const gamesWithCoords = fetchedGames.filter(
          game => (game.venue && game.venue.latitude && game.venue.longitude) || 
                 (game.latitude && game.longitude)
        );
        
        setGames(gamesWithCoords);
      } catch (err) {
        console.error('Error fetching games for map:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchGames();
  }, [sport]);

  // Sort games by distance when user location is available
  useEffect(() => {
    if (!userLocation || !games.length) {
      setSortedGames([]);
      return;
    }
    
    // Calculate distance for each game using either venue coordinates or direct coordinates
    const gamesWithDistance = games.map(game => {
      const gameLatitude = game.venue?.latitude || game.latitude;
      const gameLongitude = game.venue?.longitude || game.longitude;
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        gameLatitude,
        gameLongitude
      );
      
      return { ...game, distance };
    });
    
    // Filter games by max distance and sort by distance
    const filtered = gamesWithDistance
      .filter(game => game.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    setSortedGames(filtered);
  }, [userLocation, games, maxDistance]);

  // Convert games to map markers
  const markers = sortedGames.map(game => {
    // Use venue coordinates if available, otherwise use game's direct coordinates
    const latitude = game.venue?.latitude || game.latitude;
    const longitude = game.venue?.longitude || game.longitude;
    
    return {
      id: game.id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      title: game.title || 'Game',
      description: `${game.sport} - ${new Date(game.date).toLocaleDateString()}`,
      type: 'game'
    };
  });

  const handleMarkerPress = (markerId) => {
    // Navigate to game detail when marker is pressed
    router.push(`/game/${markerId}`);
  };

  // Helper function to get location display text
  const getLocationText = (game) => {
    if (game.venue && game.venue.name) {
      return `${game.venue.name} (${game.distance.toFixed(1)}km)`;
    } else {
      return `${game.location} (${game.distance.toFixed(1)}km)`;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Games Near You</Text>
      
      <LocationMap
        markers={markers}
        style={styles.map}
        zoomLevel={0.05}
        showUserLocation={true}
        onMarkerPress={handleMarkerPress}
      />
      
      {isLoading && (
        <Text style={styles.statusText}>Finding nearby games...</Text>
      )}
      
      {error && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}
      
      {!isLoading && sortedGames.length === 0 && (
        <Text style={styles.statusText}>No games found nearby</Text>
      )}
      
      {sortedGames.length > 0 && (
        <View style={styles.gamesList}>
          <Text style={styles.resultsText}>
            Found {sortedGames.length} {sortedGames.length === 1 ? 'game' : 'games'} within {maxDistance}km
          </Text>
          
          {sortedGames.slice(0, 3).map(game => (
            <Pressable 
              key={game.id} 
              style={styles.gameItem}
              onPress={() => router.push(`/game/${game.id}`)}
            >
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <View style={styles.gameDetail}>
                  <Calendar size={14} color={colors.primary} />
                  <Text style={styles.gameDate}>
                    {new Date(game.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.gameDetail}>
                  <MapPin size={14} color={colors.textLight} />
                  <Text style={styles.gameLocation}>
                    {getLocationText(game)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
          
          {sortedGames.length > 3 && (
            <Pressable 
              style={styles.viewAllButton}
              onPress={() => router.push('/games')}
            >
              <Text style={styles.viewAllText}>View All Games</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  map: {
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
  },
  statusText: {
    textAlign: 'center',
    color: colors.textLight,
    marginVertical: 8,
  },
  errorText: {
    textAlign: 'center',
    color: colors.danger,
    marginVertical: 8,
  },
  gamesList: {
    marginTop: 8,
  },
  resultsText: {
    color: colors.textLight,
    marginBottom: 8,
    fontSize: 14,
  },
  gameItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  gameDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  gameDate: {
    fontSize: 14,
    color: colors.primary,
  },
  gameLocation: {
    fontSize: 14,
    color: colors.textLight,
  },
  viewAllButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: colors.card,
    fontWeight: '600',
  },
}); 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Text } from 'react-native';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { colors } from '../constants/colors';

// Create a fallback component that will be used if MapboxGL fails to load
const FallbackMapComponent = ({ style, error }) => (
  <View style={[styles.container, style, styles.fallbackContainer]}>
    <Text style={styles.fallbackTitle}>Map Loading Error</Text>
    <Text style={styles.fallbackText}>{error || 'Unable to load map component'}</Text>
    <Text style={styles.fallbackInfo}>This app requires a development build with native code to display maps.</Text>
  </View>
);

// Wrap Mapbox import in try-catch to handle errors
let MapboxGL;
try {
  MapboxGL = require('@rnmapbox/maps');
  // Set your access token here - get one from https://account.mapbox.com/
  MapboxGL.setAccessToken('pk.eyJ1IjoiYW5kcmV3c2ltMTciLCJhIjoiY203enY5MXRqMG8yNjJucTE5MnZsd2Q0cCJ9.c4sXLHAOM2_qQm2b1sQr6A');
} catch (err) {
  console.error('Failed to load Mapbox:', err);
  // MapboxGL will be undefined if it fails to load
}

/**
 * A reusable Mapbox component for SportsPal
 */
export default function MapboxMap({
  initialLatitude,
  initialLongitude,
  markers = [],
  style,
  zoomLevel = 14,
  showUserLocation = true,
  onMarkerPress,
  onLocationSelect,
  draggableMarker = false
}) {
  // If MapboxGL failed to load, return the fallback component
  if (!MapboxGL) {
    return (
      <FallbackMapComponent 
        style={style} 
        error="@rnmapbox/maps native code not available. Please use a development build." 
      />
    );
  }

  const [coordinates, setCoordinates] = useState([
    initialLongitude || 103.8198,
    initialLatitude || 1.3521,
  ]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(showUserLocation);
  const [error, setError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(
    draggableMarker && initialLatitude && initialLongitude 
      ? [initialLongitude, initialLatitude] 
      : null
  );

  useEffect(() => {
    async function getLocationPermission() {
      if (!showUserLocation) return;
      
      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const userCoords = [
            location.coords.longitude, 
            location.coords.latitude
          ];
          setUserLocation(userCoords);
          
          // If no initial position was provided, center on user's location
          if (!initialLatitude || !initialLongitude) {
            setCoordinates(userCoords);
            
            // If this is a draggable marker view, also set the initial marker position
            if (draggableMarker) {
              setSelectedMarker(userCoords);
              
              if (onLocationSelect) {
                onLocationSelect(location.coords.latitude, location.coords.longitude);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error getting location:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    getLocationPermission();
  }, [showUserLocation, initialLatitude, initialLongitude, draggableMarker]);

  const centerOnUserLocation = () => {
    if (userLocation) {
      setCoordinates(userLocation);
      
      // If this is a draggable marker view, also update the marker position
      if (draggableMarker) {
        setSelectedMarker(userLocation);
        
        if (onLocationSelect) {
          onLocationSelect(userLocation[1], userLocation[0]);
        }
      }
    }
  };

  const handleMapPress = (event) => {
    if (draggableMarker) {
      const { coordinates: pressCoords } = event;
      setSelectedMarker(pressCoords);
      
      if (onLocationSelect) {
        onLocationSelect(pressCoords[1], pressCoords[0]);
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView
        style={styles.map}
        onPress={handleMapPress}
        compassEnabled={true}
        zoomEnabled={true}
        rotateEnabled={true}
      >
        <MapboxGL.Camera
          zoomLevel={zoomLevel}
          centerCoordinate={coordinates}
          animationDuration={300}
        />

        {showUserLocation && (
          <MapboxGL.UserLocation visible={true} />
        )}

        {/* Display custom markers */}
        {markers.map((marker, index) => (
          <MapboxGL.PointAnnotation
            key={`marker-${index}`}
            id={`marker-${index}`}
            coordinate={[marker.longitude, marker.latitude]}
            title={marker.title}
            onSelected={() => onMarkerPress && onMarkerPress(marker)}
          />
        ))}

        {/* Display draggable marker if enabled */}
        {draggableMarker && selectedMarker && (
          <MapboxGL.PointAnnotation
            id="draggable-marker"
            coordinate={selectedMarker}
            draggable={true}
            title="Selected Location"
          />
        )}
      </MapboxGL.MapView>

      {showUserLocation && (
        <Pressable 
          style={styles.locationButton}
          onPress={centerOnUserLocation}
        >
          <MapPin size={20} color={colors.primary} />
        </Pressable>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.card,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
  fallbackContainer: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  fallbackInfo: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
}); 
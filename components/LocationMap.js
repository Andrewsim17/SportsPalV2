import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { colors } from '../constants/colors';

/**
 * An advanced map component with current location capability
 */
export default function LocationMap({ 
  initialLatitude, 
  initialLongitude, 
  markers = [],
  style,
  zoomLevel = 0.01,
  showUserLocation = true,
  onRegionChange,
  onMarkerPress,
  onLocationSelect,
  initialRegion = null,
  draggableMarker = false
}) {
  const [region, setRegion] = useState({
    latitude: initialLatitude || (initialRegion?.latitude || 1.3521),
    longitude: initialLongitude || (initialRegion?.longitude || 103.8198),
    latitudeDelta: zoomLevel,
    longitudeDelta: zoomLevel,
  });
  
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(showUserLocation);
  const [error, setError] = useState(null);
  const [customMarker, setCustomMarker] = useState(
    initialRegion ? {
      latitude: initialRegion.latitude,
      longitude: initialRegion.longitude
    } : null
  );
  
  useEffect(() => {
    async function getLocationPermission() {
      if (!showUserLocation) return;
      
      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          // If no initial position was provided and no custom marker exists, center on user's location
          if ((!initialLatitude || !initialLongitude) && !initialRegion && !customMarker) {
            setRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: zoomLevel,
              longitudeDelta: zoomLevel,
            });
            
            // If this is a draggable marker view, also set the initial marker position
            if (draggableMarker) {
              setCustomMarker({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              });
              
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
  }, [showUserLocation, initialLatitude, initialLongitude, zoomLevel, initialRegion, draggableMarker]);
  
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    if (onRegionChange) {
      onRegionChange(newRegion);
    }
  };
  
  const centerOnUserLocation = async () => {
    if (!userLocation) {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        });
        
        // If this is a draggable marker view, also update the marker position
        if (draggableMarker) {
          setCustomMarker({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          
          if (onLocationSelect) {
            onLocationSelect(location.coords.latitude, location.coords.longitude);
          }
        }
      } catch (err) {
        console.error('Error getting location:', err);
      }
    } else {
      setRegion({
        ...region,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      
      // If this is a draggable marker view, also update the marker position
      if (draggableMarker) {
        setCustomMarker({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        });
        
        if (onLocationSelect) {
          onLocationSelect(userLocation.latitude, userLocation.longitude);
        }
      }
    }
  };
  
  const handleMarkerPress = (marker) => {
    if (onMarkerPress && marker.id) {
      onMarkerPress(marker.id);
    }
  };
  
  const handleMapPress = (event) => {
    if (draggableMarker) {
      const { coordinate } = event.nativeEvent;
      setCustomMarker(coordinate);
      
      if (onLocationSelect) {
        onLocationSelect(coordinate.latitude, coordinate.longitude);
      }
    }
  };
  
  const handleDragEnd = (event) => {
    if (draggableMarker) {
      const { coordinate } = event.nativeEvent;
      setCustomMarker(coordinate);
      
      if (onLocationSelect) {
        onLocationSelect(coordinate.latitude, coordinate.longitude);
      }
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={showUserLocation && locationPermission === 'granted'}
        onPress={handleMapPress}
      >
        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
        
        {draggableMarker && customMarker && (
          <Marker
            coordinate={customMarker}
            title="Selected Location"
            draggable={true}
            onDragEnd={handleDragEnd}
            pinColor={colors.primary}
          />
        )}
      </MapView>
      
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
    width: '100%',
    height: '100%',
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
}); 
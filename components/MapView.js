import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../constants/colors';

/**
 * A reusable map component for the SportsPal app
 * @param {Object} props
 * @param {number} props.latitude - Location latitude
 * @param {number} props.longitude - Location longitude
 * @param {string} props.title - Title for the marker
 * @param {string} props.description - Description for the marker
 * @param {Object} props.style - Additional styles for the container
 * @param {number} props.zoomLevel - Zoom level (smaller value = more zoomed out)
 */
export default function SportsPalMap({ 
  latitude, 
  longitude, 
  title, 
  description,
  style,
  zoomLevel = 0.01,
  showMarker = true,
}) {
  // Default to a location if none provided
  const mapLatitude = latitude || 1.3521;
  const mapLongitude = longitude || 103.8198;
  
  const initialRegion = {
    latitude: mapLatitude,
    longitude: mapLongitude,
    latitudeDelta: zoomLevel,
    longitudeDelta: zoomLevel,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView 
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
      >
        {showMarker && (
          <Marker
            coordinate={{
              latitude: mapLatitude,
              longitude: mapLongitude,
            }}
            title={title || 'Location'}
            description={description}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
}); 
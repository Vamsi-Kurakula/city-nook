import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../../context/ThemeContext';
import { LocationCoordinates } from '../../../utils/coordinateExtractor';

interface CrossPlatformMapProps {
  coordinates: LocationCoordinates[];
  isLoading: boolean;
  error: string | null;
  onStopPress: (stopNumber: number) => void;
}

const CrossPlatformMap: React.FC<CrossPlatformMapProps> = ({ coordinates, isLoading, error, onStopPress }) => {
  const [mapReady, setMapReady] = useState(false);
  const { theme } = useTheme();

  // Platform-specific region settings
  const testRegion = Platform.select({
    ios: {
      latitude: 41.8858124,
      longitude: -87.6325022,
      latitudeDelta: 0.01, // iOS works well with smaller deltas
      longitudeDelta: 0.01,
    },
    android: {
      latitude: 41.8858124,
      longitude: -87.6325022,
      latitudeDelta: 0.02, // Android works better with larger deltas
      longitudeDelta: 0.02,
    },
  });

  const handleMapReady = () => {
    console.log(`${Platform.OS}: Map is ready`);
    setMapReady(true);
    Alert.alert('Success', `${Platform.OS} map loaded successfully!`);
  };

  const handleMapError = (error: any) => {
    console.error(`${Platform.OS}: Map error:`, error);
    Alert.alert('Map Error', `${Platform.OS} map failed to load: ${error?.message || 'Unknown error'}`);
  };

  // Add loading and error states
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.status, { color: theme.text.secondary }]}>
          {Platform.OS}: Loading coordinates...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.status, { color: theme.status.error }]}>
          {Platform.OS} Error: {error}
        </Text>
      </View>
    );
  }

  // Platform-specific region calculation
  const region = coordinates.length > 0 ? Platform.select({
    ios: {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.01, // iOS prefers smaller deltas
      longitudeDelta: 0.01,
    },
    android: {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.02, // Android prefers larger deltas
      longitudeDelta: 0.02,
    },
  }) : testRegion;

  return (
    <View style={styles.container}>
      <Text style={[styles.status, { color: theme.text.secondary }]}>
        {Platform.OS}: Coordinates: {coordinates.length} | Map Status: {mapReady ? 'Ready' : 'Loading...'}
      </Text>
      
              <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onMapReady={handleMapReady}
          onError={handleMapError}
        // Platform-specific optimizations
        {...Platform.select({
          ios: {
            showsCompass: true,
            showsScale: true,
            showsBuildings: true,
            mapType: 'standard',
          },
          android: {
            showsCompass: true,
            showsScale: true,
            showsBuildings: true,
            mapType: 'standard',
            // Android-specific properties
            removeClippedSubviews: false,
            maxZoomLevel: 20,
            minZoomLevel: 3,
            cacheEnabled: true,
          },
        })}
              >
          {coordinates.map((coord, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: coord.latitude,
                longitude: coord.longitude,
              }}
              title={`Stop ${coord.stopNumber}`}
              description={`${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}`}
              onPress={() => onStopPress(coord.stopNumber)}
            />
          ))}
        </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    // Platform-specific styling
    ...Platform.select({
      ios: {
        // iOS-specific map styling
      },
      android: {
        // Android-specific map styling
      },
    }),
  },
});

export default CrossPlatformMap;

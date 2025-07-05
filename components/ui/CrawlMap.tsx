import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { CrawlStop } from '../../types/crawl';
import { LocationCoordinates } from '../../utils/coordinateExtractor';

interface CrawlMapProps {
  stops: CrawlStop[];
  currentStopNumber: number;
  completedStops: number[];
  isNextStopRevealed: boolean;
  coordinates?: LocationCoordinates[]; // Pre-extracted coordinates
}



const CrawlMap: React.FC<CrawlMapProps> = ({ 
  stops, 
  currentStopNumber, 
  completedStops, 
  isNextStopRevealed,
  coordinates 
}) => {
  const [locations, setLocations] = useState<LocationCoordinates[]>([]);
  const [region, setRegion] = useState({
    latitude: 40.7128, // Default to NYC
    longitude: -74.0060,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

        // Use pre-extracted coordinates or extract them if not provided
  useEffect(() => {
    if (coordinates) {
      // Use pre-extracted coordinates
      console.log('Using pre-extracted coordinates:', coordinates.length);
      setLocations(coordinates);
      
      // Set initial region to show all locations
      if (coordinates.length > 0) {
        const latitudes = coordinates.map(loc => loc.latitude);
        const longitudes = coordinates.map(loc => loc.longitude);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5,
          longitudeDelta: (maxLng - minLng) * 1.5,
        });
      }
    } else {
      // Fallback: extract coordinates on-demand (for backward compatibility)
      console.log('No pre-extracted coordinates provided, extracting on-demand');
      setLocations([]);
    }
  }, [coordinates]);

  const getMarkerColor = (stopNumber: number) => {
    if (completedStops.includes(stopNumber)) {
      return '#4CAF50'; // Green for completed
    } else if (stopNumber === currentStopNumber) {
      return '#FF9800'; // Orange for current
    } else {
      return '#9E9E9E'; // Gray for locked (shouldn't be visible now)
    }
  };

  const getVisibleLocations = () => {
    // Only show completed and current locations
    const visible = locations.filter(location => {
      const stopNumber = location.stopNumber;
      return completedStops.includes(stopNumber) || stopNumber === currentStopNumber;
    });
    console.log('Visible locations (completed + current):', visible);
    return visible;
  };

  const getRouteCoordinates = () => {
    const allLocations = getVisibleLocations();
    return allLocations
      .sort((a, b) => a.stopNumber - b.stopNumber)
      .map(location => ({
        latitude: location.latitude,
        longitude: location.longitude,
      }));
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {getVisibleLocations().map((location) => (
          <Marker
            key={location.stopNumber}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.title}
            description={`Stop ${location.stopNumber}`}
            pinColor={getMarkerColor(location.stopNumber)}
          />
        ))}
        
        {/* Draw route line between visible stops */}
        {getRouteCoordinates().length > 1 && (
          <Polyline
            coordinates={getRouteCoordinates()}
            strokeColor="#007AFF"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Current</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  legendText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },

});

export default CrawlMap; 
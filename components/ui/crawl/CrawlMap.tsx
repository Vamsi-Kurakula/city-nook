import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { CrawlStop } from '../../../types/crawl';
import { LocationCoordinates } from '../../../utils/coordinateExtractor';
import { useTheme } from '../../context/ThemeContext';

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
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return <Text style={{ color: 'red', padding: 20 }}>Map Error: {error.message}</Text>;
  }

  try {
    console.log('CrawlMap props:', { stops, currentStopNumber, completedStops, isNextStopRevealed, coordinates });

    // Defensive checks
    if (!Array.isArray(stops) || !Array.isArray(completedStops) || (coordinates && !Array.isArray(coordinates))) {
      return <Text>Invalid data passed to map (stops, completedStops, or coordinates not arrays)</Text>;
    }

    const { theme, themeType } = useTheme();
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
        return theme.button.success || '#4CAF50'; // Green for completed
      } else if (stopNumber === currentStopNumber) {
        return theme.button.primary || '#FF9800'; // Primary color for current
      } else {
        return theme.button.disabled || '#9E9E9E'; // Disabled color for locked
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

    // Map style for dark/light theme
    const mapStyle = themeType === 'dark' ? [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#1a1a1a"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#cccccc"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#1a1a1a"
          }
        ]
      },
      {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#2d2d2d"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#30D158"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#3a3a3a"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#2d2d2d"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#cccccc"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#4a4a4a"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#3a3a3a"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#3a3a3a"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#17263c"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#515c6d"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#17263c"
          }
        ]
      }
    ] : [];

    console.log('Legend theme values:', {
      buttonSuccess: theme.button.success,
      buttonPrimary: theme.button.primary,
      borderPrimary: theme.border.primary,
      backgroundPrimary: theme.background.primary,
      textPrimary: theme.text.primary,
    });

    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          customMapStyle={themeType === 'dark' ? mapStyle : undefined}
          mapType="standard"
          loadingEnabled={true}
          loadingIndicatorColor={theme.button.primary}
          loadingBackgroundColor={theme.background.primary}
        >
          {/* Wrap all children in a fragment to avoid stray arrays or commas */}
          <>
            {getVisibleLocations().map((location) => {
              // Defensive: ensure title and stopNumber are correct types
              console.log('Rendering Marker location:', location);
              const markerTitle = typeof location.title === 'string' ? location.title : JSON.stringify(location.title);
              const markerDescription = typeof location.stopNumber === 'number' ? `Stop ${location.stopNumber}` : String(location.stopNumber);
              if (typeof location.title !== 'string' || typeof location.stopNumber !== 'number') {
                return <Marker key={location.stopNumber || Math.random()} coordinate={{ latitude: location.latitude, longitude: location.longitude }} title={markerTitle} description={markerDescription} pinColor={getMarkerColor(location.stopNumber)} />;
              }
              return (
                <Marker
                  key={location.stopNumber}
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={markerTitle}
                  description={markerDescription}
                  pinColor={getMarkerColor(location.stopNumber)}
                />
              );
            })}
            {/* Draw route line between visible stops */}
            {getRouteCoordinates().length > 1 && (
              <Polyline
                coordinates={getRouteCoordinates()}
                strokeColor={theme.button.primary || "#007AFF"}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
          </>
        </MapView>
        
        {/* Minimal legend for debugging */}
        <View style={[styles.legend, { backgroundColor: theme.background.primary }]}> 
          <Text style={[styles.legendTitle, { color: theme.text.primary }]}>Legend:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.button.success || '#4CAF50', borderColor: theme.border.primary }]} />
            <Text style={[styles.legendText, { color: theme.text.primary }]}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.button.primary || '#FF9800', borderColor: theme.border.primary }]} />
            <Text style={[styles.legendText, { color: theme.text.primary }]}>Current</Text>
          </View>
        </View>
      </View>
    );
  } catch (err) {
    setError(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    opacity: 1,
    zIndex: 1,
  },
  map: {
    flex: 1,
    backgroundColor: '#ffffff',
    opacity: 1,
    zIndex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
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
    borderWidth: 1,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
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
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
  },

});

export default CrawlMap; 
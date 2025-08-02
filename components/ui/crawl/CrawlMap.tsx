import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated, Alert } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { CrawlStop } from '../../../types/crawl';
import { LocationCoordinates } from '../../../utils/coordinateExtractor';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { saveCrawlProgress } from '../../../utils/database/progressOperations';
import { getRoadRouteForStops } from '../../../utils/roadDirections';
import { GOOGLE_MAPS_API_KEY_CONFIG } from '../../../utils/config';

interface CrawlMapProps {
  stops: CrawlStop[];
  currentStopNumber: number;
  completedStops: number[];
  isNextStopRevealed: boolean;
  coordinates?: LocationCoordinates[];
  crawl?: any;
}

const CrawlMap: React.FC<CrawlMapProps> = ({ 
  stops, 
  currentStopNumber, 
  completedStops, 
  isNextStopRevealed,
  coordinates,
  crawl
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [selectedStop, setSelectedStop] = useState<{ stop: CrawlStop; stopNumber: number } | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const navigation = useNavigation<any>();
  const { theme, themeType } = useTheme();
  const { user } = useAuthContext();
  const { getToken } = useAuth();
  
  // Animation values for slide-up effects
  const slideAnim = useRef(new Animated.Value(0)).current;
  const completionSlideAnim = useRef(new Animated.Value(-200)).current;

  if (error) {
    return <Text style={{ color: 'red', padding: 20 }}>Map Error: {error.message}</Text>;
  }

  try {
    console.log('CrawlMap props:', { stops, currentStopNumber, completedStops, isNextStopRevealed, coordinates });

    // Defensive checks
    if (!Array.isArray(stops) || !Array.isArray(completedStops) || (coordinates && !Array.isArray(coordinates))) {
      return <Text>Invalid data passed to map (stops, completedStops, or coordinates not arrays)</Text>;
    }

    const [locations, setLocations] = useState<LocationCoordinates[]>([]);
    const [region, setRegion] = useState<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    } | undefined>(undefined);
    const [roadRouteCoordinates, setRoadRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Use pre-extracted coordinates or extract them if not provided
    useEffect(() => {
      if (coordinates) {
        // Use pre-extracted coordinates
        console.log('Using pre-extracted coordinates:', coordinates.length);
        setLocations(coordinates);
        
        // Set initial region to show all revealed stops
        if (coordinates.length > 0) {
          // Get all revealed stops (completed + current)
          const revealedStops = coordinates.filter(loc => 
            completedStops.includes(loc.stopNumber) || loc.stopNumber === currentStopNumber
          );
          
          if (revealedStops.length > 0) {
            // Calculate region to show all revealed stops
            const latitudes = revealedStops.map(loc => loc.latitude);
            const longitudes = revealedStops.map(loc => loc.longitude);
            
            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);
            
            // Add some padding around the stops
            const latPadding = (maxLat - minLat) * 0.2;
            const lngPadding = (maxLng - minLng) * 0.2;
            
            setRegion({
              latitude: (minLat + maxLat) / 2,
              longitude: (minLng + maxLng) / 2,
              latitudeDelta: Math.max((maxLat - minLat) + latPadding, 0.01), // Ensure minimum zoom
              longitudeDelta: Math.max((maxLng - minLng) + lngPadding, 0.01),
            });
            console.log('Setting region to show all revealed stops:', revealedStops.length, 'stops');
          } else {
            // Fallback: center on first stop if no revealed stops
            const firstLocation = coordinates[0];
            setRegion({
              latitude: firstLocation.latitude,
              longitude: firstLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            console.log('Centering map on first stop (fallback):', firstLocation);
          }
        }
      } else {
        // Fallback: extract coordinates on-demand (for backward compatibility)
        console.log('No pre-extracted coordinates provided, extracting on-demand');
        setLocations([]);
      }
    }, [coordinates]);

    // Update region when current stop or completed stops change
    useEffect(() => {
      if (locations.length > 0) {
        // Get all revealed stops (completed + current)
        const revealedStops = locations.filter(loc => 
          completedStops.includes(loc.stopNumber) || loc.stopNumber === currentStopNumber
        );
        
        if (revealedStops.length > 0) {
          // Calculate region to show all revealed stops
          const latitudes = revealedStops.map(loc => loc.latitude);
          const longitudes = revealedStops.map(loc => loc.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          
          // Add some padding around the stops
          const latPadding = (maxLat - minLat) * 0.2;
          const lngPadding = (maxLng - minLng) * 0.2;
          
          setRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max((maxLat - minLat) + latPadding, 0.01), // Ensure minimum zoom
            longitudeDelta: Math.max((maxLng - minLng) + lngPadding, 0.01),
          });
          console.log('Updated region to show all revealed stops:', revealedStops.length, 'stops');
        }
      }
    }, [currentStopNumber, completedStops, locations]);

    // Calculate road route when visible locations change
    useEffect(() => {
      const calculateRoadRoute = async () => {
        const visibleLocations = getVisibleLocations();
        
        console.log('🛣️ calculateRoadRoute called with:', {
          visibleLocationsCount: visibleLocations.length,
          apiKey: GOOGLE_MAPS_API_KEY_CONFIG ? 'SET' : 'NOT SET',
          apiKeyLength: GOOGLE_MAPS_API_KEY_CONFIG?.length || 0
        });
        
        if (visibleLocations.length < 2) {
          console.log('🛣️ Not enough locations for route calculation');
          setRoadRouteCoordinates([]);
          return;
        }

        setIsLoadingRoute(true);
        
        try {
          // Sort locations by stop number
          const sortedLocations = visibleLocations
            .sort((a, b) => a.stopNumber - b.stopNumber)
            .map(location => ({
              latitude: location.latitude,
              longitude: location.longitude,
            }));

          console.log('🛣️ Sorted locations for route:', sortedLocations);

          // Get road route for all visible stops
          const roadRoute = await getRoadRouteForStops(sortedLocations, GOOGLE_MAPS_API_KEY_CONFIG);
          setRoadRouteCoordinates(roadRoute);
          
          console.log('🛣️ Road route calculated:', roadRoute.length, 'coordinates');
        } catch (error) {
          console.error('❌ Error calculating road route:', error);
          // Fallback to straight lines
          setRoadRouteCoordinates([]);
        } finally {
          setIsLoadingRoute(false);
        }
      };

      calculateRoadRoute();
    }, [completedStops, currentStopNumber, locations]);

    // Check if crawl is completed
    const isCrawlCompleted = completedStops.length === stops.length;
    
    // Show completion modal when crawl is completed
    useEffect(() => {
      if (isCrawlCompleted && !showCompletionModal) {
        console.log('Crawl completed! Showing completion modal');
        setShowCompletionModal(true);
        Animated.timing(completionSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    }, [isCrawlCompleted, showCompletionModal]);

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
      // If we have road route coordinates, use them
      if (roadRouteCoordinates.length > 0) {
        console.log('🛣️ Using road route coordinates:', roadRouteCoordinates.length, 'points');
        console.log('🛣️ First road coordinate:', roadRouteCoordinates[0]);
        console.log('🛣️ Last road coordinate:', roadRouteCoordinates[roadRouteCoordinates.length - 1]);
        return roadRouteCoordinates;
      }
      
      // Fallback to straight lines
      const allLocations = getVisibleLocations();
      const straightLineCoords = allLocations
        .sort((a, b) => a.stopNumber - b.stopNumber)
        .map(location => ({
          latitude: location.latitude,
          longitude: location.longitude,
        }));
      
      console.log('🛣️ Using straight line coordinates:', straightLineCoords);
      return straightLineCoords;
    };

    const handleMarkerPress = (location: LocationCoordinates, event: any) => {
      const stop = stops.find(s => s.stop_number === location.stopNumber);
      
      if (stop) {
        setSelectedStop({ stop, stopNumber: location.stopNumber });
        setShowActionModal(true);
        // Animate slide up
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }).start();
      }
    };

    const handleRecsPress = () => {
      if (selectedStop) {
        // Animate slide down
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setShowActionModal(false);
          setSelectedStop(null);
        });
        
        navigation.navigate('CrawlRecs', {
          crawl,
          stop: selectedStop.stop,
          stopNumber: selectedStop.stopNumber,
        });
      }
    };

    const handleClosePanel = () => {
      // Animate slide down
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowActionModal(false);
        setSelectedStop(null);
      });
    };

    const handleCloseCompletionModal = () => {
      Animated.timing(completionSlideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowCompletionModal(false);
      });
    };

    const handleCompleteCrawl = async () => {
      console.log('Completing crawl and saving progress');
      
      try {
        if (!user?.id || !crawl) {
          console.error('Missing user or crawl data');
          handleCloseCompletionModal();
          navigation.navigate('Home');
          return;
        }
        
        const token = await getToken({ template: 'supabase' });
        if (!token) {
          console.error('No authentication token');
          handleCloseCompletionModal();
          navigation.navigate('Home');
          return;
        }
        
        // Save the crawl as completed
        const completionData = {
          userId: user.id,
          crawlId: crawl.id,
          isPublic: crawl['public-crawl'] || false,
          currentStop: stops.length, // Set to total number of stops
          completedStops: Array.from({ length: stops.length }, (_, i) => i + 1), // All stops completed
          startedAt: new Date().toISOString(), // You might want to get the actual start time
          completedAt: new Date().toISOString(), // Mark as completed
          token
        };
        
        console.log('Saving crawl completion:', completionData);
        const { error } = await saveCrawlProgress(completionData);
        
        if (error) {
          console.error('Error saving crawl completion:', error);
          Alert.alert('Error', 'Failed to save crawl completion');
          return;
        }
        
        console.log('Crawl completion saved successfully');
        
        // Close modal first
        handleCloseCompletionModal();
        
        // Use setTimeout to avoid React warnings about scheduling updates during render
        setTimeout(() => {
          navigation.navigate('Home');
        }, 100);
        
      } catch (error) {
        console.error('Error in handleCompleteCrawl:', error);
        Alert.alert('Error', 'Failed to complete crawl');
        handleCloseCompletionModal();
        
        // Use setTimeout to avoid React warnings about scheduling updates during render
        setTimeout(() => {
          navigation.navigate('Home');
        }, 100);
      }
    };

    const handleStartPress = () => {
      if (selectedStop) {
        // Check if stop is already completed
        if (completedStops.includes(selectedStop.stopNumber)) {
          // Show completion message
          Alert.alert(
            'Challenge Completed',
            `You have already completed Stop ${selectedStop.stopNumber}. The challenge has been solved!`,
            [{ text: 'OK' }]
          );
          
          // Animate slide down
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setShowActionModal(false);
            setSelectedStop(null);
          });
        } else {
          // Navigate to start stop screen for incomplete stops
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setShowActionModal(false);
            setSelectedStop(null);
          });
          
          navigation.navigate('CrawlStartStop', {
            crawl,
            stop: selectedStop.stop,
            stopNumber: selectedStop.stopNumber,
          });
        }
      }
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

    // Show loading state while region is being calculated
    if (!region) {
      return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
          <View style={styles.mapPlaceholder}>
            <Text style={[styles.mapPlaceholderText, { color: theme.text.secondary }]}>
              Loading map...
            </Text>
          </View>
        </View>
      );
    }

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
          onPress={() => {
            if (showActionModal) {
              handleClosePanel();
            }
          }}
        >
          {/* Wrap all children in a fragment to avoid stray arrays or commas */}
          <>
            {getVisibleLocations().map((location) => {
              // Defensive: ensure title and stopNumber are correct types
              const markerTitle = typeof location.title === 'string' ? location.title : JSON.stringify(location.title);
              const markerDescription = typeof location.stopNumber === 'number' ? `Stop ${location.stopNumber}` : String(location.stopNumber);
              if (typeof location.title !== 'string' || typeof location.stopNumber !== 'number') {
                return <Marker key={location.stopNumber || Math.random()} coordinate={{ latitude: location.latitude, longitude: location.longitude }} title={markerTitle} description={markerDescription} pinColor={getMarkerColor(location.stopNumber)} onPress={(event) => handleMarkerPress(location, event)} />;
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
                  onPress={(event) => handleMarkerPress(location, event)}
                />
              );
            })}
            {/* Draw route line between visible stops */}
            {(() => {
              const routeCoords = getRouteCoordinates();
              console.log('🛣️ Rendering Polyline with coordinates:', routeCoords.length, 'points');
              if (routeCoords.length > 0) {
                console.log('🛣️ First polyline coord:', routeCoords[0]);
                console.log('🛣️ Last polyline coord:', routeCoords[routeCoords.length - 1]);
              }
              
              return routeCoords.length > 1 ? (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor={isLoadingRoute ? theme.text.tertiary || "#9E9E9E" : theme.button.primary || "#007AFF"}
                  strokeWidth={isLoadingRoute ? 2 : 3}
                  lineDashPattern={isLoadingRoute ? [10, 5] : [5, 5]}
                />
              ) : null;
            })()}
          </>
        </MapView>
        
        {/* Legend positioned over the map */}
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
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.button.disabled || '#9E9E9E', borderColor: theme.border.primary }]} />
            <Text style={[styles.legendText, { color: theme.text.primary }]}>Available</Text>
          </View>
          {isLoadingRoute && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.text.tertiary || '#9E9E9E', borderColor: theme.border.primary }]} />
              <Text style={[styles.legendText, { color: theme.text.primary }]}>Calculating Route...</Text>
            </View>
          )}
        </View>



        {/* Slide-up action panel */}
        {showActionModal && selectedStop && (
          <Animated.View 
            style={[
              styles.actionPanel, 
              { 
                backgroundColor: theme.background.primary,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0], // Slide up from 300px below to 0
                  })
                }]
              }
            ]}
          >
            <View style={styles.actionPanelHeader}>
              <Text style={[styles.actionPanelTitle, { color: theme.text.primary }]}>
                {selectedStop.stop.location_name || `Stop ${selectedStop.stopNumber}`}
              </Text>
              <TouchableOpacity
                style={styles.actionPanelCloseButton}
                onPress={handleClosePanel}
              >
                <Text style={[styles.actionPanelCloseText, { color: theme.text.secondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Show completion status */}
            {completedStops.includes(selectedStop.stopNumber) && (
              <View style={styles.completionStatus}>
                <Text style={[styles.completionStatusText, { color: theme.status.success }]}>
                  ✅ Completed
                </Text>
              </View>
            )}
            
            <View style={styles.actionPanelButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.button.primary }]}
                onPress={handleRecsPress}
              >
                <Text style={[styles.actionButtonText, { color: theme.text.button }]}>
                  Recs
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  { 
                    backgroundColor: completedStops.includes(selectedStop.stopNumber) 
                      ? theme.button.disabled || '#9E9E9E'
                      : theme.button.secondary || '#6c757d'
                  }
                ]}
                onPress={handleStartPress}
              >
                <Text style={[
                  styles.actionButtonText, 
                  { 
                    color: completedStops.includes(selectedStop.stopNumber)
                      ? theme.text.disabled
                      : theme.text.button
                  }
                ]}>
                  {completedStops.includes(selectedStop.stopNumber) ? 'Completed' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Completion modal - slides down from top */}
        {showCompletionModal && (
          <Animated.View
            style={[
              styles.completionModal,
              {
                backgroundColor: theme.background.primary,
                transform: [{
                  translateY: completionSlideAnim
                }]
              }
            ]}
          >
            <View style={styles.completionModalContent}>
              <Text style={[styles.completionTitle, { color: theme.text.primary }]}>
                🎉 Congratulations! Crawl Complete
              </Text>
              <Text style={[styles.completionMessage, { color: theme.text.secondary }]}>
                You've successfully completed all stops in this crawl!
              </Text>
              
              <TouchableOpacity
                style={[styles.completionButton, { backgroundColor: theme.button.primary }]}
                onPress={handleCompleteCrawl}
              >
                <Text style={[styles.completionButtonText, { color: theme.text.button }]}>
                  Close & Save Progress
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

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
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
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
  calloutContainer: {
    position: 'absolute',
    padding: 16,
    borderRadius: 12,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  calloutButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  calloutButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  calloutButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calloutCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calloutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  nativeCalloutContainer: {
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  nativeCalloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  nativeCalloutButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  nativeCalloutButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nativeCalloutButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tooltipContainer: {
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  tooltipButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tooltipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tooltipCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  actionPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  actionPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  actionPanelCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionPanelCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionPanelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  completionStatus: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  completionStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },

  completionModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1001,
  },
  completionModalContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  completionButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrawlMap; 
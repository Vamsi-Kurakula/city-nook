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
import { useSafeAnimation } from '../../hooks/useSafeAnimation';

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
  const { animValue: slideAnim, animate: animateSlide } = useSafeAnimation(0);
  const { animValue: completionSlideAnim, animate: animateCompletion } = useSafeAnimation(-200);

  const [locations, setLocations] = useState<LocationCoordinates[]>([]);
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | undefined>(undefined);
  const [roadRouteCoordinates, setRoadRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Debug logging
  console.log('CrawlMap Debug:', {
    stopsCount: stops?.length,
    coordinatesCount: coordinates?.length,
    currentStopNumber,
    completedStops,
    locationsCount: locations.length,
    hasRegion: !!region,
    error: error?.message
  });

  // Cleanup is handled by useSafeAnimation hook

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: theme.status.error }]}>
          Map Error: {error.message}
        </Text>
        <Text style={[styles.errorSubtext, { color: theme.text.secondary }]}>
          Please try refreshing the screen or contact support.
        </Text>
      </View>
    );
  }

  try {
    // Defensive checks
    if (!Array.isArray(stops) || !Array.isArray(completedStops) || (coordinates && !Array.isArray(coordinates))) {
      return (
        <View style={[styles.container, styles.errorContainer]}>
          <Text style={[styles.errorText, { color: theme.status.error }]}>
            Invalid data passed to map
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.text.secondary }]}>
            Stops, completedStops, or coordinates are not arrays
          </Text>
        </View>
      );
    }

    // Use pre-extracted coordinates or extract them if not provided
    useEffect(() => {
      if (coordinates) {
        // Use pre-extracted coordinates
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
          }
        } else {
          // Fallback to first location if no revealed stops
          const firstLocation = coordinates[0];
          if (firstLocation) {
            setRegion({
              latitude: firstLocation.latitude,
              longitude: firstLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      } else {
        // No pre-extracted coordinates provided, show fallback
        console.log('No coordinates provided to CrawlMap');
        setError(new Error('No coordinates available for map display'));
      }
    }, [coordinates, completedStops, currentStopNumber]);

    // Update region when revealed stops change
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
            latitudeDelta: Math.max((maxLat - minLat) + latPadding, 0.01),
            longitudeDelta: Math.max((maxLng - minLng) + lngPadding, 0.01),
          });
        }
      }
    }, [locations, completedStops, currentStopNumber]);

    // Calculate road route when visible locations change
    useEffect(() => {
      const calculateRoadRoute = async () => {
        const visibleLocations = getVisibleLocations();
        
        if (visibleLocations.length < 2) {
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

          // Get road route for all visible stops
          const roadRoute = await getRoadRouteForStops(sortedLocations, GOOGLE_MAPS_API_KEY_CONFIG);
          setRoadRouteCoordinates(roadRoute);
        } catch (error) {
          console.error('Error calculating road route:', error);
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
      return locations.filter(loc => 
        completedStops.includes(loc.stopNumber) || 
        loc.stopNumber === currentStopNumber
      );
    };

    const getRouteCoordinates = () => {
      // If we have road route coordinates, use them
      if (roadRouteCoordinates.length > 0) {
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
      
      return straightLineCoords;
    };

    const handleMarkerPress = (location: LocationCoordinates, event: any) => {
      const stop = stops.find(s => s.stop_number === location.stopNumber);
      
      if (stop) {
        setSelectedStop({ stop, stopNumber: location.stopNumber });
        setShowActionModal(true);
        
        // Animate slide up using safe animation
        animateSlide(1, { duration: 400 });
      }
    };

    const handleRecsPress = () => {
      if (selectedStop) {
        // Animate slide down using safe animation
        animateSlide(0, { duration: 300 }, () => {
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
      // Animate slide down using safe animation
      animateSlide(0, { duration: 300 }, () => {
        setShowActionModal(false);
        setSelectedStop(null);
      });
    };

    const handleCloseCompletionModal = () => {
      // Animate completion modal using safe animation
      animateCompletion(-200, { duration: 300 }, () => {
        setShowCompletionModal(false);
      });
    };

    const handleCompleteCrawl = async () => {
      if (!user?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) {
          Alert.alert('Error', 'Could not get authentication token');
          return;
        }

        // Save completion data
        const completionData = {
          crawlId: crawl?.id || 'unknown',
          isPublic: crawl?.is_public || false,
          currentStop: stops.length,
          completedStops: Array.from({ length: stops.length }, (_, i) => i + 1),
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };

        const result = await saveCrawlProgress({
          ...completionData,
          userId: user.id,
          token,
        });

        if (result.error) {
          Alert.alert('Error', 'Failed to save crawl completion');
          return;
        }

        // Navigate to completion screen
        navigation.navigate('CrawlCompletion', {
          crawlName: crawl?.name || 'Crawl',
          completionData,
        });
      } catch (error) {
        console.error('Error completing crawl:', error);
        Alert.alert('Error', 'Failed to complete crawl');
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
          // Animate slide down using safe animation
          animateSlide(0, { duration: 300 }, () => {
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

    // If no region is set, show loading state
    if (!region) {
      return (
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading map...
          </Text>
        </View>
      );
    }

    // Rest of the component remains the same...
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={true}
          mapType="standard"
          customMapStyle={themeType === 'dark' ? [
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
          ] : undefined}
        >
          {/* Render markers for visible locations */}
          {getVisibleLocations().map((location) => (
            <Marker
              key={location.stopNumber}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              onPress={(event) => handleMarkerPress(location, event)}
            >
              <View style={[styles.customMarker, { backgroundColor: getMarkerColor(location.stopNumber) }]}>
                <Text style={styles.markerText}>{location.stopNumber}</Text>
              </View>
            </Marker>
          ))}

          {/* Render route polyline */}
          {getRouteCoordinates().length > 1 && (
            <Polyline
              coordinates={getRouteCoordinates()}
              strokeColor={isLoadingRoute ? theme.text.tertiary || "#9E9E9E" : theme.button.primary || "#007AFF"}
              strokeWidth={isLoadingRoute ? 2 : 3}
              lineDashPattern={isLoadingRoute ? [10, 5] : [5, 5]}
            />
          )}
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
  } catch (error) {
    console.error('Error in CrawlMap component:', error);
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: theme.status.error }]}>
          Map Error: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
        <Text style={[styles.errorSubtext, { color: theme.text.secondary }]}>
          Please try refreshing the screen or contact support.
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
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
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayNoBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    gap: 15,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '40%',
  },
  completionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  completionModalBody: {
    gap: 20,
  },
  completionModalText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  completionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  completionButtonText: {
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
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  completionMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
});

export default CrawlMap; 
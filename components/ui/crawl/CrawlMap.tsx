import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { CrawlStop } from '../../../types/crawl';
import { LocationCoordinates, extractAllCoordinates } from '../../../utils/coordinateExtractor';
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
  
  // Add map ref for proper cleanup
  const mapRef = useRef<MapView>(null);
  
  // Track if component is unmounting to prevent cleanup loops
  const isUnmountingRef = useRef(false);
  
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
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadTimeout, setMapLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debug logging
  console.log('CrawlMap Debug:', {
    stopsCount: stops?.length,
    coordinatesCount: coordinates?.length,
    currentStopNumber,
    completedStops,
    locationsCount: locations.length,
    hasRegion: !!region,
    mapReady,
    error: error?.message
  });

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      // Clear any existing timeout
      if (mapLoadTimeout) {
        clearTimeout(mapLoadTimeout);
      }
      
      // Set a new timeout - if map doesn't load in 10 seconds, show error
      const timeout = setTimeout(() => {
        if (!region && !error) {
          console.log('Map load timeout - showing error');
          setError(new Error('Map failed to load within timeout period. Please try refreshing.'));
        }
      }, 10000);
      
      setMapLoadTimeout(timeout);
      
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [coordinates]);

  // Fallback region initialization for Android
  useEffect(() => {
    if (Platform.OS === 'android' && coordinates && coordinates.length > 0 && !region) {
      console.log('Android fallback: Setting initial region');
      const firstLocation = coordinates[0];
      if (firstLocation) {
        const fallbackRegion = {
          latitude: firstLocation.latitude,
          longitude: firstLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        console.log('Android fallback region:', fallbackRegion);
        setRegion(fallbackRegion);
      }
    }
  }, [Platform.OS, coordinates, region]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (mapLoadTimeout) {
        clearTimeout(mapLoadTimeout);
      }
    };
  }, [mapLoadTimeout]);

  // Cleanup function for iOS map persistence
  const cleanupMap = () => {
    if (Platform.OS === 'ios' && mapRef.current && !isUnmountingRef.current) {
      try {
        // Force map to stop rendering and clear any cached data
        mapRef.current.setNativeProps({
          region: undefined,
          showsUserLocation: false,
        });
      } catch (error) {
        console.log('Map cleanup error:', error);
      }
    }
  };

  // Cleanup on unmount - critical for iOS
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      cleanupMap();
      // Clear any pending animations
      if (slideAnim) {
        slideAnim.stopAnimation();
      }
      if (completionSlideAnim) {
        completionSlideAnim.stopAnimation();
      }
    };
  }, []);

  // Additional cleanup when component updates
  useEffect(() => {
    const handleFocus = () => {
      // Component is focused, ensure map is properly initialized
      if (Platform.OS === 'ios' && mapRef.current && mapReady) {
        try {
          mapRef.current.setNativeProps({
            showsUserLocation: true,
          });
        } catch (error) {
          console.log('Map focus error:', error);
        }
      }
    };

    const handleBlur = () => {
      // Component is losing focus, prepare for cleanup
      if (Platform.OS === 'ios') {
        cleanupMap();
      }
    };

    // Add navigation listeners for better lifecycle management
    const unsubscribeFocus = navigation.addListener('focus', handleFocus);
    const unsubscribeBlur = navigation.addListener('blur', handleBlur);

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      cleanupMap();
    };
  }, [navigation, mapReady]);

  // Cleanup when crawl changes (helps with iOS map persistence)
  useEffect(() => {
    if (Platform.OS === 'ios' && mapRef.current && crawl?.id && mapReady) {
      // Force map refresh when crawl changes
      try {
        mapRef.current.setNativeProps({
          region: undefined,
        });
      } catch (error) {
        console.log('Map refresh error:', error);
      }
    }
  }, [crawl?.id, mapReady]);

  // Retry function for when map fails to load
  const handleRetry = () => {
    console.log('Retrying map load...');
    setError(null);
    setRegion(undefined);
    setMapReady(false);
    
    // Force re-evaluation of coordinates
    if (coordinates && coordinates.length > 0) {
      const firstLocation = coordinates[0];
      if (firstLocation) {
        const retryRegion = {
          latitude: firstLocation.latitude,
          longitude: firstLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        console.log('Setting retry region:', retryRegion);
        setRegion(retryRegion);
      }
    }
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: theme?.status?.error || '#FF0000' }]}>
          Map Error: {error.message}
        </Text>
        <Text style={[styles.errorSubtext, { color: theme?.text?.secondary || '#666666' }]}>
          Please try refreshing the screen or contact support.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme?.button?.primary || '#007AFF' }]}
          onPress={handleRetry}
        >
          <Text style={[styles.retryButtonText, { color: theme?.text?.button || '#FFFFFF' }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Use pre-extracted coordinates or extract them if not provided
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      console.log('Setting locations from coordinates:', coordinates.length);
      setLocations(coordinates);
      
      // Set initial region to show all revealed stops
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
        const latPadding = Math.max((maxLat - minLat) * 0.2, 0.01);
        const lngPadding = Math.max((maxLng - minLng) * 0.2, 0.01);
        
        const newRegion = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max((maxLat - minLat) + latPadding, 0.01),
          longitudeDelta: Math.max((maxLng - minLng) + lngPadding, 0.01),
        };
        
        console.log('Setting region:', newRegion);
        setRegion(newRegion);
      } else {
        // Fallback to first location if no revealed stops
        const firstLocation = coordinates[0];
        if (firstLocation) {
          const fallbackRegion = {
            latitude: firstLocation.latitude,
            longitude: firstLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          console.log('Setting fallback region:', fallbackRegion);
          setRegion(fallbackRegion);
        }
      }
    } else if (coordinates && coordinates.length === 0) {
      // Empty coordinates array - show error
      console.log('Empty coordinates array provided to CrawlMap');
      setError(new Error('No coordinates available for map display'));
    } else {
      // No coordinates provided - show error
      console.log('No coordinates provided to CrawlMap');
      setError(new Error('No coordinates available for map display'));
    }
  }, [coordinates, completedStops, currentStopNumber]);

  // Update region when revealed stops change - simplified logic
  useEffect(() => {
    if (locations.length > 0 && region) {
      const revealedStops = locations.filter(loc => 
        completedStops.includes(loc.stopNumber) || loc.stopNumber === currentStopNumber
      );
      
      if (revealedStops.length > 0) {
        const latitudes = revealedStops.map(loc => loc.latitude);
        const longitudes = revealedStops.map(loc => loc.longitude);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        const latPadding = Math.max((maxLat - minLat) * 0.2, 0.01);
        const lngPadding = Math.max((maxLng - minLng) * 0.2, 0.01);
        
        const newRegion = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max((maxLat - minLat) + latPadding, 0.01),
          longitudeDelta: Math.max((maxLng - minLng) + lngPadding, 0.01),
        };
        
        // Only update if region has changed significantly
        const latDiff = Math.abs(newRegion.latitude - region.latitude);
        const lngDiff = Math.abs(newRegion.longitude - region.longitude);
        const latDeltaDiff = Math.abs(newRegion.latitudeDelta - region.latitudeDelta);
        const lngDeltaDiff = Math.abs(newRegion.longitudeDelta - region.longitudeDelta);
        
        if (latDiff > 0.001 || lngDiff > 0.001 || latDeltaDiff > 0.001 || lngDeltaDiff > 0.001) {
          console.log('Updating region:', newRegion);
          setRegion(newRegion);
        }
      }
    }
  }, [locations, completedStops, currentStopNumber, region]);

  // Calculate road route when visible locations change - simplified
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
  }, [isCrawlCompleted, showCompletionModal, completionSlideAnim]);

  const getMarkerColor = (stopNumber: number) => {
    if (completedStops.includes(stopNumber)) {
      return theme?.button?.success || '#4CAF50'; // Green for completed
    } else if (stopNumber === currentStopNumber) {
      return theme?.button?.primary || '#FF9800'; // Primary color for current
    } else {
      return theme?.button?.disabled || '#9E9E9E'; // Disabled color for locked
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
    
    // Fallback to straight lines connecting marker centers
    const allLocations = getVisibleLocations();
    const straightLineCoords = allLocations
      .sort((a, b) => a.stopNumber - b.stopNumber)
      .map(location => ({
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    
    return straightLineCoords;
  };

  // Calculate adjusted coordinates for polyline to connect marker centers
  const getAdjustedRouteCoordinates = () => {
    const baseCoords = getRouteCoordinates();
    
    // If we have road route coordinates, return them as-is
    if (roadRouteCoordinates.length > 0) {
      return baseCoords;
    }
    
    // For straight lines, extend the line by the marker radius to connect to circle edges
    const visibleLocations = getVisibleLocations().sort((a, b) => a.stopNumber - b.stopNumber);
    
    if (visibleLocations.length < 2) return baseCoords;
    
    // Marker radius in degrees (approximate conversion from pixels)
    const markerRadiusDegrees = 0.0003; // Increased to better connect to marker edges
    
    const adjustedCoords = [];
    
    for (let i = 0; i < visibleLocations.length; i++) {
      const location = visibleLocations[i];
      const coord = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      
      // For the first marker, extend the line outward from the center
      if (i === 0 && visibleLocations.length > 1) {
        const nextLocation = visibleLocations[i + 1];
        const latDiff = nextLocation.latitude - location.latitude;
        const lngDiff = nextLocation.longitude - location.longitude;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        
        if (distance > 0) {
          const unitLat = latDiff / distance;
          const unitLng = lngDiff / distance;
          coord.latitude = location.latitude + unitLat * markerRadiusDegrees;
          coord.longitude = location.longitude + unitLng * markerRadiusDegrees;
        }
      }
      // For the last marker, extend the line outward from the center
      else if (i === visibleLocations.length - 1 && visibleLocations.length > 1) {
        const prevLocation = visibleLocations[i - 1];
        const latDiff = location.latitude - prevLocation.latitude;
        const lngDiff = location.longitude - prevLocation.longitude;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        
        if (distance > 0) {
          const unitLat = latDiff / distance;
          const unitLng = lngDiff / distance;
          coord.latitude = location.latitude + unitLat * markerRadiusDegrees;
          coord.longitude = location.longitude + unitLng * markerRadiusDegrees;
        }
      }
      
      adjustedCoords.push(coord);
    }
    
    return adjustedCoords;
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
        userId: user.id,
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

  // Get map style based on theme
  const getMapStyle = () => {
    if (themeType === 'dark') {
      return [
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
      ];
    } else {
      // Light theme - use default Google Maps style
      return undefined;
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

  // Handle map ready event
  const handleMapReady = () => {
    console.log('Map is ready');
    setMapReady(true);
    
    // Clear timeout since map is now ready
    if (mapLoadTimeout) {
      clearTimeout(mapLoadTimeout);
      setMapLoadTimeout(null);
    }
  };

  // Handle region change
  const handleRegionChange = (newRegion: any) => {
    console.log('Region changed:', newRegion);
  };

  // If no region is set, show loading state
  if (!region) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={[styles.loadingText, { color: theme?.text?.secondary || '#666666' }]}>
          Loading map...
        </Text>
        <Text style={[styles.loadingSubtext, { color: theme?.text?.tertiary || '#999999' }]}>
          Platform: {Platform.OS}, Coordinates: {coordinates?.length || 0}
        </Text>
        {coordinates && coordinates.length > 0 && (
          <Text style={[styles.loadingSubtext, { color: theme?.text?.tertiary || '#999999', marginTop: 5 }]}>
            Processing {coordinates.length} locations...
          </Text>
        )}
        {!coordinates && (
          <Text style={[styles.loadingSubtext, { color: theme?.text?.tertiary || '#999999', marginTop: 5 }]}>
            Waiting for coordinate data...
          </Text>
        )}
        {/* Debug information */}
        <Text style={[styles.loadingSubtext, { color: theme?.text?.tertiary || '#999999', marginTop: 10, fontSize: 12 }]}>
          Debug: {coordinates ? `Has ${coordinates.length} coords` : 'No coords'} | 
          Region: {region ? 'Set' : 'Not set'} | 
          MapReady: {mapReady ? 'Yes' : 'No'}
        </Text>
      </View>
    );
  }

  // Main component return
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        key={`map-${Platform.OS}-${crawl?.id || 'default'}`}
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
        customMapStyle={getMapStyle()}
        onMapReady={handleMapReady}
        onRegionChange={handleRegionChange}
        // Platform-specific optimizations
        removeClippedSubviews={Platform.OS === 'ios'}
        maxZoomLevel={20}
        minZoomLevel={3}
        // Force map to not cache on iOS
        cacheEnabled={Platform.OS !== 'ios'}
        // Additional iOS-specific properties to prevent overlay issues
        {...(Platform.OS === 'ios' && {
          // Disable animations that might cause overlay issues
          animated: false,
          // Ensure proper touch handling
          scrollEnabled: true,
          zoomEnabled: true,
          rotateEnabled: true,
          pitchEnabled: true,
        })}
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
            zIndex={2}
          >
            <View style={[styles.customMarker, { backgroundColor: getMarkerColor(location.stopNumber) }]}>
              <Text style={styles.markerText}>{location.stopNumber}</Text>
            </View>
          </Marker>
        ))}

        {/* Render route polyline */}
        {getAdjustedRouteCoordinates().length > 1 && (
          <Polyline
            coordinates={getAdjustedRouteCoordinates()}
            strokeColor={isLoadingRoute ? theme?.text?.tertiary || "#9E9E9E" : theme?.button?.primary || "#007AFF"}
            strokeWidth={Platform.OS === 'ios' ? (isLoadingRoute ? 1 : 2) : (isLoadingRoute ? 2 : 3)}
            lineDashPattern={isLoadingRoute ? [10, 5] : [5, 5]}
            zIndex={1}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>
      
      {/* Slide-up action panel */}
      {showActionModal && selectedStop && (
        <Animated.View 
          style={[
            styles.actionPanel, 
            { 
              backgroundColor: theme?.background?.primary || '#ffffff',
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
            <Text style={[styles.actionPanelTitle, { color: theme?.text?.primary || '#000000' }]}>
              Stop {selectedStop.stopNumber}: {selectedStop.stop.location_name || 'Location'}
            </Text>
            <TouchableOpacity
              style={styles.actionPanelCloseButton}
              onPress={handleClosePanel}
            >
              <Text style={[styles.actionPanelCloseText, { color: theme?.text?.secondary || '#666666' }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Show completion status */}
          {completedStops.includes(selectedStop.stopNumber) && (
            <View style={styles.completionStatus}>
              <Text style={[styles.completionStatusText, { color: theme?.status?.success || '#4CAF50' }]}>
                ✅ Completed
              </Text>
            </View>
          )}
          
          <View style={styles.actionPanelButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme?.button?.primary || '#007AFF' }]}
              onPress={handleRecsPress}
            >
              <Text style={[styles.actionButtonText, { color: theme?.text?.button || '#FFFFFF' }]}>
                Recs
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: completedStops.includes(selectedStop.stopNumber) 
                    ? theme?.button?.disabled || '#9E9E9E'
                    : theme?.button?.secondary || '#6c757d'
                }
              ]}
              onPress={handleStartPress}
            >
              <Text style={[
                styles.actionButtonText, 
                { 
                  color: completedStops.includes(selectedStop.stopNumber)
                    ? theme?.text?.disabled || '#666666'
                    : theme?.text?.button || '#FFFFFF'
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
              backgroundColor: theme?.background?.primary || '#ffffff',
              transform: [{
                translateY: completionSlideAnim
              }]
            }
          ]}
        >
          <View style={styles.completionModalContent}>
            <Text style={[styles.completionMessage, { color: theme?.text?.secondary || '#666666' }]}>
              🎉 Congratulations! You've successfully completed all stops in this crawl!
            </Text>
            
            <TouchableOpacity
              style={[styles.completionButton, { backgroundColor: theme?.button?.primary || '#007AFF' }]}
              onPress={handleCompleteCrawl}
            >
              <Text style={[styles.completionButtonText, { color: theme?.text?.button || '#FFFFFF' }]}>
                Close & Save Progress
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    justifyContent: 'center',
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
    padding: 20,
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
  completionMessage: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
    fontWeight: '600',
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
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionModalContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CrawlMap; 
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteSegment {
  coordinates: Coordinate[];
  distance: number;
  duration: number;
}

export const getRoadDirections = async (
  origin: Coordinate,
  destination: Coordinate,
  apiKey?: string
): Promise<RouteSegment | null> => {
  try {
    console.log('🔍 getRoadDirections called with:', { origin, destination, hasApiKey: !!apiKey });
    
    if (!apiKey) {
      console.warn('❌ No Google Maps API key provided, using straight line');
      return null;
    }

    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    
    // Use walking mode to follow roads and paths, with detailed polyline
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=walking&alternatives=false&key=${apiKey}`;
    console.log('🌐 Making API request to:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📡 API Response status:', data.status);
    console.log('📡 API Response routes count:', data.routes?.length || 0);
    
    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      console.log('✅ Route found:', {
        distance: leg.distance?.text,
        duration: leg.duration?.text,
        overviewPolylinePoints: route.overview_polyline?.points?.length || 0,
        hasDetailedPolyline: !!route.legs[0]?.steps
      });
      
      // Use overview polyline for absolute coordinates
      console.log('📍 Using overview polyline for absolute coordinates');
      const coordinates = decodePolyline(route.overview_polyline.points);
      
      console.log('📍 Decoded coordinates count:', coordinates.length);
      if (coordinates.length > 0) {
        console.log('📍 First coordinate:', coordinates[0]);
        console.log('📍 Last coordinate:', coordinates[coordinates.length - 1]);
        
        // Check if coordinates are reasonable (not near 0,0)
        const firstCoord = coordinates[0];
        const lastCoord = coordinates[coordinates.length - 1];
        
        if (Math.abs(firstCoord.latitude) < 1 || Math.abs(firstCoord.longitude) < 1) {
          console.warn('⚠️ Coordinates seem invalid (near 0,0), using straight line');
          return null;
        }
      }
      
      return {
        coordinates,
        distance: leg.distance.value, // in meters
        duration: leg.duration.value, // in seconds
      };
    } else {
      console.warn('❌ No route found, API response:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting road directions:', error);
    return null;
  }
};

// Decode Google's polyline format
const decodePolyline = (encoded: string): Coordinate[] => {
  console.log('🔍 decodePolyline called with encoded string length:', encoded.length);
  
  const coordinates: Coordinate[] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let shift = 0, result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    const latitude = Number((lat / 1e5).toFixed(6));
    const longitude = Number((lng / 1e5).toFixed(6));
    
    // Validate coordinates are reasonable (not in the middle of the ocean)
    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      coordinates.push({
        latitude,
        longitude,
      });
    } else {
      console.warn('⚠️ Invalid coordinate detected:', { latitude, longitude, index });
    }
  }

            console.log('📍 decodePolyline result:', coordinates.length, 'valid coordinates');
    if (coordinates.length > 0) {
      console.log('📍 First coordinate:', coordinates[0]);
      console.log('📍 Last coordinate:', coordinates[coordinates.length - 1]);
      
      // Log a few intermediate coordinates to check for issues
      if (coordinates.length > 5) {
        console.log('📍 Sample intermediate coordinates:');
        for (let i = 1; i < Math.min(4, coordinates.length - 1); i++) {
          console.log(`📍   [${i}]:`, coordinates[i]);
        }
      }
      
      // Check if coordinates are reasonable
      const allReasonable = coordinates.every(coord => 
        Math.abs(coord.latitude) > 1 && Math.abs(coord.longitude) > 1
      );
      
      if (!allReasonable) {
        console.warn('⚠️ Some coordinates seem invalid (near 0,0)');
      }
    }
  
  return coordinates;
};



export const getRoadRouteForStops = async (
  stops: Coordinate[],
  apiKey?: string
): Promise<Coordinate[]> => {
  console.log('🛣️ getRoadRouteForStops called with:', {
    stopsCount: stops.length,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0
  });
  
  if (stops.length < 2) {
    console.log('🛣️ Not enough stops for route calculation');
    return stops;
  }

  // Simple straight lines between stops
  const routeCoordinates: Coordinate[] = [];
  
  for (let i = 0; i < stops.length - 1; i++) {
    const origin = stops[i];
    const destination = stops[i + 1];
    
    console.log(`🛣️ Processing segment ${i + 1}/${stops.length - 1}:`, { origin, destination });
    
    // Add the origin point
    if (i === 0) {
      routeCoordinates.push(origin);
    }
    
    // Add the destination point (straight line)
    routeCoordinates.push(destination);
  }
  
  console.log('🛣️ Final route coordinates count:', routeCoordinates.length);
  return routeCoordinates;
};

 
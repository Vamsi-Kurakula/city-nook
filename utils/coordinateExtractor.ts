import { GOOGLE_MAPS_API_KEY_CONFIG } from './config';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  title: string;
  stopNumber: number;
}

export const extractCoordinates = async (locationLink: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Handle Google Maps app links (short URLs)
    if (locationLink.includes('maps.app.goo.gl')) {
      try {
        // Follow the redirect to get the actual URL
        const response = await fetch(locationLink, { 
          method: 'HEAD',
          redirect: 'follow'
        });
        const resolvedUrl = response.url;
        
        // Now extract coordinates from the resolved URL
        const url = new URL(resolvedUrl);
        
        // Check for coordinates in the resolved URL path (e.g., /@40.7829,-73.9654,15z)
        const pathMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (pathMatch) {
          const latitude = parseFloat(pathMatch[1]);
          const longitude = parseFloat(pathMatch[2]);
          return { latitude, longitude };
        }
        
        // Check for coordinates in query parameters
        const llParam = url.searchParams.get('ll');
        if (llParam) {
          const [lat, lng] = llParam.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { latitude: lat, longitude: lng };
          }
        }
        
        // Check for coordinates in query parameters (e.g., ?q=40.7829,-73.9654)
        const query = url.searchParams.get('q');
        if (query) {
          const coordMatch = query.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/);
          if (coordMatch) {
            const latitude = parseFloat(coordMatch[1]);
            const longitude = parseFloat(coordMatch[2]);
            return { latitude, longitude };
          }
        }
      } catch (error) {
        // Silent fail for app link resolution
      }
    }
    
    const url = new URL(locationLink);
    
    // Method 1: Check for coordinates in the URL path (e.g., /@40.7829,-73.9654,15z)
    const pathMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (pathMatch) {
      const latitude = parseFloat(pathMatch[1]);
      const longitude = parseFloat(pathMatch[2]);
      return { latitude, longitude };
    }
    
    // Method 2: Check for coordinates in query parameters (e.g., ?ll=40.7829,-73.9654)
    const llParam = url.searchParams.get('ll');
    if (llParam) {
      const [lat, lng] = llParam.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
    
    // Method 3: Check for coordinates in query parameters (e.g., ?q=40.7829,-73.9654)
    const query = url.searchParams.get('q');
    if (query) {
      const coordMatch = query.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/);
      if (coordMatch) {
        const latitude = parseFloat(coordMatch[1]);
        const longitude = parseFloat(coordMatch[2]);
        return { latitude, longitude };
      }
    }
    
    // Method 4: Use Google Geocoding API
    if (query) {
      const apiKey = GOOGLE_MAPS_API_KEY_CONFIG;
      if (apiKey) {
        try {
          const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
          const response = await fetch(geocodingUrl);
          const data = await response.json();
          
          if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return { latitude: location.lat, longitude: location.lng };
          } else if (data.status === 'ZERO_RESULTS') {
            // Try with a more specific query
            const specificQuery = query.split(',')[0]; // Take just the first part
            const specificUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(specificQuery)}&key=${apiKey}`;
            const specificResponse = await fetch(specificUrl);
            const specificData = await specificResponse.json();
            
            if (specificData.status === 'OK' && specificData.results.length > 0) {
              const location = specificData.results[0].geometry.location;
              return { latitude: location.lat, longitude: location.lng };
            }
          }
        } catch (error) {
          console.error('Google geocoding failed:', error);
        }
      } else {
        // Fallback to Nominatim (OpenStreetMap)
        try {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
          const response = await fetch(nominatimUrl);
          const data = await response.json();
          
          if (data.length > 0) {
            return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
          }
        } catch (error) {
          console.error('Nominatim geocoding failed:', error);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing location link:', error);
    return null;
  }
};

export const extractAllCoordinates = async (stops: any[]): Promise<LocationCoordinates[]> => {
  const validLocations: LocationCoordinates[] = [];
  
  for (const stop of stops) {
    let coords = null;
    
    // First check for manual coordinates
    if (stop.coordinates && Array.isArray(stop.coordinates) && stop.coordinates.length === 2) {
      coords = {
        latitude: stop.coordinates[0],
        longitude: stop.coordinates[1]
      };
      console.log(`Using manual coordinates for Stop ${stop.stop_number}: ${coords.latitude}, ${coords.longitude}`);
    }
    // Fallback to extracting from location_link
    else if (stop.location_link) {
      coords = await extractCoordinates(stop.location_link);
      if (coords) {
        console.log(`Extracted coordinates for Stop ${stop.stop_number}: ${coords.latitude}, ${coords.longitude}`);
      }
    }
    
    if (coords) {
      validLocations.push({
        latitude: coords.latitude,
        longitude: coords.longitude,
        title: stop.title || `Stop ${stop.stop_number}`,
        stopNumber: stop.stop_number,
      });
    }
  }
  
  return validLocations;
}; 
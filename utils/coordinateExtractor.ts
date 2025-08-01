import { GOOGLE_MAPS_API_KEY_CONFIG } from './config';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  title: string;
  stopNumber: number;
}

export const extractCoordinates = async (locationLink: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    console.log('Extracting coordinates from:', locationLink);
    
    // Handle Google Maps app links (short URLs)
    if (locationLink.includes('maps.app.goo.gl')) {
      console.log('Detected Google Maps app link, attempting to resolve...');
      try {
        // Follow the redirect to get the actual URL
        const response = await fetch(locationLink, { 
          method: 'HEAD',
          redirect: 'follow'
        });
        const resolvedUrl = response.url;
        console.log('Resolved Google Maps app link to:', resolvedUrl);
        
        // Now extract coordinates from the resolved URL
        const url = new URL(resolvedUrl);
        
        // Check for coordinates in the resolved URL path (e.g., /@40.7829,-73.9654,15z)
        const pathMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (pathMatch) {
          const latitude = parseFloat(pathMatch[1]);
          const longitude = parseFloat(pathMatch[2]);
          console.log('Found coordinates in resolved path:', { latitude, longitude });
          return { latitude, longitude };
        }
        
        // Check for coordinates in query parameters
        const llParam = url.searchParams.get('ll');
        if (llParam) {
          const [lat, lng] = llParam.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log('Found coordinates in resolved ll parameter:', { latitude: lat, longitude: lng });
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
            console.log('Found coordinates in resolved q parameter:', { latitude, longitude });
            return { latitude, longitude };
          }
        }
        
        console.log('No coordinates found in resolved Google Maps app link');
      } catch (error) {
        console.log('Error resolving Google Maps app link:', error);
      }
    }
    
    const url = new URL(locationLink);
    
    // Method 1: Check for coordinates in the URL path (e.g., /@40.7829,-73.9654,15z)
    const pathMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (pathMatch) {
      const latitude = parseFloat(pathMatch[1]);
      const longitude = parseFloat(pathMatch[2]);
      console.log('Found coordinates in path:', { latitude, longitude });
      return { latitude, longitude };
    }
    
    // Method 2: Check for coordinates in query parameters (e.g., ?ll=40.7829,-73.9654)
    const llParam = url.searchParams.get('ll');
    if (llParam) {
      const [lat, lng] = llParam.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('Found coordinates in ll parameter:', { latitude: lat, longitude: lng });
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
        console.log('Found coordinates in q parameter:', { latitude, longitude });
        return { latitude, longitude };
      }
    }
    
    // Method 4: Use Google Geocoding API
    if (query) {
      console.log('No direct coordinates found, geocoding with Google:', query);
      try {
        const googleApiKey = GOOGLE_MAPS_API_KEY_CONFIG;
        
        if (!googleApiKey) {
          console.log('Google Maps API key not found, falling back to Nominatim');
          // Fallback to Nominatim if no Google API key
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            const latitude = parseFloat(data[0].lat);
            const longitude = parseFloat(data[0].lon);
            console.log('Geocoded coordinates (Nominatim):', { latitude, longitude });
            return { latitude, longitude };
          }
        } else {
          // Use Google Geocoding API
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
          );
          const data = await response.json();
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            const latitude = location.lat;
            const longitude = location.lng;
            console.log('Geocoded coordinates (Google):', { latitude, longitude });
            return { latitude, longitude };
          } else {
            console.log('Google geocoding failed:', data.status, data.error_message);
            
            // Try with a more specific query for Central Park locations
            if (query.includes('Central Park')) {
              const specificQuery = query.replace(/\s+Central\s+Park.*$/i, '') + ' Central Park, New York, NY';
              console.log('Trying specific query:', specificQuery);
              
              const specificResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(specificQuery)}&key=${googleApiKey}`
              );
              const specificData = await specificResponse.json();
              
              if (specificData.status === 'OK' && specificData.results && specificData.results.length > 0) {
                const location = specificData.results[0].geometry.location;
                const latitude = location.lat;
                const longitude = location.lng;
                console.log('Geocoded coordinates (Google specific):', { latitude, longitude });
                return { latitude, longitude };
              }
            }
          }
        }
        
        console.log('No geocoding results found for:', query);
      } catch (error) {
        console.log('Geocoding error:', error);
      }
    }
    
    console.log('No coordinates found for:', locationLink);
    return null;
  } catch (error) {
    console.log('Error parsing location link:', error);
    return null;
  }
};

export const extractAllCoordinates = async (stops: any[]): Promise<LocationCoordinates[]> => {
  const validLocations: LocationCoordinates[] = [];
  
  console.log('Extracting coordinates for', stops.length, 'stops');
  
  for (const stop of stops) {
    console.log(`Processing stop ${stop.stop_number}:`, stop.location_link);
    if (stop.location_link) {
      const coords = await extractCoordinates(stop.location_link);
      if (coords) {
        validLocations.push({
          ...coords,
          title: stop.location_name || `Stop ${stop.stop_number}`,
          stopNumber: stop.stop_number,
        });
        console.log(`✅ Successfully extracted coordinates for stop ${stop.stop_number}:`, coords);
      } else {
        console.log(`❌ Failed to extract coordinates for stop ${stop.stop_number}`);
      }
    } else {
      console.log(`❌ No location_link for stop ${stop.stop_number}`);
    }
  }

  console.log('Extracted coordinates for', validLocations.length, 'locations');
  return validLocations;
}; 
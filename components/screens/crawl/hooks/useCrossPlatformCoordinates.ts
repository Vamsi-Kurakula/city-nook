import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { extractAllCoordinates, LocationCoordinates } from '../../../../utils/coordinateExtractor';
import { Crawl } from '../../../../types/crawl';

export const useCrossPlatformCoordinates = (crawl: Crawl | undefined) => {
  const [coordinates, setCoordinates] = useState<LocationCoordinates[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCoordinates = async () => {
      if (!crawl?.stops || crawl.stops.length === 0) {
        setError('No crawl stops found');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`${Platform.OS}: Loading coordinates for`, crawl.stops.length, 'stops');
        const coords = await extractAllCoordinates(crawl.stops);
        
        console.log(`${Platform.OS}: Loaded coordinates:`, coords.length);
        setCoordinates(coords);
      } catch (error) {
        console.error(`${Platform.OS}: Error loading coordinates:`, error);
        const errorMessage = Platform.select({
          ios: `iOS coordinate loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          android: `Android coordinate loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadCoordinates();
  }, [crawl?.stops]);

  return { coordinates, isLoading, error };
};

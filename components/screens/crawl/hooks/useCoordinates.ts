import { useState, useEffect } from 'react';
import { extractAllCoordinates, LocationCoordinates } from '../../../../utils/coordinateExtractor';
import { Crawl } from '../../../../types/crawl';

interface CoordinatesState {
  coordinates: LocationCoordinates[];
  isLoading: boolean;
  error: string | null;
}

export const useCoordinates = (crawl: Crawl | undefined): CoordinatesState => {
  const [state, setState] = useState<CoordinatesState>({
    coordinates: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const loadCoordinates = async () => {
      if (!crawl?.stops || crawl.stops.length === 0) {
        setState(prev => ({ ...prev, error: 'No crawl stops found' }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log('Starting coordinate extraction for', crawl.stops.length, 'stops');
        const coords = await extractAllCoordinates(crawl.stops);
        
        setState({
          coordinates: coords,
          isLoading: false,
          error: coords.length === 0 ? 'No coordinates could be extracted from the crawl stops' : null,
        });

        console.log('Loaded coordinates:', coords.length);
      } catch (error) {
        console.error('Error loading coordinates:', error);
        setState({
          coordinates: [],
          isLoading: false,
          error: `Failed to load coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    };

    loadCoordinates();
  }, [crawl?.stops]);

  return state;
};

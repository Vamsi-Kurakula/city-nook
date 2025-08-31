import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import CrawlMap from '../../ui/crawl/CrawlMap';
import { Crawl, CrawlStop } from '../../../types/crawl';
import { LocationCoordinates } from '../../../utils/coordinateExtractor';

interface CrawlSessionMapProps {
  crawl: Crawl | undefined;
  currentStop: number;
  completedStops: number[];
  coordinates: LocationCoordinates[];
  isLoading: boolean;
  error: string | null;
}

const CrawlSessionMap: React.FC<CrawlSessionMapProps> = ({
  crawl,
  currentStop,
  completedStops,
  coordinates,
  isLoading,
  error,
}) => {
  const { theme } = useTheme();

  if (error) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={[styles.errorText, { color: theme.status.error }]}>
          Error: {error}
        </Text>
        <Text style={[styles.mapPlaceholderText, { color: theme.text.secondary }]}>
          Please try again or contact support if the issue persists.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={[styles.mapPlaceholderText, { color: theme.text.secondary }]}>
          Loading progress...
        </Text>
      </View>
    );
  }

  if (!crawl?.stops || crawl.stops.length === 0) {
    return (
      <View style={[styles.mapPlaceholder, { backgroundColor: theme.background.secondary }]}>
        <Text style={[styles.mapPlaceholderText, { color: theme.text.secondary }]}>
          No crawl stops available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <CrawlMap
        stops={crawl.stops}
        currentStopNumber={currentStop}
        completedStops={completedStops}
        isNextStopRevealed={true}
        coordinates={coordinates}
        crawl={crawl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default CrawlSessionMap;

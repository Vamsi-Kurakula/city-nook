import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Crawl, CrawlStop } from '../../../types/crawl';
import GradientBackground from '../../ui/common/GradientBackground';
import CrossPlatformMap from '../../ui/crawl/CrossPlatformMap';
import CrossPlatformProgress from './CrossPlatformProgress';
import CrossPlatformStopActions from './CrossPlatformStopActions';
import { useCrossPlatformCoordinates } from './hooks/useCrossPlatformCoordinates';
import { useCrossPlatformProgress } from './hooks/useCrossPlatformProgress';

const CrawlSessionScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  
  const routeParams = route.params as { crawl?: Crawl } | undefined;
  const crawl = routeParams?.crawl;

  // Use our cross-platform hooks
  const { coordinates, isLoading, error } = useCrossPlatformCoordinates(crawl);
  const { currentStop, completedStops, isLoading: progressLoading, error: progressError } = useCrossPlatformProgress(crawl);

  // State for selected stop
  const [selectedStop, setSelectedStop] = useState<{ stop: CrawlStop; stopNumber: number } | null>(null);

  // Handle stop press
  const handleStopPress = (stopNumber: number) => {
    const stop = crawl?.stops?.find(s => s.stop_number === stopNumber);
    if (stop) {
      setSelectedStop({ stop, stopNumber });
    }
  };

  return (
    <GradientBackground variant="page" style={styles.container}>
      <SafeAreaView style={[styles.safeArea, Platform.OS === 'ios' && styles.iosSafeArea]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Crawl Session
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            {crawl?.name || 'Unnamed Crawl'}
          </Text>
          <Text style={[styles.info, { color: theme.text.tertiary }]}>
            Platform: {Platform.OS} | Stops: {crawl?.stops?.length || 0}
          </Text>
          
          {/* Progress Display */}
          <CrossPlatformProgress
            currentStop={currentStop}
            completedStops={completedStops}
            totalStops={crawl?.stops?.length || 0}
          />
          
          {/* Map Display */}
          <CrossPlatformMap 
            coordinates={coordinates}
            isLoading={isLoading}
            error={error}
            onStopPress={handleStopPress}
          />
          
          {/* Stop Actions */}
          {selectedStop && (
            <CrossPlatformStopActions
              stop={selectedStop.stop}
              stopNumber={selectedStop.stopNumber}
              isCompleted={completedStops.includes(selectedStop.stopNumber)}
              onStart={() => {
                // Navigate to start/stop screen
                navigation.navigate('CrawlStartStop', {
                  crawl,
                  stop: selectedStop.stop,
                  stopNumber: selectedStop.stopNumber,
                });
                setSelectedStop(null);
              }}
              onRecs={() => {
                // Navigate to recs screen
                navigation.navigate('CrawlRecs', {
                  crawl,
                  stop: selectedStop.stop,
                  stopNumber: selectedStop.stopNumber,
                });
                setSelectedStop(null);
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  iosSafeArea: {
    // iOS-specific safe area adjustments
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
  },
});

export default CrawlSessionScreen;

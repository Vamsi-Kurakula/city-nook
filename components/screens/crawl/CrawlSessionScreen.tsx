import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Crawl } from '../../../types/crawl';
import GradientBackground from '../../ui/common/GradientBackground';
import CrawlSessionHeader from './CrawlSessionHeader';
import CrawlSessionMap from './CrawlSessionMap';
import { useCrawlSession, useCoordinates } from './hooks';

const CrawlSessionScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  
  const routeParams = route.params as { 
    crawl?: Crawl; 
    completedStop?: number;
    userAnswer?: string;
  } | undefined;
  
  const crawl = routeParams?.crawl;

  // Use our simplified hooks
  const { session, actions } = useCrawlSession(crawl, () => navigation.navigate('Home'));
  const { coordinates, isLoading: isLoadingCoordinates, error: coordinatesError } = useCoordinates(crawl);

  // Combine errors from both hooks
  const error = session.error || coordinatesError;

  return (
    <GradientBackground variant="page" style={[
      styles.container, 
      // iOS-specific fix to prevent overlay issues
      Platform.OS === 'ios' && {
        zIndex: 9999,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 16,
        position: 'relative',
      }
    ]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Progress */}
        <CrawlSessionHeader
          onExit={actions.exitSession}
          progressPercent={session.progressPercent}
          currentStop={session.currentStop}
          totalStops={session.totalStops}
        />

        {/* Map Section */}
        <CrawlSessionMap
          crawl={crawl}
          currentStop={session.currentStop}
          completedStops={session.completedStops}
          coordinates={coordinates}
          isLoading={session.isLoading || isLoadingCoordinates}
          error={error}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  safeArea: {
    flex: 1,
  },
});

export default CrawlSessionScreen; 
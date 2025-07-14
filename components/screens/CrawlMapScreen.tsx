import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { CrawlStop } from '../../types/crawl';
import { LocationCoordinates } from '../../utils/coordinateExtractor';
import CrawlMap from '../ui/CrawlMap';
import BackButton from '../ui/BackButton';

interface CrawlMapScreenRouteParams {
  stops: CrawlStop[];
  currentStopNumber: number;
  completedStops: number[];
  isNextStopRevealed: boolean;
  coordinates?: LocationCoordinates[];
}

const CrawlMapScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  
  const params = route.params as CrawlMapScreenRouteParams;
  const { stops, currentStopNumber, completedStops, isNextStopRevealed, coordinates } = params;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.header, { borderBottomColor: theme.border.secondary, backgroundColor: theme.background.primary }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Map</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>
      <View style={[styles.mapContainer, { backgroundColor: theme.background.primary }]}>
        <CrawlMap
          stops={stops}
          currentStopNumber={currentStopNumber}
          completedStops={completedStops}
          isNextStopRevealed={isNextStopRevealed}
          coordinates={coordinates}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default CrawlMapScreen; 
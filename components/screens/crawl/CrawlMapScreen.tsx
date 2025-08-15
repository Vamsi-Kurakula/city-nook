import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { CrawlStop } from '../../../types/crawl';
import { LocationCoordinates } from '../../../utils/coordinateExtractor';
import CrawlMap from '../../ui/crawl/CrawlMap';
import BackButton from '../../ui/common/BackButton';
import MapView, { Marker } from 'react-native-maps';

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
  console.log('CrawlMapScreen params:', params);
  const { stops, currentStopNumber, completedStops, isNextStopRevealed, coordinates } = params;

  // Add detailed logging for each prop
  console.log('CrawlMapScreen stops:', stops, 'type:', Array.isArray(stops) ? 'array' : typeof stops);
  console.log('CrawlMapScreen currentStopNumber:', currentStopNumber, 'type:', typeof currentStopNumber);
  console.log('CrawlMapScreen completedStops:', completedStops, 'type:', Array.isArray(completedStops) ? 'array' : typeof completedStops);
  console.log('CrawlMapScreen isNextStopRevealed:', isNextStopRevealed, 'type:', typeof isNextStopRevealed);
  console.log('CrawlMapScreen coordinates:', coordinates, 'type:', Array.isArray(coordinates) ? 'array' : typeof coordinates);

  // Restore full original render to see if issue reappears
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}> 
              <View style={[styles.header, { borderBottomColor: theme.border.secondary, backgroundColor: theme.background.primary }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Map</Text>
        <View style={{ width: 40 }} />
      </View>
              <View style={[styles.mapContainer, { backgroundColor: theme.background.primary }]}>
        <CrawlMap
          stops={stops}
          currentStopNumber={currentStopNumber}
          completedStops={completedStops}
          isNextStopRevealed={isNextStopRevealed}
          coordinates={coordinates}
        />
        
        {/* Legend positioned over the map */}
        <View style={[styles.legend, { backgroundColor: theme.background.primary }]}> 
          <Text style={[styles.legendTitle, { color: theme.text.primary }]}>Legend:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.button.success || '#4CAF50', borderColor: theme.border.primary }]} />
            <Text style={[styles.legendText, { color: theme.text.primary }]}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.button.primary || '#FF9800', borderColor: theme.border.primary }]} />
            <Text style={[styles.legendText, { color: theme.text.primary }]}>Current</Text>
          </View>
        </View>
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
  legend: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 14,
  },
});

export default CrawlMapScreen; 

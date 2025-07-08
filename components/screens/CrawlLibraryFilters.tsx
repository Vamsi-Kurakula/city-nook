import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// Define navigation types

type CrawlLibraryFiltersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrawlLibraryFilters'>;
type CrawlLibraryFiltersScreenRouteProp = RouteProp<RootStackParamList, 'CrawlLibraryFilters'>;

const CrawlLibraryFilters: React.FC = () => {
  const navigation = useNavigation<CrawlLibraryFiltersScreenNavigationProp>();
  const route = useRoute<CrawlLibraryFiltersScreenRouteProp>();
  const { theme } = useTheme();

  // Get initial values from params or default
  const initialMinStops = route.params?.minStops ?? 0;
  const initialMaxDistanceMiles = route.params?.maxDistanceMiles ?? 10;

  const [minStops, setMinStops] = useState(initialMinStops);
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(initialMaxDistanceMiles);

  const handleSave = () => {
    navigation.navigate('CrawlLibrary', { minStops, maxDistanceMiles });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text style={[styles.header, { color: theme.text.primary }]}>Filter Crawls</Text>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.text.secondary }]}>Min Stops: {minStops}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          step={1}
          value={minStops}
          onValueChange={setMinStops}
          minimumTrackTintColor={theme.button.primary}
          maximumTrackTintColor={theme.border.primary}
          thumbTintColor={theme.button.primary}
        />
      </View>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.text.secondary }]}>Max Distance: {maxDistanceMiles} miles</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={maxDistanceMiles}
          onValueChange={setMaxDistanceMiles}
          minimumTrackTintColor={theme.button.primary}
          maximumTrackTintColor={theme.border.primary}
          thumbTintColor={theme.button.primary}
        />
      </View>
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: theme.button.primary }]} 
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 12,
    width: 130,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  saveButton: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CrawlLibraryFilters; 
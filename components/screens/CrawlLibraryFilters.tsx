import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define navigation types

type CrawlLibraryFiltersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrawlLibraryFilters'>;
type CrawlLibraryFiltersScreenRouteProp = RouteProp<RootStackParamList, 'CrawlLibraryFilters'>;

const CrawlLibraryFilters: React.FC = () => {
  const navigation = useNavigation<CrawlLibraryFiltersScreenNavigationProp>();
  const route = useRoute<CrawlLibraryFiltersScreenRouteProp>();

  // Get initial values from params or default
  const initialMinSteps = route.params?.minSteps ?? 0;
  const initialMaxDistanceMiles = route.params?.maxDistanceMiles ?? 10;

  const [minSteps, setMinSteps] = useState(initialMinSteps);
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(initialMaxDistanceMiles);

  const handleSave = () => {
    navigation.navigate('CrawlLibrary', { minSteps, maxDistanceMiles });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Filter Crawls</Text>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Min Steps: {minSteps}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          step={1}
          value={minSteps}
          onValueChange={setMinSteps}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
        />
      </View>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Max Distance: {maxDistanceMiles} miles</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={maxDistanceMiles}
          onValueChange={setMaxDistanceMiles}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1a1a1a',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 12,
    width: 130,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CrawlLibraryFilters; 
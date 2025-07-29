import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { CrawlStop } from '../../../types/crawl';

interface LocationStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export default function LocationStop({ stop, onComplete, isCompleted, userAnswer }: LocationStopProps) {
  const openMaps = () => {
    if (stop.location_link) {
      Linking.openURL(stop.location_link);
    }
  };

  const handleArrived = () => {
    onComplete('Arrived at location');

  };

  if (isCompleted) {
    return (
      <View style={styles.completedStop}>
        <Text style={styles.stopTitle}>✓ Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>
          {stop.stop_components.description || stop.stop_components.location_name || ''}
        </Text>
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Status:</Text>
          <Text style={styles.userAnswer}>{userAnswer}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stopContainer}>
      <Text style={styles.stopTitle}>Stop {stop.stop_number}</Text>
      <Text style={styles.stopDescription}>
        {stop.stop_components.description || stop.stop_components.location_name || ''}
      </Text>
      <View style={styles.locationSection}>
        <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
          <Text style={styles.mapsButtonText}>📍 Open in Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.arrivedButton} onPress={handleArrived}>
          <Text style={styles.arrivedButtonText}>✅ I've Arrived</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stopContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedStop: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  stopTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stopDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  locationSection: {
    flexDirection: 'row',
    gap: 12,
  },
  mapsButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  mapsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  arrivedButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  arrivedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  answerSection: {
    marginTop: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  userAnswer: {
    fontSize: 16,
    color: '#1a1a1a',
    fontStyle: 'italic',
  },
}); 
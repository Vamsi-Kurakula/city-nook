import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CrawlStop } from '../../../types/crawl';

interface PhotoStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export default function PhotoStop({ stop, onComplete, isCompleted, userAnswer }: PhotoStopProps) {
  const handlePhotoTaken = () => {
    onComplete('Photo taken');
    Alert.alert('Photo Captured!', 'Great! You\'ve taken the photo.');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStop}>
        <Text style={styles.stopTitle}>✓ Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>
          {stop.stop_components.photo_instructions || stop.stop_components.photo_target || ''}
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
        {stop.stop_components.photo_instructions || stop.stop_components.photo_target || ''}
      </Text>
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoButton} onPress={handlePhotoTaken}>
          <Text style={styles.photoButtonText}>📸 Take Photo</Text>
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
  photoSection: {
    alignItems: 'center',
  },
  photoButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 16,
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
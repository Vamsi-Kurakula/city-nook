import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { CrawlStop } from '../../../types/crawl';

interface ButtonStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
  crawlStartTime?: string;
  currentStopIndex?: number;
  allStops?: CrawlStop[];
}

export default function ButtonStop({ 
  stop, 
  onComplete, 
  isCompleted, 
  userAnswer,
  crawlStartTime,
  currentStopIndex,
  allStops
}: ButtonStopProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilReveal, setTimeUntilReveal] = useState<number | null>(null);

  // Calculate when this stop should be revealed
  const calculateStopRevealTime = () => {
    if (!crawlStartTime || currentStopIndex === undefined || !allStops) {
      return null;
    }

    const startTime = new Date(crawlStartTime);
    let totalMinutes = 0;
    // Sum up reveal_after_minutes for all stops up to and including the current stop
    for (let i = 0; i <= currentStopIndex; i++) {
      const stopMinutes = allStops[i]?.reveal_after_minutes || 0;
      totalMinutes += stopMinutes;
    }
    const revealTime = new Date(startTime.getTime() + totalMinutes * 60 * 1000);
    return revealTime;
  };

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate time until reveal
  useEffect(() => {
    const revealTime = calculateStopRevealTime();
    if (revealTime) {
      const timeDiff = revealTime.getTime() - currentTime.getTime();
      if (timeDiff > 0) {
        setTimeUntilReveal(Math.ceil(timeDiff / 1000 / 60)); // Convert to minutes
      } else {
        setTimeUntilReveal(null);
      }
    }
  }, [currentTime, crawlStartTime, currentStopIndex, allStops]);

  const openMaps = () => {
    if (stop.location_link) {
      Linking.openURL(stop.location_link);
    }
  };

  const handleButtonPress = () => {
    onComplete('Button pressed');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStop}>
        <Text style={styles.stopTitle}>✓ Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>
          {stop.stop_components.description || stop.stop_components.button_text || ''}
        </Text>
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Status:</Text>
          <Text style={styles.userAnswer}>{userAnswer}</Text>
        </View>
      </View>
    );
  }

  // Show countdown if stop is not yet revealed
  if (timeUntilReveal !== null && timeUntilReveal > 0) {
    return (
      <View style={styles.stopContainer}>
        <Text style={styles.stopTitle}>Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>
          This stop will be revealed in {timeUntilReveal} minutes
        </Text>
        <View style={styles.countdownSection}>
          <Text style={styles.countdownText}>⏰ {timeUntilReveal} min remaining</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stopContainer}>
      <Text style={styles.stopTitle}>Stop {stop.stop_number}</Text>
      <Text style={styles.stopDescription}>
        {stop.stop_components.description || stop.stop_components.button_text || ''}
      </Text>
      <View style={styles.buttonSection}>
        {stop.location_link && (
          <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
            <Text style={styles.mapsButtonText}>📍 Open in Maps</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.completeButton} onPress={handleButtonPress}>
          <Text style={styles.completeButtonText}>
            {stop.stop_components.button_text || 'Complete Stop'}
          </Text>
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
  countdownSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  buttonSection: {
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
  completeButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
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
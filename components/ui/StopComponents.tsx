import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { CrawlStop } from '../../types/crawl';
import { validateAnswer } from '../../utils/answerValidation';
import { formatTimeRemaining } from '../../utils/crawlStatus';

interface RiddleStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export const RiddleStop: React.FC<RiddleStopProps> = ({ stop, onComplete, isCompleted, userAnswer }) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    setIsSubmitting(true);
    const correctAnswer = stop.stop_components.answer || '';
    const isValid = await validateAnswer(answer.trim(), correctAnswer);
    setIsSubmitting(false);

    if (isValid) {
      onComplete(answer.trim());
      Alert.alert('Correct!', 'Great job! You solved the riddle.');
    } else {
      Alert.alert('Incorrect', 'That\'s not quite right. Try again!');
    }
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStop}>
        <Text style={styles.stopTitle}>✓ Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>{stop.stop_components.riddle || ''}</Text>
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Your Answer:</Text>
          <Text style={styles.userAnswer}>{userAnswer}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stopContainer}>
      <Text style={styles.stopTitle}>Stop {stop.stop_number}</Text>
      <Text style={styles.stopDescription}>{stop.stop_components.riddle || ''}</Text>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Your Answer:</Text>
        <TextInput
          style={styles.textInput}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Enter your answer..."
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface LocationStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export const LocationStop: React.FC<LocationStopProps> = ({ stop, onComplete, isCompleted, userAnswer }) => {
  const openMaps = () => {
    if (stop.location_link) {
      Linking.openURL(stop.location_link);
    }
  };

  const handleArrived = () => {
    onComplete('Arrived at location');
    Alert.alert('Location Reached!', 'Great! You\'ve found the location.');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStop}>
        <Text style={styles.stopTitle}>✓ Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>{stop.stop_components.description || stop.stop_components.location_name || ''}</Text>
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
      <Text style={styles.stopDescription}>{stop.stop_components.description || stop.stop_components.location_name || ''}</Text>
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
};

interface PhotoStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export const PhotoStop: React.FC<PhotoStopProps> = ({ stop, onComplete, isCompleted, userAnswer }) => {
  const handlePhotoTaken = () => {
    onComplete('Photo taken');
    Alert.alert('Photo Captured!', 'Great! You\'ve taken the photo.');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStop}>
        <Text style={styles.stopTitle}>✓ Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>{stop.stop_components.photo_instructions || stop.stop_components.photo_target || ''}</Text>
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
      <Text style={styles.stopDescription}>{stop.stop_components.photo_instructions || stop.stop_components.photo_target || ''}</Text>
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoButton} onPress={handlePhotoTaken}>
          <Text style={styles.photoButtonText}>📸 Take Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ButtonStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
  crawlStartTime?: string;
  currentStopIndex?: number;
  allStops?: CrawlStop[];
}

export const ButtonStop: React.FC<ButtonStopProps> = ({ 
  stop, 
  onComplete, 
  isCompleted, 
  userAnswer,
  crawlStartTime,
  currentStopIndex,
  allStops
}) => {
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

  const revealTime = calculateStopRevealTime();
  const isPublicCrawl = crawlStartTime && allStops && allStops.some(s => s.reveal_after_minutes !== undefined);
  const isStopAvailable = !isPublicCrawl || !revealTime || currentTime >= revealTime;

  // Update current time every second
  useEffect(() => {
    if (!isPublicCrawl || !revealTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (revealTime && now < revealTime) {
        const remaining = Math.ceil((revealTime.getTime() - now.getTime()) / 1000);
        setTimeUntilReveal(remaining);
      } else {
        setTimeUntilReveal(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPublicCrawl, revealTime]);

  const openMaps = () => {
    if (stop.location_link) {
      Linking.openURL(stop.location_link);
    }
  };

  const handleButtonPress = () => {
    if (!isStopAvailable) return;
    onComplete('Button pressed');
    Alert.alert('Stop Complete!', 'Great! You\'ve completed this stop.');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStop}>
        <Text style={styles.stopTitle}>✓ Stop {stop.stop_number}</Text>
        <Text style={styles.stopDescription}>{stop.stop_components.description || stop.stop_components.location_name || ''}</Text>
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
      <Text style={styles.stopDescription}>{stop.stop_components.description || stop.stop_components.location_name || ''}</Text>
      {isPublicCrawl && revealTime && (
        <View style={styles.timeSection}>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeLabel}>Stop Available At:</Text>
            <Text style={styles.targetTime}>
              {revealTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {!isStopAvailable && timeUntilReveal !== null && (
            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>Time Remaining:</Text>
              <Text style={styles.timeRemaining}>
                {formatTimeRemaining(timeUntilReveal)}
              </Text>
            </View>
          )}
          {isStopAvailable && (
            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>Status:</Text>
              <Text style={[styles.timeReached, { fontWeight: 'bold' }]}>✅ Available Now</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.buttonSection}>
        {stop.location_link && (
          <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
            <Text style={styles.mapsButtonText}>📍 Open in Maps</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            !isStopAvailable && styles.timeButtonDisabled
          ]} 
          onPress={handleButtonPress}
          disabled={!isStopAvailable}
        >
          <Text style={[
            styles.completeButtonText,
            !isStopAvailable && styles.timeButtonTextDisabled
          ]}>
            {!isStopAvailable 
              ? `⏰ Wait ${timeUntilReveal ? formatTimeRemaining(timeUntilReveal) : ''}`
              : (stop.stop_components.button_text || '✅ Complete Stop')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface StopComponentProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
  crawlStartTime?: string;
  stopDurations?: { [stopNumber: number]: number };
  currentStopIndex?: number;
  allStops?: CrawlStop[];
}

export const StopComponent: React.FC<StopComponentProps> = ({ 
  stop, 
  onComplete, 
  isCompleted, 
  userAnswer,
  crawlStartTime,
  stopDurations,
  currentStopIndex,
  allStops
}) => {
  switch (stop.stop_type) {
    case 'riddle':
      return <RiddleStop stop={stop} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'location':
      return <LocationStop stop={stop} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'photo':
      return <PhotoStop stop={stop} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'button':
      return <ButtonStop stop={stop} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} crawlStartTime={crawlStartTime} currentStopIndex={currentStopIndex} allStops={allStops} />;
    default:
      return (
        <View style={styles.stopContainer}>
          <Text style={styles.stopTitle}>Unknown Stop Type</Text>
          <Text style={styles.stopDescription}>{stop.stop_components.description || ''}</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  stopContainer: {
    backgroundColor: '#fff',
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
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stopDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  inputSection: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationSection: {
    marginTop: 8,
  },
  buttonSection: {
    marginTop: 8,
  },
  timeSection: {
    marginTop: 8,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  targetTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  currentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeRemaining: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  timeReached: {
    color: '#28a745',
  },
  mapsButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  mapsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  arrivedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  arrivedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeButtonTextDisabled: {
    color: '#999',
  },
  photoSection: {
    marginTop: 8,
  },
  photoButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  answerSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  userAnswer: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  crawlTimingInfo: {
    marginBottom: 12,
  },
}); 
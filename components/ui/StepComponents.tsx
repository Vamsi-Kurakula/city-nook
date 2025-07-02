import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { CrawlStep } from '../../types/crawl';
import { validateAnswer } from '../../utils/answerValidation';
import { formatTimeRemaining } from '../../utils/crawlStatus';

interface RiddleStepProps {
  step: CrawlStep;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export const RiddleStep: React.FC<RiddleStepProps> = ({ step, onComplete, isCompleted, userAnswer }) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    setIsSubmitting(true);
    const correctAnswer = step.step_components.answer || '';
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
      <View style={styles.completedStep}>
        <Text style={styles.stepTitle}>✓ Step {step.step_number}</Text>
        <Text style={styles.stepDescription}>{step.step_components.riddle || ''}</Text>
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Your Answer:</Text>
          <Text style={styles.userAnswer}>{userAnswer}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step {step.step_number}</Text>
      <Text style={styles.stepDescription}>{step.step_components.riddle || ''}</Text>
      
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

interface LocationStepProps {
  step: CrawlStep;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export const LocationStep: React.FC<LocationStepProps> = ({ step, onComplete, isCompleted, userAnswer }) => {
  const openMaps = () => {
    if (step.reward_location) {
      Linking.openURL(step.reward_location);
    }
  };

  const handleArrived = () => {
    onComplete('Arrived at location');
    Alert.alert('Location Reached!', 'Great! You\'ve found the location.');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStep}>
        <Text style={styles.stepTitle}>✓ Step {step.step_number}</Text>
        <Text style={styles.stepDescription}>{step.step_components.description || step.step_components.location_name || ''}</Text>
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Status:</Text>
          <Text style={styles.userAnswer}>{userAnswer}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step {step.step_number}</Text>
      <Text style={styles.stepDescription}>{step.step_components.description || step.step_components.location_name || ''}</Text>
      
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

interface PhotoStepProps {
  step: CrawlStep;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export const PhotoStep: React.FC<PhotoStepProps> = ({ step, onComplete, isCompleted, userAnswer }) => {
  const handlePhotoTaken = () => {
    onComplete('Photo taken');
    Alert.alert('Photo Captured!', 'Great! You\'ve taken the photo.');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStep}>
        <Text style={styles.stepTitle}>✓ Step {step.step_number}</Text>
        <Text style={styles.stepDescription}>{step.step_components.photo_instructions || step.step_components.photo_target || ''}</Text>
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Status:</Text>
          <Text style={styles.userAnswer}>{userAnswer}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step {step.step_number}</Text>
      <Text style={styles.stepDescription}>{step.step_components.photo_instructions || step.step_components.photo_target || ''}</Text>
      
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoButton} onPress={handlePhotoTaken}>
          <Text style={styles.photoButtonText}>📸 Take Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ButtonStepProps {
  step: CrawlStep;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
  crawlStartTime?: string;
  currentStepIndex?: number;
  allSteps?: CrawlStep[];
}

export const ButtonStep: React.FC<ButtonStepProps> = ({ 
  step, 
  onComplete, 
  isCompleted, 
  userAnswer,
  crawlStartTime,
  currentStepIndex,
  allSteps
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilReveal, setTimeUntilReveal] = useState<number | null>(null);

  // Calculate when this step should be revealed
  const calculateStepRevealTime = () => {
    if (!crawlStartTime || currentStepIndex === undefined || !allSteps) {
      return null;
    }

    const startTime = new Date(crawlStartTime);
    let totalMinutes = 0;
    
    // Sum up reveal_after_minutes for all steps up to and including the current step
    for (let i = 0; i <= currentStepIndex; i++) {
      const stepMinutes = allSteps[i]?.reveal_after_minutes || 0;
      totalMinutes += stepMinutes;
    }
    
    const revealTime = new Date(startTime.getTime() + totalMinutes * 60 * 1000);
    return revealTime;
  };

  const revealTime = calculateStepRevealTime();
  const isPublicCrawl = crawlStartTime && allSteps && allSteps.some(s => s.reveal_after_minutes !== undefined);
  const isStepAvailable = !isPublicCrawl || !revealTime || currentTime >= revealTime;

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
    if (step.reward_location) {
      Linking.openURL(step.reward_location);
    }
  };

  const handleButtonPress = () => {
    if (!isStepAvailable) return;
    onComplete('Button pressed');
    Alert.alert('Step Complete!', 'Great! You\'ve completed this step.');
  };

  if (isCompleted) {
    return (
      <View style={styles.completedStep}>
        <Text style={styles.stepTitle}>✓ Step {step.step_number}</Text>
        <Text style={styles.stepDescription}>{step.step_components.description || step.step_components.location_name || ''}</Text>
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Status:</Text>
          <Text style={styles.userAnswer}>{userAnswer}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step {step.step_number}</Text>
      <Text style={styles.stepDescription}>{step.step_components.description || step.step_components.location_name || ''}</Text>
      
      {isPublicCrawl && revealTime && (
        <View style={styles.timeSection}>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeLabel}>Step Available At:</Text>
            <Text style={styles.targetTime}>
              {revealTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {!isStepAvailable && timeUntilReveal !== null && (
            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>Time Remaining:</Text>
              <Text style={styles.timeRemaining}>
                {formatTimeRemaining(timeUntilReveal)}
              </Text>
            </View>
          )}
          {isStepAvailable && (
            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>Status:</Text>
              <Text style={[styles.timeReached, { fontWeight: 'bold' }]}>✅ Available Now</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.buttonSection}>
        {step.reward_location && (
          <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
            <Text style={styles.mapsButtonText}>📍 Open in Maps</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            !isStepAvailable && styles.timeButtonDisabled
          ]} 
          onPress={handleButtonPress}
          disabled={!isStepAvailable}
        >
          <Text style={[
            styles.completeButtonText,
            !isStepAvailable && styles.timeButtonTextDisabled
          ]}>
            {!isStepAvailable 
              ? `⏰ Wait ${timeUntilReveal ? formatTimeRemaining(timeUntilReveal) : ''}`
              : (step.step_components.button_text || '✅ Complete Step')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface StepComponentProps {
  step: CrawlStep;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
  crawlStartTime?: string;
  stepDurations?: { [stepNumber: number]: number };
  currentStepIndex?: number;
  allSteps?: CrawlStep[];
}

export const StepComponent: React.FC<StepComponentProps> = ({ 
  step, 
  onComplete, 
  isCompleted, 
  userAnswer,
  crawlStartTime,
  stepDurations,
  currentStepIndex,
  allSteps
}) => {
  switch (step.step_type) {
    case 'riddle':
      return <RiddleStep step={step} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'location':
      return <LocationStep step={step} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'photo':
      return <PhotoStep step={step} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'button':
      return <ButtonStep step={step} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} crawlStartTime={crawlStartTime} currentStepIndex={currentStepIndex} allSteps={allSteps} />;
    default:
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Unknown Step Type</Text>
          <Text style={styles.stepDescription}>{step.step_components.description || ''}</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  stepContainer: {
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
  completedStep: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepDescription: {
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
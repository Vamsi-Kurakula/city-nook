import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { CrawlStep } from '../types/crawl';
import { validateAnswer } from '../utils/answerValidation';

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

interface StepComponentProps {
  step: CrawlStep;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export const StepComponent: React.FC<StepComponentProps> = ({ step, onComplete, isCompleted, userAnswer }) => {
  switch (step.step_type) {
    case 'riddle':
      return <RiddleStep step={step} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'location':
      return <LocationStep step={step} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
    case 'photo':
      return <PhotoStep step={step} onComplete={onComplete} isCompleted={isCompleted} userAnswer={userAnswer} />;
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
}); 
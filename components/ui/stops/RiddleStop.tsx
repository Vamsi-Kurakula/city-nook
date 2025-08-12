import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { CrawlStop } from '../../../types/crawl';
import { validateAnswer } from '../../../utils/answerValidation';

interface RiddleStopProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
}

export default function RiddleStop({ stop, onComplete, isCompleted, userAnswer }: RiddleStopProps) {
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
          placeholderTextColor="#999"
          selectionColor="#007AFF"
          cursorColor="#007AFF"
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
  inputSection: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1a1a1a',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
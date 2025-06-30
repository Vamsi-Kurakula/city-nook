import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCrawlContext } from './CrawlContext';
import { Crawl, CrawlStep } from '../types/crawl';
import { loadCrawlSteps } from './auto-generated/crawlAssetLoader';
import { StepComponent } from './StepComponents';

const CrawlSessionScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { crawl: navCrawl } = (route.params as { crawl: Crawl });
  const {
    currentCrawl,
    setCurrentCrawl,
    isCrawlActive,
    setIsCrawlActive,
    currentProgress,
    setCurrentProgress,
    completeStep,
    nextStep,
    getCurrentStep,
    clearCrawlSession,
  } = useCrawlContext();

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<CrawlStep[]>(navCrawl.steps || []);
  const [showPastSteps, setShowPastSteps] = useState(false);

  // Load steps if not present
  useEffect(() => {
    if (!navCrawl.steps || navCrawl.steps.length === 0) {
      setLoading(true);
      loadCrawlSteps(navCrawl.assetFolder).then(data => {
        setSteps(data?.steps || []);
        setLoading(false);
      });
    } else {
      setSteps(navCrawl.steps);
    }
  }, [navCrawl]);

  // Start session if not already
  useEffect(() => {
    if (!isCrawlActive || !currentCrawl || currentCrawl.id !== navCrawl.id) {
      setCurrentCrawl({ ...navCrawl, steps });
      setIsCrawlActive(true);
      setCurrentProgress({
        crawl_id: navCrawl.id,
        current_step: 1,
        completed_steps: [],
        started_at: new Date(),
        last_updated: new Date(),
        completed: false,
      });
    }
  }, [isCrawlActive, currentCrawl, navCrawl, setCurrentCrawl, setIsCrawlActive, setCurrentProgress, steps]);

  const currentStepNumber = getCurrentStep();
  const totalSteps = steps.length;
  const isCompleted = currentProgress?.completed || false;
  const completedSteps = currentProgress?.completed_steps || [];

  const handleExit = useCallback(() => {
    Alert.alert(
      'Exit Crawl',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            await clearCrawlSession();
            navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
          },
        },
      ]
    );
  }, [clearCrawlSession, navigation]);

  const handleStepComplete = (userAnswer: string) => {
    completeStep(currentStepNumber, userAnswer);
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  const progressPercent = totalSteps > 0 ? Math.round(((currentStepNumber - 1) / totalSteps) * 100) : 0;

  if (loading || !steps.length) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.completionTitle}>🎉 Crawl Completed!</Text>
          <Text style={styles.completionText}>You finished all steps of this crawl.</Text>
          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Text style={styles.exitButtonText}>Back to Library</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = steps[currentStepNumber - 1];

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressPercentText}>{progressPercent}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressText}>Step {currentStepNumber} of {totalSteps}</Text>
        <TouchableOpacity style={styles.exitButtonSmall} onPress={handleExit}>
          <Text style={styles.exitButtonSmallText}>Exit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stepContainer}>
        <StepComponent
          step={currentStep}
          onComplete={handleStepComplete}
          isCompleted={false}
          crawlStartTime={navCrawl.start_time}
          stepDurations={undefined}
          currentStepIndex={currentStepNumber - 1}
        />
      </View>
      {/* Show Past Steps Button */}
      <TouchableOpacity style={styles.pastStepsButton} onPress={() => setShowPastSteps(true)}>
        <Text style={styles.pastStepsButtonText}>See All Past Steps</Text>
      </TouchableOpacity>
      {/* Past Steps Modal */}
      <Modal visible={showPastSteps} animationType="slide" onRequestClose={() => setShowPastSteps(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Past Steps</Text>
          <FlatList
            data={completedSteps}
            keyExtractor={item => item.step_number.toString()}
            renderItem={({ item }) => {
              const step = steps.find(s => s.step_number === item.step_number);
              const question = step?.step_components?.description || step?.step_components?.riddle || step?.step_components?.photo_instructions || step?.step_components?.location_name || step?.step_components?.photo_target || '';
              return (
                <View style={styles.pastStepItem}>
                  <Text style={styles.pastStepTitle}>Step {item.step_number}</Text>
                  <Text style={styles.pastStepQuestion}>{question}</Text>
                  <Text style={styles.pastStepAnswer}>Answer: {item.user_answer}</Text>
                  <Text style={styles.pastStepTime}>Completed: {item.completed_at ? new Date(item.completed_at).toLocaleString() : ''}</Text>
                  {step?.reward_location && (
                    <TouchableOpacity onPress={() => Linking.openURL(step.reward_location)}>
                      <Text style={styles.pastStepLink}>📍 Open Reward Location</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.noPastSteps}>No steps completed yet.</Text>}
          />
          <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowPastSteps(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  progressPercentText: {
    fontSize: 14,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressText: { fontSize: 16, fontWeight: 'bold' },
  exitButtonSmall: { padding: 8 },
  exitButtonSmallText: { color: '#888', fontSize: 16 },
  stepContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  completionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  completionText: { fontSize: 16, marginBottom: 24 },
  exitButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8 },
  exitButtonText: { color: '#333', fontSize: 16 },
  pastStepsButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pastStepsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pastStepItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  pastStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pastStepQuestion: {
    fontSize: 15,
    color: '#222',
    marginTop: 4,
    marginBottom: 4,
  },
  pastStepAnswer: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  pastStepTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  pastStepLink: {
    color: '#007AFF',
    fontSize: 15,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  noPastSteps: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
  },
  closeModalButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
  },
  closeModalButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default CrawlSessionScreen; 
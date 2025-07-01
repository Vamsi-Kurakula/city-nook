import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCrawlContext } from './CrawlContext';
import { Crawl, CrawlStep } from '../types/crawl';
import { loadCrawlSteps } from './auto-generated/crawlAssetLoader';
import { StepComponent } from './StepComponents';
import { useAuthContext } from './AuthContext';
import { saveCrawlProgress, addCrawlHistory } from '../utils/supabase';

const CrawlSessionScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  // Defensive extraction and logging
  const routeParams = route.params as { crawl?: any; crawlId?: string; resumeData?: any; resumeProgress?: any } | undefined;
  const crawlData = routeParams?.crawl;
  const crawlId = routeParams?.crawlId;
  console.log('CrawlSessionScreen route params:', routeParams);
  if (!crawlData && !crawlId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>No crawl data found (CrawlSessionScreen).</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
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
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<CrawlStep[]>(routeParams?.crawl?.steps || []);
  const [showPastSteps, setShowPastSteps] = useState(false);

  // Load crawl data if we only have crawlId
  useEffect(() => {
    if (!crawlData && crawlId) {
      setLoading(true);
      // For now, we'll need to load the crawl data based on crawlId
      // This would need to be implemented based on your crawl loading logic
      setLoading(false);
    } else if (routeParams?.crawl) {
      // crawlData is already set as a constant from routeParams.crawl
    }
  }, [crawlData, crawlId, routeParams?.crawl]);

  // Load steps if not present
  useEffect(() => {
    if (crawlData && (!crawlData.steps || crawlData.steps.length === 0)) {
      setLoading(true);
      loadCrawlSteps(crawlData.assetFolder).then(data => {
        setSteps(data?.steps || []);
        setLoading(false);
      });
    } else if (crawlData) {
      setSteps(crawlData.steps || []);
    }
  }, [crawlData]);

  // Start session if not already
  useEffect(() => {
    if (crawlData && (!isCrawlActive || !currentCrawl || currentCrawl.id !== crawlData.id)) {
      setCurrentCrawl({ ...crawlData, steps });
      setIsCrawlActive(true);
      const resumeDataToUse = routeParams?.resumeData || routeParams?.resumeProgress;
      if (resumeDataToUse) {
        setCurrentProgress({
          crawl_id: crawlData.id,
          current_step: resumeDataToUse.currentStep || resumeDataToUse.current_step,
          completed_steps: (resumeDataToUse.completedSteps || resumeDataToUse.completed_steps || []).map((stepNum: number, idx: number) => ({
            step_number: stepNum,
            completed: true,
            user_answer: '', // If you want to store answers, update this
            completed_at: undefined,
          })),
          started_at: resumeDataToUse.startTime || resumeDataToUse.started_at ? new Date(resumeDataToUse.startTime || resumeDataToUse.started_at) : new Date(),
          last_updated: resumeDataToUse.updated_at ? new Date(resumeDataToUse.updated_at) : new Date(),
          completed: false,
        });
      } else {
        setCurrentProgress({
          crawl_id: crawlData.id,
          current_step: 1,
          completed_steps: [],
          started_at: new Date(),
          last_updated: new Date(),
          completed: false,
        });
      }
    }
  }, [isCrawlActive, currentCrawl, crawlData, setCurrentCrawl, setIsCrawlActive, setCurrentProgress, steps, routeParams?.resumeData, routeParams?.resumeProgress]);

  const currentStepNumber = getCurrentStep();
  const totalSteps = steps.length;
  const isCompleted = currentProgress?.completed || false;
  const completedSteps = currentProgress?.completed_steps || [];

  const handleExit = useCallback(() => {
    Alert.alert(
      'Exit Crawl',
      'Do you want to save your progress before exiting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit Without Saving',
          style: 'destructive',
          onPress: async () => {
            await clearCrawlSession();
            navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
          },
        },
        {
          text: 'Save and Exit',
          style: 'default',
          onPress: async () => {
            if (user?.id && currentProgress) {
              await saveCrawlProgress({
                userId: user.id,
                crawlId: currentProgress.crawl_id,
                currentStep: currentProgress.current_step,
                completedSteps: currentProgress.completed_steps.map(s => s.step_number),
                startedAt: new Date(currentProgress.started_at).toISOString(),
                completedAt: currentProgress.completed ? new Date().toISOString() : undefined,
              });
            }
            await clearCrawlSession();
            navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
          },
        },
      ]
    );
  }, [clearCrawlSession, navigation, user, currentProgress]);

  const handleStepComplete = (userAnswer: string) => {
    completeStep(currentStepNumber, userAnswer);
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  const progressPercent = totalSteps > 0 ? Math.round(((currentStepNumber - 1) / totalSteps) * 100) : 0;

  useEffect(() => {
    if (isCompleted && user?.id && currentProgress && currentCrawl) {
      const started = new Date(currentProgress.started_at);
      const completed = new Date();
      const totalTimeMinutes = Math.round((completed.getTime() - started.getTime()) / 60000);
      (async () => {
        await addCrawlHistory({
          userId: user.id,
          crawlId: currentCrawl.id,
          completedAt: completed.toISOString(),
          totalTimeMinutes,
        });
        await saveCrawlProgress({
          userId: user.id,
          crawlId: currentCrawl.id,
          currentStep: currentProgress.current_step,
          completedSteps: currentProgress.completed_steps.map(s => s.step_number),
          startedAt: started.toISOString(),
          completedAt: completed.toISOString(),
        });
      })();
    }
  }, [isCompleted, user, currentProgress, currentCrawl, clearCrawlSession, navigation]);

  if (loading || !crawlData || !steps.length) {
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
          <Text style={styles.completionText}>You finished all steps of this crawl. Your progress has been saved.</Text>
          <TouchableOpacity style={styles.exitButton} onPress={async () => {
            await clearCrawlSession();
            navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
          }}>
            <Text style={styles.exitButtonText}>Back to Library</Text>
          </TouchableOpacity>
          <Text style={styles.swipeHint}>Or swipe left to return to the library</Text>
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
          crawlStartTime={crawlData?.start_time}
          currentStepIndex={currentStepNumber - 1}
          allSteps={steps}
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
  completionText: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
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
  swipeHint: {
    marginTop: 16,
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CrawlSessionScreen; 
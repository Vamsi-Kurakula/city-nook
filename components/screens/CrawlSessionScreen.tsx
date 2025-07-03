import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCrawlContext } from '../context/CrawlContext';
import { Crawl, CrawlStop } from '../../types/crawl';
import { loadCrawlStops } from '../auto-generated/crawlAssetLoader';
import { StopComponent } from '../ui/StopComponents';
import { useAuthContext } from '../context/AuthContext';
import { saveCrawlProgress, addCrawlHistory } from '../../utils/supabase';

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
    completeStop,
    nextStop,
    getCurrentStop,
    clearCrawlSession,
  } = useCrawlContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<CrawlStop[]>(routeParams?.crawl?.stops || []);
  const [showPastStops, setShowPastStops] = useState(false);

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

  // Load stops if not present
  useEffect(() => {
    if (crawlData && (!crawlData.stops || crawlData.stops.length === 0)) {
      setLoading(true);
      loadCrawlStops(crawlData.assetFolder).then(data => {
        setStops(data?.stops || []);
        setLoading(false);
      });
    } else if (crawlData) {
      setStops(crawlData.stops || []);
    }
  }, [crawlData]);

  // Start session if not already
  useEffect(() => {
    if (crawlData && (!isCrawlActive || !currentCrawl || currentCrawl.id !== crawlData.id)) {
      setCurrentCrawl({ ...crawlData, stops });
      setIsCrawlActive(true);
      const resumeDataToUse = routeParams?.resumeData || routeParams?.resumeProgress;
      if (resumeDataToUse) {
        setCurrentProgress({
          crawl_id: crawlData.id,
          current_stop: resumeDataToUse.currentStop || resumeDataToUse.current_stop,
          completed_stops: (resumeDataToUse.completedStops || resumeDataToUse.completed_stops || []).map((stopNum: number, idx: number) => ({
            stop_number: stopNum,
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
          current_stop: 1,
          completed_stops: [],
          started_at: new Date(),
          last_updated: new Date(),
          completed: false,
        });
      }
    }
  }, [isCrawlActive, currentCrawl, crawlData, setCurrentCrawl, setIsCrawlActive, setCurrentProgress, stops, routeParams?.resumeData, routeParams?.resumeProgress]);

  const currentStopNumber = getCurrentStop();
  const totalStops = stops.length;
  const isCompleted = currentProgress?.completed || false;
  const completedStops = currentProgress?.completed_stops || [];

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
                currentStop: currentProgress.current_stop,
                completedStops: currentProgress.completed_stops.map((s: any) => s.stop_number),
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

  const handleStopComplete = (userAnswer: string) => {
    completeStop(currentStopNumber, userAnswer);
    setTimeout(() => {
      nextStop();
    }, 1000);
  };

  const progressPercent = totalStops > 0 ? Math.round(((currentStopNumber - 1) / totalStops) * 100) : 0;

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
          currentStop: currentProgress.current_stop,
          completedStops: currentProgress.completed_stops.map((s: any) => s.stop_number),
          startedAt: started.toISOString(),
          completedAt: completed.toISOString(),
        });
      })();
    }
  }, [isCompleted, user, currentProgress, currentCrawl, clearCrawlSession, navigation]);

  const isPublicCrawl = crawlData?.start_time && stops && stops.some((s: CrawlStop) => s.reveal_after_minutes !== undefined);

  if (loading || !crawlData || !stops.length) {
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
          <Text style={styles.completionText}>You finished all stops of this crawl. Your progress has been saved.</Text>
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

  const currentStop = stops[currentStopNumber - 1];

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
        <Text style={styles.progressText}>Stop {currentStopNumber} of {totalStops}</Text>
        <TouchableOpacity style={styles.exitButtonSmall} onPress={handleExit}>
          <Text style={styles.exitButtonSmallText}>Exit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stopContainer}>
        <StopComponent
          stop={currentStop}
          onComplete={handleStopComplete}
          isCompleted={false}
          crawlStartTime={crawlData?.start_time}
          currentStopIndex={currentStopNumber - 1}
          allStops={stops}
        />
      </View>
      {/* Show Past Stops Button */}
      <TouchableOpacity style={styles.pastStopsButton} onPress={() => setShowPastStops(true)}>
        <Text style={styles.pastStopsButtonText}>See All Past Stops</Text>
      </TouchableOpacity>
      {/* Past Stops Modal */}
      <Modal visible={showPastStops} animationType="slide" onRequestClose={() => setShowPastStops(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Past Stops</Text>
          <FlatList
            data={completedStops}
            keyExtractor={item => item.stop_number.toString()}
            renderItem={({ item }) => {
              const stop = stops.find((s: CrawlStop) => s.stop_number === item.stop_number);
              const question = stop?.stop_components?.description || stop?.stop_components?.riddle || stop?.stop_components?.photo_instructions || stop?.stop_components?.location_name || stop?.stop_components?.photo_target || '';
              return (
                <View style={styles.pastStopItem}>
                  <Text style={styles.pastStopTitle}>Stop {item.stop_number}</Text>
                  <Text style={styles.pastStopQuestion}>{question}</Text>
                  <Text style={styles.pastStopAnswer}>Answer: {item.user_answer}</Text>
                  <Text style={styles.pastStopTime}>Completed: {item.completed_at ? new Date(item.completed_at).toLocaleString() : ''}</Text>
                  {stop?.reward_location && (
                    <TouchableOpacity onPress={() => Linking.openURL(stop.reward_location)}>
                      <Text style={styles.pastStopLink}>📍 Open Reward Location</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.noPastStops}>No stops completed yet.</Text>}
          />
          <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowPastStops(false)}>
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
  stopContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  completionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  completionText: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  exitButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8 },
  exitButtonText: { color: '#333', fontSize: 16 },
  pastStopsButton: {
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
  pastStopsButtonText: {
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
  pastStopItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  pastStopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pastStopQuestion: {
    fontSize: 15,
    color: '#222',
    marginTop: 4,
    marginBottom: 4,
  },
  pastStopAnswer: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  pastStopTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  pastStopLink: {
    color: '#007AFF',
    fontSize: 15,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  noPastStops: {
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
});

export default CrawlSessionScreen; 
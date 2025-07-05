import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCrawlContext } from '../context/CrawlContext';
import { Crawl, CrawlStop } from '../../types/crawl';
import { loadCrawlStops } from '../auto-generated/crawlAssetLoader';
import { StopComponent } from '../ui/StopComponents';
import CrawlMap from '../ui/CrawlMap';
import { useAuthContext } from '../context/AuthContext';
import { saveCrawlProgress, addCrawlHistory } from '../../utils/supabase';
import { extractAllCoordinates, LocationCoordinates } from '../../utils/coordinateExtractor';

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
  const [coordinates, setCoordinates] = useState<LocationCoordinates[]>([]);
  const [showPastStops, setShowPastStops] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isGateCompleted, setIsGateCompleted] = useState(false);
  const [isNextStopRevealed, setIsNextStopRevealed] = useState(false);

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

  // Extract coordinates when stops are loaded
  useEffect(() => {
    if (stops.length > 0) {
      console.log('Extracting coordinates for', stops.length, 'stops');
      extractAllCoordinates(stops).then(coords => {
        setCoordinates(coords);
        console.log('Coordinates extracted:', coords.length);
      });
    }
  }, [stops]);

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
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          },
        },
      ]
    );
  }, [clearCrawlSession, navigation, user, currentProgress]);

  const handleStopComplete = (userAnswer: string) => {
    completeStop(currentStopNumber, userAnswer);
    setIsGateCompleted(true);
    setIsNextStopRevealed(true);
  };

  const handleNextStep = () => {
    if (isGateCompleted) {
      setIsGateCompleted(false);
      setIsNextStopRevealed(false);
      nextStop();
    }
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
          <TouchableOpacity style={styles.completionExitButton} onPress={async () => {
            await clearCrawlSession();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }}>
            <Text style={styles.completionExitButtonText}>Back to Library</Text>
          </TouchableOpacity>
          <Text style={styles.swipeHint}>Or swipe left to return to the library</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStop = stops[currentStopNumber - 1];

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Top Section - Exit Button and Future Buttons */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
        <View style={styles.topRightButtons}>
          {/* Future buttons will go here */}
        </View>
      </View>

      {/* Fixed Progress Bar Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercentText}>{progressPercent}%</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        {/* Current Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <View style={styles.locationContent}>
            <Text style={styles.locationName}>{currentStop?.location_name || 'Unknown Location'}</Text>
          </View>
        </View>

        {/* Gate Section - Stop Type Content */}
        <View style={styles.gateSection}>
          <Text style={styles.sectionTitle}>Current Challenge</Text>
          <View style={styles.gateContent}>
            <StopComponent
              stop={currentStop}
              onComplete={handleStopComplete}
              isCompleted={isGateCompleted}
              crawlStartTime={crawlData?.start_time}
              currentStopIndex={currentStopNumber - 1}
              allStops={stops}
            />
          </View>
        </View>

        {/* Travel Section - Next Stop Info */}
        <View style={styles.travelSection}>
          <Text style={styles.sectionTitle}>Next Stop</Text>
          <View style={styles.travelContent}>
            {isNextStopRevealed && currentStopNumber < totalStops ? (
              <>
                <Text style={styles.nextStopName}>{stops[currentStopNumber]?.location_name || 'Next Location'}</Text>
                {stops[currentStopNumber]?.location_link && (
                  <TouchableOpacity onPress={() => Linking.openURL(stops[currentStopNumber]?.location_link!)}>
                    <Text style={styles.locationLink}>📍 Open in Maps</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.travelText}>
                {currentStopNumber >= totalStops ? 'This is the final stop!' : 'Complete the current challenge to unlock the next location.'}
              </Text>
            )}
          </View>
        </View>

        {/* Bottom Buttons Section */}
        <View style={styles.bottomButtonsSection}>
          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowMap(true)}>
            <Text style={styles.bottomButtonText}>🗺️ Map</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.bottomButton, 
              styles.nextButton, 
              isGateCompleted ? styles.enabledButton : styles.disabledButton
            ]}
            onPress={handleNextStep}
            disabled={!isGateCompleted}
          >
            <Text style={[
              styles.bottomButtonText, 
              isGateCompleted ? styles.enabledButtonText : styles.disabledButtonText
            ]}>
              Next Step
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowPastStops(true)}>
            <Text style={styles.bottomButtonText}>📋 Past Steps</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                  {stop?.location_link && (
                    <TouchableOpacity onPress={() => Linking.openURL(stop.location_link!)}>
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

      {/* Map Modal */}
      <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crawl Map</Text>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowMap(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <CrawlMap
              stops={stops}
              currentStopNumber={currentStopNumber}
              completedStops={completedStops.map(stop => stop.stop_number)}
              isNextStopRevealed={isNextStopRevealed}
              coordinates={coordinates}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollableContent: { flex: 1 },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exitButton: { 
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  exitButtonText: { color: '#666', fontSize: 14, fontWeight: '600' },
  topRightButtons: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  progressText: { 
    fontSize: 14, 
    fontWeight: '600',
    color: '#333',
  },
  locationSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8,
    color: '#333',
  },
  locationContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationName: { 
    fontSize: 16, 
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  locationLink: { 
    color: '#007AFF', 
    fontSize: 14, 
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  gateSection: {
    padding: 16,
    minHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  gateContent: { 
    minHeight: 150,
  },
  travelSection: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    minHeight: 80,
  },
  travelContent: { 
    paddingVertical: 8,
  },
  travelText: { 
    color: '#666', 
    fontSize: 14,
    fontStyle: 'italic',
  },
  nextStopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bottomButtonsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bottomButton: { 
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bottomButtonText: { 
    color: '#333', 
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: { 
    backgroundColor: '#007AFF',
  },
  disabledButton: { 
    backgroundColor: '#e0e0e0',
  },
  disabledButtonText: { 
    color: '#999',
  },
  enabledButton: {
    backgroundColor: '#007AFF',
  },
  enabledButtonText: {
    color: '#fff',
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  completionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  completionText: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  completionExitButton: { 
    backgroundColor: '#007AFF', 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 12,
    marginBottom: 16,
  },
  completionExitButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapContainer: {
    flex: 1,
  },
});

export default CrawlSessionScreen; 
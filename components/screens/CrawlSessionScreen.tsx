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
import { saveCrawlProgress, addCrawlHistory, deleteCrawlProgress, supabase } from '../../utils/supabase';
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
    loadProgressFromDatabase,
    clearCrawlSession,
    saveAndClearCrawlSession,
  } = useCrawlContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<CrawlStop[]>(routeParams?.crawl?.stops || []);
  const [coordinates, setCoordinates] = useState<LocationCoordinates[]>([]);
  const [showPastStops, setShowPastStops] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isGateCompleted, setIsGateCompleted] = useState(false);
  const [isNextStopRevealed, setIsNextStopRevealed] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [crawlCompleted, setCrawlCompleted] = useState(false);

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
    const setupSession = async () => {
      if (crawlData && (!isCrawlActive || !currentCrawl || currentCrawl.id !== crawlData.id) && !isCompleting) {
        console.log('Setting up new crawl session for:', crawlData.id);
        setCurrentCrawl({ ...crawlData, stops });
        setIsCrawlActive(true);
        
        // Load progress from database if user is logged in
        if (user?.id) {
          const isPublic = crawlData['public-crawl'] || false;
          const progressFound = await loadProgressFromDatabase(user.id, crawlData.id, isPublic);
          
          if (progressFound) {
            // Progress was found for this specific crawl
            console.log('Loaded existing progress for crawl:', crawlData.id, 'isPublic:', isPublic);
          } else {
            // No progress was loaded from database, initialize new progress for this crawl
            console.log('Initializing new progress for crawl:', crawlData.id, 'isPublic:', isPublic);
            setCurrentProgress({
              crawl_id: crawlData.id,
              is_public: isPublic,
              current_stop: 1,
              completed_stops: [],
              started_at: new Date(),
              last_updated: new Date(),
              completed: false,
            });
          }
        } else {
          // Fallback to resume data if no user (for backward compatibility)
          const resumeDataToUse = routeParams?.resumeData || routeParams?.resumeProgress;
          if (resumeDataToUse) {
            console.log('Setting up resume progress with data:', resumeDataToUse);
            
            // Calculate the correct current stop based on completed stops
            const completedStops = resumeDataToUse.completedStops || resumeDataToUse.completed_stops || [];
            const completedCount = completedStops.length;
            const totalStops = stops.length;
            
            // If user has completed N stops, they should be on stop N+1
            // But don't exceed the total number of stops
            const calculatedCurrentStop = Math.min(completedCount + 1, totalStops);
            
            console.log('Resume calculation:', {
              completedStops,
              completedCount,
              totalStops,
              calculatedCurrentStop,
              originalCurrentStop: resumeDataToUse.currentStop || resumeDataToUse.current_stop
            });
            
            const newProgress = {
              crawl_id: crawlData.id,
              is_public: crawlData['public-crawl'] || false,
              current_stop: calculatedCurrentStop,
              completed_stops: completedStops.map((stopNum: number, idx: number) => ({
                stop_number: stopNum,
                completed: true,
                user_answer: '', // If you want to store answers, update this
                completed_at: undefined,
              })),
              started_at: resumeDataToUse.startTime || resumeDataToUse.started_at ? new Date(resumeDataToUse.startTime || resumeDataToUse.started_at) : new Date(),
              last_updated: resumeDataToUse.updated_at ? new Date(resumeDataToUse.updated_at) : new Date(),
              completed: completedCount >= totalStops,
            };
            console.log('Setting current progress to:', newProgress);
            setCurrentProgress(newProgress);
          } else {
            setCurrentProgress({
              crawl_id: crawlData.id,
              is_public: crawlData['public-crawl'] || false,
              current_stop: 1,
              completed_stops: [],
              started_at: new Date(),
              last_updated: new Date(),
              completed: false,
            });
          }
        }
      }
    };
    
    setupSession();
  }, [crawlData?.id, user?.id, routeParams?.resumeData, routeParams?.resumeProgress, stops.length, isCompleting]);

  // Save progress to database when session starts
  useEffect(() => {
    const saveInitialProgress = async () => {
      if (user?.id && currentProgress && currentCrawl && crawlData && !routeParams?.resumeData && !routeParams?.resumeProgress) {
        // Only save if this is a new session (not resuming)
        console.log('Saving initial progress to database:', currentProgress);
        console.log('Crawl data:', crawlData);
        
        // Ensure is_public is set correctly
        const isPublic = currentProgress.is_public ?? (crawlData?.['public-crawl'] || false);
        console.log('Determined is_public value:', isPublic, 'from currentProgress.is_public:', currentProgress.is_public, 'from crawlData:', crawlData?.['public-crawl']);
        
        // Temporarily save without completed_stops until database schema is fixed
        const progressData = {
          user_id: user.id,
          crawl_id: currentProgress.crawl_id,
          is_public: isPublic,
          current_stop: currentProgress.current_stop,
          started_at: new Date(currentProgress.started_at).toISOString(),
          completed_at: undefined,
        };
        
        console.log('Progress data to save:', progressData);
        
        const { error } = await supabase
          .from('crawl_progress')
          .upsert([progressData], { onConflict: 'user_id' });
          
        if (error) {
          console.error('Error saving initial progress:', error);
        } else {
          console.log('Initial progress saved successfully');
        }
      }
    };
    
    saveInitialProgress();
  }, [user?.id, currentProgress, currentCrawl, crawlData, routeParams?.resumeData, routeParams?.resumeProgress]);

  const currentStopNumber = getCurrentStop();
  const totalStops = stops.length;
  const isCompleted = currentProgress?.completed || false;
  const completedStops = currentProgress?.completed_stops || [];
  
  // Debug logging
  console.log('CrawlSessionScreen render - currentStopNumber:', currentStopNumber, 'currentProgress:', currentProgress, 'isCompleted:', isCompleted, 'isCompleting:', isCompleting, 'crawlCompleted:', crawlCompleted);

  const handleExit = useCallback(async () => {
    // Automatically save progress before exiting
    if (user?.id && currentProgress) {
      // Convert completed_stops to array of numbers
      const completedStopNumbers = currentProgress.completed_stops.map((s: any) => 
        typeof s === 'number' ? s : s.stop_number
      );
      
      await saveCrawlProgress({
        userId: user.id,
        crawlId: currentProgress.crawl_id,
        isPublic: currentProgress.is_public ?? (crawlData?.['public-crawl'] || false),
        currentStop: currentProgress.current_stop,
        completedStops: completedStopNumbers,
        startedAt: new Date(currentProgress.started_at).toISOString(),
        completedAt: currentProgress.completed ? new Date().toISOString() : undefined,
      });
    }
    await saveAndClearCrawlSession();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [saveAndClearCrawlSession, navigation, user, currentProgress]);

  const handleStopComplete = async (userAnswer: string) => {
    await completeStop(currentStopNumber, userAnswer, user?.id);
    setIsGateCompleted(true);
    setIsNextStopRevealed(true);
  };

  const handleNextStep = async () => {
    if (isGateCompleted) {
      setIsGateCompleted(false);
      setIsNextStopRevealed(false);
      await nextStop(user?.id);
    }
  };



  const progressPercent = totalStops > 0 ? Math.round(((currentStopNumber - 1) / totalStops) * 100) : 0;

  useEffect(() => {
    console.log('Completion useEffect triggered - isCompleted:', isCompleted, 'user:', !!user?.id, 'currentProgress:', !!currentProgress, 'currentCrawl:', !!currentCrawl, 'isCompleting:', isCompleting);
    if (isCompleted && user?.id && currentProgress && currentCrawl && !isCompleting) {
      console.log('Starting crawl completion process');
      setIsCompleting(true);
      
      // Store completion data before clearing session
      const completionData = {
        started: new Date(currentProgress.started_at),
        completed: new Date(),
        crawlId: currentCrawl.id,
        isPublic: currentProgress.is_public ?? (crawlData?.['public-crawl'] || false),
      };
      
      (async () => {
        try {
          const totalTimeMinutes = Math.round((completionData.completed.getTime() - completionData.started.getTime()) / 60000);
          
          // Add to history first
          await addCrawlHistory({
            userId: user.id,
            crawlId: completionData.crawlId,
            isPublic: completionData.isPublic,
            completedAt: completionData.completed.toISOString(),
            totalTimeMinutes,
          });
          
          // Delete the progress record since crawl is completed
          await deleteCrawlProgress({
            userId: user.id,
          });
          
          console.log('Crawl completed and progress record deleted');
          
          // Clear local state to prevent further database queries
          await clearCrawlSession();
          
          // Reset the completing flag and mark crawl as completed
          setIsCompleting(false);
          setCrawlCompleted(true);
        } catch (error) {
          console.error('Error completing crawl:', error);
          setIsCompleting(false);
        }
      })();
    }
  }, [isCompleted, user, currentProgress, currentCrawl, clearCrawlSession, navigation, isCompleting]);

  const isPublicCrawl = crawlData?.start_time && stops && stops.some((s: CrawlStop) => s.reveal_after_minutes !== undefined);

  if (loading || !crawlData || !stops.length || isCompleting) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
        {isCompleting && <Text style={{ marginTop: 16, textAlign: 'center' }}>Completing crawl...</Text>}
      </SafeAreaView>
    );
  }

  if ((isCompleted || crawlCompleted) && !isCompleting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.completionTitle}>🎉 Crawl Completed!</Text>
          <Text style={styles.completionText}>You finished all stops of this crawl. Your progress has been saved.</Text>
          <TouchableOpacity style={styles.completionExitButton} onPress={async () => {
            // Progress record is already deleted in the completion useEffect
            setIsCompleting(false);
            setCrawlCompleted(false);
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
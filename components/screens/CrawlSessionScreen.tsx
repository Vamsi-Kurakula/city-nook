import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCrawlContext } from '../context/CrawlContext';
import { useTheme } from '../context/ThemeContext';
import { Crawl, CrawlStop } from '../../types/crawl';
import { loadCrawlStops } from '../../utils/database';
import { StopComponent } from '../ui/stops';
import CrawlMap from '../ui/CrawlMap';
import { useAuthContext } from '../context/AuthContext';
import { saveCrawlProgress, addCrawlHistory, deleteCrawlProgress, supabase } from '../../utils/database';
import { getCrawlProgress } from '../../utils/database/progressOperations';
import { extractAllCoordinates, LocationCoordinates } from '../../utils/coordinateExtractor';
import BackButton from '../ui/BackButton';

const CrawlSessionScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  // Defensive extraction and logging
  const routeParams = route.params as { crawl?: any; crawlId?: string; resumeData?: any; resumeProgress?: any } | undefined;
  const crawlData = routeParams?.crawl;
  const crawlId = routeParams?.crawlId;
  console.log('CrawlSessionScreen route params:', routeParams);
  if (!crawlData && !crawlId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>No crawl data found (CrawlSessionScreen).</Text>
        <BackButton onPress={() => navigation.goBack()} label="Back" style={styles.exitButton} textStyle={styles.exitButtonText} />
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
  const [isResumingFromDatabase, setIsResumingFromDatabase] = useState(false);

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
      // Use crawl ID directly instead of asset folder
      const { getCrawlStops } = require('../../utils/database/crawlDefinitionOperations');
      getCrawlStops(crawlData.id).then((stops: CrawlStop[]) => {
        setStops(stops || []);
        setLoading(false);
      }).catch((error: any) => {
        console.error('Error loading stops:', error);
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
          
          // Only check for progress, not completion
          const progressFound = await getCrawlProgress(user.id, crawlData.id, isPublic);
          
          if (progressFound) {
            // Progress was found for this specific crawl
            console.log('Loaded existing progress for crawl:', crawlData.id, 'isPublic:', isPublic);
            
            // Convert database format to local format and set it
            const localProgress = {
              crawl_id: progressFound.crawl_id,
              is_public: progressFound.is_public,
              current_stop: progressFound.current_stop,
              completed_stops: progressFound.completed_stops.map((stopNum: number) => ({
                stop_number: stopNum,
                completed: true,
                user_answer: '',
                completed_at: new Date(),
              })),
              started_at: new Date(progressFound.started_at),
              last_updated: new Date(progressFound.updated_at),
              completed: !!progressFound.completed_at,
            };
            
            console.log('Setting current progress from database:', localProgress);
            setCurrentProgress(localProgress);
            setIsResumingFromDatabase(true);
            console.log('Set isResumingFromDatabase to true');
          } else {
            // No progress was loaded from database, always initialize new progress
            console.log('No database progress found, initializing new progress for crawl:', crawlData.id, 'isPublic:', isPublic);
            setCurrentProgress({
              crawl_id: crawlData.id,
              is_public: isPublic,
              current_stop: 1,
              completed_stops: [],
              started_at: new Date(),
              last_updated: new Date(),
              completed: false,
            });
            setIsResumingFromDatabase(false);
            console.log('Set isResumingFromDatabase to false');
          }
        } else {
          // Fallback for no user (for backward compatibility)
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
    };
    
    setupSession();
  }, [crawlData?.id, user?.id, stops.length, isCompleting]);

  // Save progress to database when session starts
  useEffect(() => {
    const saveInitialProgress = async () => {
      console.log('saveInitialProgress useEffect triggered with:', {
        hasUser: !!user?.id,
        hasCurrentProgress: !!currentProgress,
        hasCurrentCrawl: !!currentCrawl,
        hasCrawlData: !!crawlData,
        hasResumeData: !!routeParams?.resumeData,
        hasResumeProgress: !!routeParams?.resumeProgress,
        isResumingFromDatabase,
        currentProgressDetails: currentProgress ? {
          currentStop: currentProgress.current_stop,
          completedStopsLength: currentProgress.completed_stops.length,
          crawlId: currentProgress.crawl_id,
          isPublic: currentProgress.is_public,
        } : null,
      });
      
      // Only save if this is a truly new session (not resuming from database)
      // Check if we have a new progress that was just created (not loaded from database)
      const isNewProgress = currentProgress && 
                           currentProgress.current_stop === 1 && 
                           currentProgress.completed_stops.length === 0 &&
                           !isResumingFromDatabase;
      
      console.log('saveInitialProgress condition check:', {
        hasUser: !!user?.id,
        hasCurrentProgress: !!currentProgress,
        hasCurrentCrawl: !!currentCrawl,
        hasCrawlData: !!crawlData,
        noResumeData: !routeParams?.resumeData,
        noResumeProgress: !routeParams?.resumeProgress,
        isNewProgress,
        isResumingFromDatabase,
      });
      
      if (user?.id && currentProgress && currentCrawl && crawlData && 
          !routeParams?.resumeData && !routeParams?.resumeProgress &&
          isNewProgress) {
        
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
      } else {
        console.log('Not saving initial progress - conditions not met');
        
        // Fallback: If we have a user and current progress but didn't save, 
        // and this looks like a new session, try to save anyway
        if (user?.id && currentProgress && currentCrawl && crawlData && 
            currentProgress.current_stop === 1 && 
            currentProgress.completed_stops.length === 0) {
          
          console.log('Attempting fallback save of initial progress');
          
          const isPublic = currentProgress.is_public ?? (crawlData?.['public-crawl'] || false);
          const progressData = {
            user_id: user.id,
            crawl_id: currentProgress.crawl_id,
            is_public: isPublic,
            current_stop: currentProgress.current_stop,
            started_at: new Date(currentProgress.started_at).toISOString(),
            completed_at: undefined,
          };
          
          const { error } = await supabase
            .from('crawl_progress')
            .upsert([progressData], { onConflict: 'user_id' });
            
          if (error) {
            console.error('Error in fallback save of initial progress:', error);
          } else {
            console.log('Fallback initial progress saved successfully');
          }
        }
      }
    };
    
    saveInitialProgress();
  }, [user?.id, currentProgress, currentCrawl, crawlData, routeParams?.resumeData, routeParams?.resumeProgress, isResumingFromDatabase]);

  const currentStopNumber = getCurrentStop();
  const totalStops = stops.length;
  const isCompleted = currentProgress?.completed || false;
  const completedStops = currentProgress?.completed_stops || [];
  
  // Debug logging
  console.log('CrawlSessionScreen render - currentStopNumber:', currentStopNumber, 'currentProgress:', currentProgress, 'isCompleted:', isCompleted, 'isCompleting:', isCompleting);

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
    console.log('handleStopComplete called - currentStopNumber:', currentStopNumber, 'userAnswer:', userAnswer);
    await completeStop(currentStopNumber, userAnswer, user?.id);
    console.log('Setting isGateCompleted to true');
    setIsGateCompleted(true);
    setIsNextStopRevealed(true);
  };

  const handleNextStep = async () => {
    console.log('handleNextStep called - isGateCompleted:', isGateCompleted, 'currentStopNumber:', currentStopNumber);
    if (isGateCompleted) {
      console.log('Proceeding to next stop...');
      setIsGateCompleted(false);
      setIsNextStopRevealed(false);
      await nextStop(user?.id);
    } else {
      console.log('Cannot proceed - isGateCompleted is false');
    }
  };

  const progressPercent = totalStops > 0 ? Math.round(((currentStopNumber - 1) / totalStops) * 100) : 0;

  useEffect(() => {
    console.log('Completion useEffect triggered - isCompleted:', isCompleted, 'user:', !!user?.id, 'currentProgress:', !!currentProgress, 'currentCrawl:', !!currentCrawl, 'isCompleting:', isCompleting);
    if (isCompleted && user?.id && currentProgress && currentCrawl && !isCompleting) {
      console.log('Starting crawl completion process');
      setIsCompleting(true);
      
      // Store completion data to pass to completion screen
      const completionData = {
        started: new Date(currentProgress.started_at),
        completed: new Date(),
        crawlId: currentCrawl.id,
        isPublic: currentProgress.is_public ?? (crawlData?.['public-crawl'] || false),
        userId: user.id,
      };
      
      // Reset the completing flag and navigate to completion screen with data
      setIsCompleting(false);
      navigation.reset({ 
        index: 0, 
        routes: [{ 
          name: 'CrawlCompletion', 
          params: { 
            crawlName: currentCrawl.name,
            completionData: completionData
          } 
        }] 
      });
    }
  }, [isCompleted, user, currentProgress, currentCrawl, clearCrawlSession, navigation, isCompleting]);



  if (loading || !crawlData || !stops.length || isCompleting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.button.primary} />
        {isCompleting && <Text style={[{ marginTop: 16, textAlign: 'center' }, { color: theme.text.primary }]}>Completing crawl...</Text>}
      </SafeAreaView>
    );
  }







  const currentStop = currentStopNumber > 0 ? stops[currentStopNumber - 1] : null;

  // Show loading state if no current stop is available
  if (!currentStop || currentStopNumber === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.button.primary} />
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>Loading crawl progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Fixed Top Section - Exit Button and Future Buttons */}
      <View style={[styles.topSection, { borderBottomColor: theme.border.secondary }]}>
        <BackButton onPress={handleExit} label="Exit" style={styles.exitButton} textStyle={styles.exitButtonText} />
        <View style={styles.topRightButtons}>
          {/* Future buttons will go here */}
        </View>
      </View>

      {/* Fixed Progress Bar Section */}
      <View style={[styles.progressSection, { backgroundColor: theme.background.tertiary }]}>
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border.secondary }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.status.success }]} />
          </View>
          <Text style={[styles.progressPercentText, { color: theme.text.secondary }]}>{progressPercent}%</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        {/* Current Location Section */}
        <View style={[styles.locationSection, { borderBottomColor: theme.border.secondary }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Current Location</Text>
          <View style={styles.locationContent}>
            <Text style={[styles.locationName, { color: theme.text.primary }]}>{currentStop.location_name || 'Unknown Location'}</Text>
          </View>
        </View>

        {/* Gate Section - Stop Type Content */}
        <View style={[styles.gateSection, { borderBottomColor: theme.border.secondary }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Current Challenge</Text>
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
        <View style={[styles.travelSection, { borderBottomColor: theme.border.secondary }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Next Stop</Text>
          <View style={styles.travelContent}>
            {isNextStopRevealed && currentStopNumber < totalStops ? (
              <>
                <Text style={[styles.nextStopName, { color: theme.text.primary }]}>{stops[currentStopNumber]?.location_name || 'Next Location'}</Text>
                {stops[currentStopNumber]?.location_link && (
                  <TouchableOpacity onPress={() => Linking.openURL(stops[currentStopNumber]?.location_link!)}>
                    <Text style={[styles.locationLink, { color: theme.button.primary }]}>📍 Open in Maps</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={[styles.travelText, { color: theme.text.secondary }]}>
                {currentStopNumber >= totalStops ? 'This is the final stop!' : 'Complete the current challenge to unlock the next location.'}
              </Text>
            )}
          </View>
        </View>

        {/* Bottom Buttons Section */}
        <View style={[styles.bottomButtonsSection, { borderTopColor: theme.border.secondary }]}>
          <TouchableOpacity style={[styles.bottomButton, { backgroundColor: theme.background.tertiary }]} onPress={() => setShowMap(true)}>
            <Text style={[styles.bottomButtonText, { color: theme.text.primary }]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.bottomButton, 
              styles.nextButton, 
              { backgroundColor: isGateCompleted ? theme.button.primary : theme.button.disabled }
            ]}
            onPress={handleNextStep}
            disabled={!isGateCompleted}
          >
            <Text style={[
              styles.bottomButtonText, 
              { color: isGateCompleted ? theme.text.inverse : theme.text.disabled }
            ]}>
              Next Step
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bottomButton, { backgroundColor: theme.background.tertiary }]} onPress={() => setShowPastStops(true)}>
            <Text style={[styles.bottomButtonText, { color: theme.text.primary }]}>Past Steps</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Past Stops Modal */}
      <Modal visible={showPastStops} animationType="slide" onRequestClose={() => setShowPastStops(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background.primary }]}>
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Past Stops</Text>
          <FlatList
            data={completedStops}
            keyExtractor={item => item.stop_number.toString()}
            renderItem={({ item }) => {
              const stop = stops.find((s: CrawlStop) => s.stop_number === item.stop_number);
              const question = stop?.stop_components?.description || stop?.stop_components?.riddle || stop?.stop_components?.photo_instructions || stop?.stop_components?.location_name || stop?.stop_components?.photo_target || '';
              return (
                <View style={[styles.pastStopItem, { borderColor: theme.background.secondary }]}>
                  <Text style={[styles.pastStopTitle, { color: theme.text.primary }]}>Stop {item.stop_number}</Text>
                  <Text style={[styles.pastStopQuestion, { color: theme.text.secondary }]}>{question}</Text>
                  <Text style={[styles.pastStopAnswer, { color: theme.text.secondary }]}>Answer: {item.user_answer}</Text>
                  <Text style={[styles.pastStopTime, { color: theme.text.tertiary }]}>Completed: {item.completed_at ? new Date(item.completed_at).toLocaleString() : ''}</Text>
                  {stop?.location_link && (
                    <TouchableOpacity onPress={() => Linking.openURL(stop.location_link!)}>
                      <Text style={[styles.pastStopLink, { color: theme.button.primary }]}>📍 Open Reward Location</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={[styles.noPastStops, { color: theme.text.tertiary }]}>No stops completed yet.</Text>}
          />
          <TouchableOpacity style={[styles.closeModalButton, { backgroundColor: theme.background.secondary }]} onPress={() => setShowPastStops(false)}>
            <Text style={[styles.closeModalButtonText, { color: theme.text.primary }]}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Map Modal */}
      <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background.primary }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border.secondary }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Crawl Map</Text>
            <TouchableOpacity style={[styles.closeModalButton, { backgroundColor: theme.background.secondary }]} onPress={() => setShowMap(false)}>
              <Text style={[styles.closeModalButtonText, { color: theme.text.primary }]}>Close</Text>
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
  container: { flex: 1 },
  scrollableContent: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  exitButton: { 
    padding: 8,
    borderRadius: 6,
  },
  exitButtonText: { fontSize: 14, fontWeight: '600' },
  topRightButtons: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  progressText: { 
    fontSize: 14, 
    fontWeight: '600',
  },
  locationSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8,
  },
  locationContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationName: { 
    fontSize: 16, 
    fontWeight: '500',
    flex: 1,
  },
  locationLink: { 
    fontSize: 14, 
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  gateSection: {
    padding: 16,
    minHeight: 200,
    borderBottomWidth: 1,
  },
  gateContent: { 
    minHeight: 150,
  },
  travelSection: {
    padding: 16,
    borderTopWidth: 1,
    minHeight: 80,
  },
  travelContent: { 
    paddingVertical: 8,
  },
  travelText: { 
    fontSize: 14,
    fontStyle: 'italic',
  },
  nextStopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bottomButtonsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  bottomButton: { 
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bottomButtonText: { 
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: { 
    // Will be overridden by theme
  },
  disabledButton: { 
    // Will be overridden by theme
  },
  disabledButtonText: { 
    // Will be overridden by theme
  },
  enabledButton: {
    // Will be overridden by theme
  },
  enabledButtonText: {
    // Will be overridden by theme
  },
  modalContainer: {
    flex: 1,
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
    borderRadius: 12,
    borderWidth: 1,
  },
  pastStopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pastStopQuestion: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 4,
  },
  pastStopAnswer: {
    fontSize: 14,
    marginTop: 4,
  },
  pastStopTime: {
    fontSize: 12,
    marginTop: 2,
  },
  pastStopLink: {
    fontSize: 15,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  noPastStops: {
    textAlign: 'center',
    marginTop: 32,
  },
  closeModalButton: {
    marginTop: 24,
    alignSelf: 'center',
    padding: 12,
    borderRadius: 8,
  },
  closeModalButtonText: {
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
  },
  mapContainer: {
    flex: 1,
  },
});

export default CrawlSessionScreen; 
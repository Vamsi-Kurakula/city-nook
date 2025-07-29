import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useCrawlContext } from '../../context/CrawlContext';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '@clerk/clerk-expo';
import BackButton from '../../ui/common/BackButton';
import { Crawl } from '../../../types/crawl';
import CrawlBetaMap from '../../ui/crawl/CrawlBetaMap';
import { extractAllCoordinates, LocationCoordinates } from '../../../utils/coordinateExtractor';
import { getCrawlProgress } from '../../../utils/database/progressOperations';

const CrawlBetaScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const { getToken } = useAuth();
  
  const routeParams = route.params as { 
    crawl?: Crawl; 
    completedStop?: number;
    userAnswer?: string;
  } | undefined;
  const crawl = routeParams?.crawl;
  const completedStop = routeParams?.completedStop;
  const userAnswer = routeParams?.userAnswer;

  // Use CrawlContext like the original CrawlSessionScreen
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
  } = useCrawlContext();

  // Local state for UI
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  
  // Get values from CrawlContext
  const currentStopNumber = getCurrentStop();
  const completedStops = currentProgress?.completed_stops?.map(stop => stop.stop_number) || [];
  const totalStops = crawl?.stops?.length || 5;
  const progressPercent = totalStops > 0 ? Math.round((completedStops.length / totalStops) * 100) : 0;

  // Map data
  const [coordinates, setCoordinates] = useState<LocationCoordinates[]>([]);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);

  // Extract coordinates when crawl data is available
  useEffect(() => {
    const loadCoordinates = async () => {
      if (crawl?.stops && crawl.stops.length > 0) {
        setIsLoadingCoordinates(true);
        try {
          console.log('Starting coordinate extraction for', crawl.stops.length, 'stops');
          console.log('First stop location_link:', crawl.stops[0]?.location_link);
          
          const coords = await extractAllCoordinates(crawl.stops);
          setCoordinates(coords);
          console.log('Loaded coordinates for beta screen:', coords.length);
          console.log('Extracted coordinates:', coords);
        } catch (error) {
          console.error('Error loading coordinates:', error);
        } finally {
          setIsLoadingCoordinates(false);
        }
      } else {
        console.log('No stops found for coordinate extraction');
      }
    };

    loadCoordinates();
  }, [crawl]);

  // Initialize crawl session like the original CrawlSessionScreen
  useEffect(() => {
    const setupSession = async () => {
      if (crawl && (!isCrawlActive || !currentCrawl || currentCrawl.id !== crawl.id)) {
        console.log('Setting up new crawl session for:', crawl.id);
        
        setCurrentCrawl(crawl);
        setIsCrawlActive(true);
        
        // Load progress from database if user is logged in
        if (user?.id) {
          const isPublic = crawl['public-crawl'] || false;
          
          const token = await getToken({ template: 'supabase' });
          const progressFound = token ? await getCrawlProgress(user.id, crawl.id, isPublic, token) : null;
          
          if (progressFound) {
            // Progress was found for this specific crawl
            console.log('Loaded existing progress for crawl:', crawl.id);
            
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
          } else {
            // No progress was loaded from database, initialize new progress
            console.log('No database progress found, initializing new progress for crawl:', crawl.id);
            setCurrentProgress({
              crawl_id: crawl.id,
              is_public: isPublic,
              current_stop: 1,
              completed_stops: [],
              started_at: new Date(),
              last_updated: new Date(),
              completed: false,
            });
          }
        } else {
          // Fallback for no user
          setCurrentProgress({
            crawl_id: crawl.id,
            is_public: crawl['public-crawl'] || false,
            current_stop: 1,
            completed_stops: [],
            started_at: new Date(),
            last_updated: new Date(),
            completed: false,
          });
        }
        
        setIsLoadingProgress(false);
      } else if (crawl && isCrawlActive && currentCrawl && currentCrawl.id === crawl.id) {
        // Session is already active and matches current crawl, just stop loading
        console.log('Session already active for crawl:', crawl.id);
        setIsLoadingProgress(false);
      }
    };
    
    setupSession();
  }, [crawl?.id, user?.id, isCrawlActive, currentCrawl]);

  // Handle completion updates from CrawlStartStopScreen
  useEffect(() => {
    if (completedStop && userAnswer === 'completed') {
      console.log('Completion detected, reloading progress from database');
      
      // Reload progress from database to get the latest state
      const reloadProgress = async () => {
        if (!crawl || !user?.id) return;
        
        try {
          const token = await getToken({ template: 'supabase' });
          if (!token) return;
          
          const progressFound = await getCrawlProgress(user.id, crawl.id, crawl['public-crawl'] || false, token);
          
          if (progressFound) {
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
            
            console.log('Reloaded progress from database:', localProgress);
            setCurrentProgress(localProgress);
          }
        } catch (error) {
          console.error('Error reloading progress:', error);
        }
      };
      
      reloadProgress();
    }
  }, [completedStop, userAnswer]);

  const handleExit = () => {
    navigation.navigate('CrawlDetail', { crawl });
  };



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

      {/* Map Section - Fills the remaining screen */}
      <View style={styles.mapContainer}>
        {isLoadingProgress ? (
          <View style={styles.mapPlaceholder}>
            <Text style={[styles.mapPlaceholderText, { color: theme.text.secondary }]}>
              Loading progress...
            </Text>
          </View>
        ) : crawl?.stops && crawl.stops.length > 0 ? (
          <CrawlBetaMap
            stops={crawl.stops}
            currentStopNumber={currentStopNumber}
            completedStops={completedStops}
            isNextStopRevealed={true}
            coordinates={coordinates}
            crawl={crawl}
          />
        ) : (
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.background.secondary }]}>
            <Text style={[styles.mapPlaceholderText, { color: theme.text.secondary }]}>
              {isLoadingCoordinates ? 'Loading map...' : 'No crawl stops available'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
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
  exitButtonText: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
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
  mapContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CrawlBetaScreen; 
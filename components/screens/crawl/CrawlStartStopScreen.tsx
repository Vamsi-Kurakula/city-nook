import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '@clerk/clerk-expo';
import BackButton from '../../ui/common/BackButton';
import { StopComponent } from '../../ui/stops';
import { CrawlStop } from '../../../types/crawl';
import { saveCrawlProgress, getCrawlProgress } from '../../../utils/database/progressOperations';

const CrawlStartStopScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const { getToken } = useAuth();
  
  const routeParams = route.params as { 
    crawl?: any; 
    stop?: CrawlStop; 
    stopNumber?: number;
  } | undefined;
  
  const crawl = routeParams?.crawl;
  const stop = routeParams?.stop;
  const stopNumber = routeParams?.stopNumber;

  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStopComplete = async (userAnswer: string) => {
    if (!user?.id || !crawl || !stop || !stopNumber) {
      Alert.alert('Error', 'Missing required data to complete stop');
      return;
    }

    setIsSaving(true);
    
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // First, get existing progress to preserve completed stops
      const existingProgress = await getCrawlProgress(
        user.id,
        crawl.id,
        crawl['public-crawl'] || false,
        token
      );

      console.log('Existing progress from database:', existingProgress?.data);

      // Get existing completed stops or start with empty array
      const existingCompletedStops = existingProgress?.data?.completed_stops || [];
      
      // Add current stop to completed stops (avoid duplicates)
      let updatedCompletedStops = existingCompletedStops.includes(stopNumber) 
        ? existingCompletedStops 
        : [...existingCompletedStops, stopNumber];

      // If we're completing stop 2 or higher, make sure all previous stops are included
      if (stopNumber > 1) {
        const missingStops = [];
        for (let i = 1; i < stopNumber; i++) {
          if (!updatedCompletedStops.includes(i)) {
            missingStops.push(i);
          }
        }
        if (missingStops.length > 0) {
          console.log('Adding missing stops to completed stops:', missingStops);
          updatedCompletedStops = [...missingStops, ...updatedCompletedStops];
          updatedCompletedStops.sort((a: number, b: number) => a - b); // Sort numerically
        }
      }

      console.log('Stop completion - existing stops:', existingCompletedStops);
      console.log('Stop completion - adding stop:', stopNumber);
      console.log('Stop completion - updated stops:', updatedCompletedStops);

      // Get the current stop number from existing progress or default to next stop
      const currentStopFromProgress = existingProgress?.data?.current_stop || stopNumber;
      const nextStopNumber = Math.max(currentStopFromProgress, stopNumber + 1);

      // Get current progress to update it
      const currentProgress = {
        userId: user.id,
        crawlId: crawl.id,
        isPublic: crawl['public-crawl'] || false,
        currentStop: nextStopNumber, // Use the higher of current or next stop
        completedStops: updatedCompletedStops, // Preserve all completed stops
        startedAt: existingProgress?.data?.started_at || new Date().toISOString(),
        token
      };

      // Save progress to database
      const { error: progressError } = await saveCrawlProgress(currentProgress);
      
      if (progressError) {
        console.error('Error saving progress:', progressError);
        Alert.alert('Error', 'Failed to save progress');
        return;
      }



      setIsCompleted(true);
      
      // Navigate back to map immediately after completion
      navigation.dispatch(
        CommonActions.navigate({
          name: 'CrawlSession',
          params: { 
            crawl,
            completedStop: stopNumber,
            userAnswer: 'completed'
          },
        })
      );
      
    } catch (error) {
      console.error('Error completing stop:', error);
      Alert.alert('Error', 'Failed to complete stop');
    } finally {
      setIsSaving(false);
    }
  };



  if (!crawl || !stop || !stopNumber) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Start Stop
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.errorText, { color: theme.text.secondary }]}>
            Missing crawl or stop data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Stop {stopNumber}
        </Text>
      </View>

      {/* Current Challenge Section */}
      <View style={[styles.challengeSection, { borderBottomColor: theme.border.secondary }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Current Challenge</Text>
        <View style={styles.challengeContent}>
          <Text style={[styles.locationName, { color: theme.text.primary }]}>
            {stop.location_name || 'Unknown Location'}
          </Text>
          <StopComponent
            stop={stop}
            onComplete={handleStopComplete}
            isCompleted={isCompleted}
            crawlStartTime={crawl?.start_time}
            currentStopIndex={stopNumber - 1}
            allStops={crawl.stops || []}
          />
        </View>
      </View>

      {/* Loading Overlay */}
      {isSaving && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContent, { backgroundColor: theme.background.primary }]}>
            <Text style={[styles.loadingText, { color: theme.text.primary }]}>
              Saving progress...
            </Text>
          </View>
        </View>
      )}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  challengeSection: {
    flex: 1,
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  challengeContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrawlStartStopScreen; 
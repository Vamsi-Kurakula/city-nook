import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { useCrawlContext } from '../context/CrawlContext';
import { Crawl } from '../../types/crawl';
import { getHeroImageSource } from '../auto-generated/ImageLoader';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';

const CrawlDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  
  // Defensive extraction and logging
  const routeParams = route.params as { crawl?: Crawl } | undefined;
  const crawl = routeParams?.crawl;
  console.log('CrawlDetailScreen route params:', routeParams);
  if (!crawl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>No crawl data found (CrawlDetailScreen).</Text>
      </SafeAreaView>
    );
  }
  
  const { 
    startCrawlWithNavigation, 
    hasCrawlInProgress, 
    getCurrentCrawlName, 
    checkDatabaseForActiveCrawl,
    endCurrentCrawlAndStartNew 
  } = useCrawlContext();
  const { user, isLoading } = useAuthContext();
  const [resumeProgress, setResumeProgress] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id && crawl?.id && !isLoading) {
        console.log('CrawlDetailScreen fetching progress for:', { userId: user.id, crawlId: crawl.id });
        
        // Get the user's current crawl progress (only 1 record per user now)
        const { data, error } = await supabase
          .from('crawl_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        console.log('CrawlDetailScreen progress query result:', { data, error });
        
        // Check if the current progress is for this specific crawl
        if (data && !data.completed_at && data.crawl_id === crawl.id && data.is_public === (crawl['public-crawl'] || false)) {
          console.log('Setting resume progress:', data);
          setResumeProgress(data);
        } else {
          console.log('No resume progress found or crawl completed or different crawl');
          setResumeProgress(null);
        }
      }
    };
    fetchProgress();
  }, [user?.id, crawl?.id, isLoading]);

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleResumeCrawl = () => {
    if (resumeProgress) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'CrawlSession',
          params: { crawl, resumeProgress },
        })
      );
    }
  };

  const handleStartCrawl = async () => {
    // Check if there's already a crawl in progress (both local state and database)
    let hasActiveCrawl = hasCrawlInProgress();
    let currentCrawlName = getCurrentCrawlName();
    
    // If no active crawl in local state, check database
    if (!hasActiveCrawl && user?.id) {
      const dbCheck = await checkDatabaseForActiveCrawl(user.id);
      hasActiveCrawl = dbCheck.hasActive;
      currentCrawlName = dbCheck.crawlName || 'Current Crawl';
    }
    
    if (hasActiveCrawl) {
      Alert.alert(
        'Crawl in Progress',
        `You have "${currentCrawlName}" in progress. Would you like to end that crawl and start "${crawl.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Start New Crawl',
            style: 'destructive',
            onPress: () => {
              endCurrentCrawlAndStartNew(crawl, () => {
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'CrawlSession',
                    params: { crawl },
                  })
                );
              }, user?.id);
            },
          },
        ]
      );
    } else {
      // No crawl in progress, start normally
      navigation.dispatch(
        CommonActions.navigate({
          name: 'CrawlSession',
          params: { crawl },
        })
      );
    }
  };

  let resumeInfo = null;
  if (resumeProgress && crawl?.stops) {
    const completedCount = resumeProgress.completed_stops?.length || 0;
    const currentStopNum = resumeProgress.current_stop;
    const totalStops = crawl.stops.length;
    
    // Debug logging
    console.log('CrawlDetailScreen resume info:', {
      currentStopNum,
      completedCount,
      totalStops,
      completedStops: resumeProgress.completed_stops,
      resumeProgress: resumeProgress,
      stops: crawl.stops.map(s => ({ 
        stop_number: s.stop_number, 
        location_name: s.stop_components?.location_name,
        description: s.stop_components?.description 
      }))
    });
    
    // Calculate the actual current stop based on completed stops
    // If user has completed 2 stops, they should be on stop 3
    const actualCurrentStop = completedCount + 1;
    
    // Determine if the crawl is completed
    const isCompleted = actualCurrentStop > totalStops || resumeProgress.completed;
    
    if (isCompleted) {
      resumeInfo = (
        <View style={{ marginTop: 16, marginBottom: 4, alignItems: 'flex-start' }}>
          <Text style={{ color: '#28a745', fontSize: 15, fontWeight: 'bold' }}>
            🎉 Crawl completed! You finished all {totalStops} stops.
          </Text>
        </View>
      );
    } else {
      // Find the current stop by stop_number using the calculated actual current stop
      const currentStop = crawl.stops.find(s => s.stop_number === actualCurrentStop);
      
      // If we can't find the stop by stop_number, try using array index (0-indexed)
      const currentStopByIndex = crawl.stops[actualCurrentStop - 1];
      
      const finalStop = currentStop || currentStopByIndex;
      const locationName = finalStop?.stop_components?.location_name || 
                          finalStop?.stop_components?.description || 
                          finalStop?.stop_components?.riddle || 
                          finalStop?.location_name || '';
      
      resumeInfo = (
        <View style={{ marginTop: 16, marginBottom: 4, alignItems: 'flex-start' }}>
          <Text style={{ color: '#888', fontSize: 15 }}>
            {`You have completed ${completedCount} stop${completedCount === 1 ? '' : 's'}.`}
          </Text>
          <Text style={{ color: '#888', fontSize: 15 }}>
            {`Current stop: ${actualCurrentStop}${locationName ? ` - ${locationName}` : ''}`}
          </Text>
        </View>
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={getHeroImageSource(crawl.assetFolder)}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Text style={styles.title}>{crawl.name}</Text>
        <Text style={styles.description}>{crawl.description}</Text>
        <Text style={styles.meta}>Duration: {crawl.duration}</Text>
        <Text style={styles.meta}>Distance: {crawl.distance}</Text>
        <Text style={styles.meta}>Difficulty: {crawl.difficulty}</Text>
        
        {/* Crawl Route Visualization */}
        {crawl.stops && crawl.stops.length > 0 && (
          <View style={styles.routeSection}>
            <Text style={styles.routeSectionTitle}>Crawl Route</Text>
            <View style={styles.routeVisualization}>
              {/* First Stop */}
              <View style={styles.routeRow}>
                <View style={styles.routeCircle}>
                  <MaterialIcons name="location-on" size={20} color="#fff" />
                </View>
                {crawl.stops?.[0]?.location_link ? (
                  <TouchableOpacity onPress={() => Linking.openURL(crawl.stops?.[0]?.location_link || '')}>
                    <Text style={[styles.routeStopText, styles.routeStopLink]} numberOfLines={2}>
                      {crawl.stops?.[0]?.location_name || 'First Stop'}
                    </Text>
                  </TouchableOpacity>
                ) : crawl.stops?.[0]?.stop_components?.address ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(crawl.stops?.[0]?.stop_components?.address || '')}`)}
                  >
                    <Text style={[styles.routeStopText, styles.routeStopLink]} numberOfLines={2}>
                      {crawl.stops?.[0]?.stop_components?.address}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.routeStopText} numberOfLines={2}>
                    {crawl.stops?.[0]?.stop_components?.location_name || 
                     crawl.stops?.[0]?.stop_components?.description || 
                     'First Stop'}
                  </Text>
                )}
              </View>
              {/* Dashed Line */}
              <View style={styles.routeRow}>
                <View style={styles.dashedLineContainer}>
                  <View style={styles.dashedLine} />
                </View>
                <Text style={styles.routeStopText}></Text>
              </View>
              {/* Middle Circle - Number of stops in between */}
              <View style={styles.routeRow}>
                <View style={styles.routeCircle}><Text style={styles.routeCircleText}>{crawl.stops.length > 2 ? crawl.stops.length - 2 : '0'}</Text></View>
                <Text style={styles.routeStopText} numberOfLines={2}>
                  {crawl.stops.length > 2 ? 'Stops in between' : 'direct route'}
                </Text>
              </View>
              {/* Dashed Line */}
              <View style={styles.routeRow}>
                <View style={styles.dashedLineContainer}>
                  <View style={styles.dashedLine} />
                </View>
                <Text style={styles.routeStopText}></Text>
              </View>
              {/* Last Stop */}
              <View style={styles.routeRow}>
                <View style={styles.routeCircle}>
                  <MaterialIcons name="location-on" size={20} color="#fff" />
                </View>
                {crawl.stops?.[crawl.stops.length - 1]?.location_link ? (
                  <TouchableOpacity onPress={() => Linking.openURL(crawl.stops?.[crawl.stops.length - 1]?.location_link || '')}>
                    <Text style={[styles.routeStopText, styles.routeStopLink]} numberOfLines={2}>
                      {crawl.stops?.[crawl.stops.length - 1]?.location_name || 'Last Stop'}
                    </Text>
                  </TouchableOpacity>
                ) : crawl.stops?.[crawl.stops.length - 1]?.stop_components?.address ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(crawl.stops?.[crawl.stops.length - 1]?.stop_components?.address || '')}`)}
                  >
                    <Text style={[styles.routeStopText, styles.routeStopLink]} numberOfLines={2}>
                      {crawl.stops?.[crawl.stops.length - 1]?.stop_components?.address}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.routeStopText} numberOfLines={2}>
                    {crawl.stops?.[crawl.stops.length - 1]?.stop_components?.location_name || 
                     crawl.stops?.[crawl.stops.length - 1]?.stop_components?.description || 
                     'Last Stop'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        
        {resumeInfo}
        
        {/* Show Resume button if there's progress to resume */}
        {resumeProgress && (
          <TouchableOpacity style={[styles.startButton, { backgroundColor: '#28a745', marginTop: 12 }]} onPress={handleResumeCrawl}>
            <Text style={[styles.startButtonText, { color: '#fff' }]}>Resume Crawl</Text>
          </TouchableOpacity>
        )}
        
        {/* Show Start New Crawl button */}
        <TouchableOpacity 
          style={[
            styles.startButton, 
            { 
              backgroundColor: resumeProgress ? '#ffc107' : '#007AFF',
              marginTop: resumeProgress ? 12 : 24 
            }
          ]} 
          onPress={handleStartCrawl}
        >
          <Text style={[
            styles.startButtonText, 
            { color: resumeProgress ? '#333' : '#fff' }
          ]}>
            {resumeProgress ? 'Start New Crawl' : 'Start Crawl'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: { padding: 24 },
  heroImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#666', marginBottom: 12 },
  meta: { fontSize: 14, color: '#888', marginBottom: 4 },
  startButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { paddingVertical: 8, paddingHorizontal: 12 },
  backButtonText: { color: '#888', fontSize: 16, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  routeSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  routeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routeVisualization: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeCircleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dashedLineContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    width: 2,
    height: 32,
    borderWidth: 1,
    borderColor: '#888',
    borderStyle: 'dashed',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  routeStopText: {
    fontSize: 14,
    color: '#333',
    maxWidth: 180,
    marginLeft: 12,
  },
  routeStopLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  locationText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default CrawlDetailScreen; 
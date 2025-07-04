import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
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
  
  const { startCrawlWithNavigation } = useCrawlContext();
  const { user, isLoading } = useAuthContext();
  const [resumeProgress, setResumeProgress] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id && crawl?.id && !isLoading) {
        console.log('CrawlDetailScreen fetching progress for:', { userId: user.id, crawlId: crawl.id });
        const { data, error } = await supabase
          .from('crawl_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('crawl_id', crawl.id)
          .single();
        if (data && !data.completed_at) {
          setResumeProgress(data);
        } else {
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

  const handleStartCrawl = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CrawlSession',
        params: { crawl },
      })
    );
  };

  let resumeInfo = null;
  if (resumeProgress && crawl?.stops) {
    const completedCount = resumeProgress.completed_stops?.length || 0;
    const currentStopNum = resumeProgress.current_stop;
    const currentStop = crawl.stops.find(s => s.stop_number === currentStopNum);
    const locationName = currentStop?.stop_components?.location_name || currentStop?.stop_components?.description || currentStop?.stop_components?.riddle || '';
    resumeInfo = (
      <View style={{ marginTop: 16, marginBottom: 4, alignItems: 'flex-start' }}>
        <Text style={{ color: '#888', fontSize: 15 }}>
          {`You have completed ${completedCount} stop${completedCount === 1 ? '' : 's'}.`}
        </Text>
        <Text style={{ color: '#888', fontSize: 15 }}>
          {`Current stop: ${currentStopNum}${locationName ? ` - ${locationName}` : ''}`}
        </Text>
      </View>
    );
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
        
        <TouchableOpacity style={styles.startButton} onPress={handleStartCrawl}>
          <Text style={styles.startButtonText}>Start Crawl</Text>
        </TouchableOpacity>
        
        {resumeInfo}
        {resumeProgress && (
          <TouchableOpacity style={[styles.startButton, { backgroundColor: '#888', marginTop: 12 }]} onPress={handleResumeCrawl}>
            <Text style={[styles.startButtonText, { color: '#fff' }]}>Resume Crawl</Text>
          </TouchableOpacity>
        )}
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
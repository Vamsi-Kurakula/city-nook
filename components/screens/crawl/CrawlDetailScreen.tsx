import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { useCrawlContext } from '../../context/CrawlContext';
import { Crawl, CrawlStop } from '../../../types/crawl';
import DatabaseImage from '../../ui/crawl/DatabaseImage';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../../utils/database';
import { MaterialIcons } from '@expo/vector-icons';
import BackButton from '../../ui/common/BackButton';
import { getCrawlWithStopsById } from '../../../utils/database/crawlDefinitionOperations';

// Helper to map CrawlDefinition to Crawl
function mapCrawlDefinitionToCrawl(definition: any, stops: CrawlStop[]): Crawl {
  return {
    id: definition.crawl_definition_id,
    name: definition.name,
    description: definition.description,
    duration: definition.duration,
    difficulty: definition.difficulty,
    distance: definition.distance,
    'public-crawl': definition.is_public,
    start_time: definition.start_time,
    hero_image_url: definition.hero_image_url,
    stops,
  };
}

const CrawlDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Accept either a crawl object or a crawlId
  const routeParams = route.params as { crawl?: Crawl; crawlId?: string } | undefined;
  const [crawl, setCrawl] = useState<Crawl | null>(routeParams?.crawl || null);
  const [loading, setLoading] = useState(!routeParams?.crawl && !!routeParams?.crawlId);

  useEffect(() => {
    const fetchCrawl = async () => {
      if (!crawl && routeParams?.crawlId) {
        setLoading(true);
        try {
          const crawlData = await getCrawlWithStopsById(routeParams.crawlId);
          if (crawlData && crawlData.definition) {
            setCrawl(mapCrawlDefinitionToCrawl(crawlData.definition, crawlData.stops));
          }
        } catch (e) {
          setCrawl(null);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCrawl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParams?.crawlId]);

  if (loading || !crawl) {
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: 'transparent',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    ]}> 
      <View style={styles.header}>
        <BackButton onPress={() => navigation.navigate('Home')} />
      </View>
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading...</Text>
      </View>
    </View>
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

  // Show loading if auth is still loading
if (isLoading) {
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: 'transparent',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    ]}> 
      <View style={styles.header}>
        <BackButton onPress={() => navigation.navigate('Home')} />
      </View>
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading...</Text>
      </View>
    </View>
  );
}

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.navigate('Home')} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <DatabaseImage
          heroImageUrl={crawl.hero_image_url}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Text style={[styles.title, { color: theme.text.primary }]}>{crawl.name}</Text>
        <Text style={[styles.description, { color: theme.text.secondary }]}>{crawl.description}</Text>
        <Text style={[styles.meta, { color: theme.text.tertiary }]}>Duration: {crawl.duration}</Text>
        <Text style={[styles.meta, { color: theme.text.tertiary }]}>Distance: {crawl.distance}</Text>
        <Text style={[styles.meta, { color: theme.text.tertiary }]}>Difficulty: {crawl.difficulty}</Text>
        
        {/* Crawl Route Visualization */}
        {crawl.stops && crawl.stops.length > 0 && (
          <View style={styles.routeSection}>
            <Text style={[styles.routeSectionTitle, { color: theme.text.primary }]}>Crawl Route</Text>
            <View style={styles.routeVisualization}>
              {/* First Stop */}
              <View style={styles.routeRow}>
                <View style={[styles.routeCircle, { backgroundColor: theme.button.primary }]}>
                  <MaterialIcons name="location-on" size={20} color={theme.text.inverse} />
                </View>
                {crawl.stops?.[0]?.location_link ? (
                  <TouchableOpacity onPress={() => Linking.openURL(crawl.stops?.[0]?.location_link || '')}>
                    <Text style={[styles.routeStopText, { color: theme.button.primary }]} numberOfLines={2}>
                      {crawl.stops?.[0]?.location_name || 'First Stop'}
                    </Text>
                  </TouchableOpacity>
                ) : crawl.stops?.[0]?.stop_components?.address ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(crawl.stops?.[0]?.stop_components?.address || '')}`)}
                  >
                    <Text style={[styles.routeStopText, { color: theme.button.primary }]} numberOfLines={2}>
                      {crawl.stops?.[0]?.stop_components?.address}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.routeStopText, { color: theme.text.primary }]} numberOfLines={2}>
                    {crawl.stops?.[0]?.stop_components?.location_name || 
                     crawl.stops?.[0]?.stop_components?.description || 
                     'First Stop'}
                  </Text>
                )}
              </View>
              {/* Dashed Line */}
              <View style={styles.routeRow}>
                <View style={styles.dashedLineContainer}>
                  <View style={[styles.dashedLine, { borderColor: theme.text.tertiary }]} />
                </View>
                <Text style={[styles.routeStopText, { color: theme.text.primary }]}></Text>
              </View>
              {/* Middle Circle - Number of stops in between */}
              <View style={styles.routeRow}>
                <View style={[styles.routeCircle, { backgroundColor: theme.button.primary }]}>
                  <Text style={[styles.routeCircleText, { color: theme.text.inverse }]}>{crawl.stops.length > 2 ? crawl.stops.length - 2 : '0'}</Text>
                </View>
                <Text style={[styles.routeStopText, { color: theme.text.primary }]} numberOfLines={2}>
                  {crawl.stops.length > 2 ? 'Stops in between' : 'direct route'}
                </Text>
              </View>
              {/* Dashed Line */}
              <View style={styles.routeRow}>
                <View style={styles.dashedLineContainer}>
                  <View style={[styles.dashedLine, { borderColor: theme.text.tertiary }]} />
                </View>
                <Text style={[styles.routeStopText, { color: theme.text.primary }]}></Text>
              </View>
              {/* Last Stop */}
              <View style={styles.routeRow}>
                <View style={[styles.routeCircle, { backgroundColor: theme.button.primary }]}>
                  <MaterialIcons name="location-on" size={20} color={theme.text.inverse} />
                </View>
                {crawl.stops?.[crawl.stops.length - 1]?.location_link ? (
                  <TouchableOpacity onPress={() => Linking.openURL(crawl.stops?.[crawl.stops.length - 1]?.location_link || '')}>
                    <Text style={[styles.routeStopText, { color: theme.button.primary }]} numberOfLines={2}>
                      {crawl.stops?.[crawl.stops.length - 1]?.location_name || 'Last Stop'}
                    </Text>
                  </TouchableOpacity>
                ) : crawl.stops?.[crawl.stops.length - 1]?.stop_components?.address ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(crawl.stops?.[crawl.stops.length - 1]?.stop_components?.address || '')}`)}
                  >
                    <Text style={[styles.routeStopText, { color: theme.button.primary }]} numberOfLines={2}>
                      {crawl.stops?.[crawl.stops.length - 1]?.stop_components?.address}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.routeStopText, { color: theme.text.primary }]} numberOfLines={2}>
                    {crawl.stops?.[crawl.stops.length - 1]?.stop_components?.location_name || 
                     crawl.stops?.[crawl.stops.length - 1]?.stop_components?.description || 
                     'Last Stop'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        
        {/* Show Start New Crawl button */}
        <TouchableOpacity 
          style={[
            styles.startButton, 
            { 
              backgroundColor: theme.button.primary,
              marginTop: 24 
            }
          ]} 
          onPress={handleStartCrawl}
        >
          <Text style={[
            styles.startButtonText, 
            { color: theme.text.button }
          ]}>
            Start Crawl
          </Text>
        </TouchableOpacity>
              </ScrollView>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: { padding: 24 },
  heroImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 12 },
  meta: { fontSize: 14, marginBottom: 4 },
  startButton: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  startButtonText: { fontSize: 18, fontWeight: 'bold' },
  backButton: { paddingVertical: 8, paddingHorizontal: 12 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeCircleText: {
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
    borderStyle: 'dashed',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  routeStopText: {
    fontSize: 14,
    maxWidth: 180,
    marginLeft: 12,
  },
  routeStopLink: {
    textDecorationLine: 'underline',
  },
  locationText: {
    textDecorationLine: 'underline',
  },
});

export default CrawlDetailScreen; 

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { supabase } from '../../utils/supabase';
import { loadPublicCrawls } from '../../utils/publicCrawlLoader';
import { loadFeaturedCrawls, FeaturedCrawl } from '../../utils/featuredCrawlLoader';
import { loadCrawlSteps } from '../auto-generated/crawlAssetLoader';
import { formatTimeRemaining } from '../../utils/crawlStatus';
import { Crawl } from '../../types/crawl';
import { getHeroImageSource } from '../auto-generated/ImageLoader';

interface PublicCrawl {
  id: string;
  name: string;
  title?: string;
  description: string;
  start_time: string;
  hero_image: string;
  steps: any[];
  assetFolder: string;
}

interface CrawlProgress {
  crawlId: string;
  currentStep: number;
  completedSteps: number[];
  startTime: string;
  isPublicCrawl: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, isLoading } = useAuthContext();
  const userId = user?.id;
  const [featuredCrawls, setFeaturedCrawls] = useState<FeaturedCrawl[]>([]);
  const [upcomingCrawls, setUpcomingCrawls] = useState<PublicCrawl[]>([]);
  const [userSignups, setUserSignups] = useState<string[]>([]);
  const [currentCrawl, setCurrentCrawl] = useState<CrawlProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Add debugging
  console.log('HomeScreen render:', { 
    user: user ? 'defined' : 'undefined', 
    userId, 
    isLoading,
    userEmail: user?.emailAddresses?.[0]?.emailAddress 
  });

  useEffect(() => {
    console.log('HomeScreen useEffect triggered:', { userId, isLoading });
    if (!isLoading) {
      loadHomeData();
    }
  }, [userId, isLoading]);

  const loadHomeData = async () => {
    try {
      console.log('loadHomeData called');
      setLoading(true);
      
      // Load featured crawls
      const featured = await loadFeaturedCrawls();
      setFeaturedCrawls(featured);

      // Load upcoming public crawls and user signups
      if (userId) {
        console.log('Loading data for user:', userId);
        const [crawls, signups] = await Promise.all([
          loadPublicCrawls(),
          loadUserSignups()
        ]);

        // Filter upcoming crawls (not completed)
        const now = new Date();
        const upcoming = crawls.filter((crawl: any) => {
          const startTime = new Date(crawl.start_time);
          const totalDuration = crawl.steps.reduce((total: number, step: any) => total + (step.reveal_after_minutes || 0), 0);
          const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);
          return endTime > now;
        });

        // Sort by user signups first, then by start time
        const sortedCrawls = upcoming.sort((a: any, b: any) => {
          const aSignedUp = signups.includes(a.id);
          const bSignedUp = signups.includes(b.id);
          
          if (aSignedUp && !bSignedUp) return -1;
          if (!aSignedUp && bSignedUp) return 1;
          
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        });

        setUpcomingCrawls(sortedCrawls);
        setUserSignups(signups);
      }

      // Load current crawl progress
      await loadCurrentCrawl();
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSignups = async (): Promise<string[]> => {
    if (!userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('public_crawl_signups')
        .select('crawl_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data?.map(row => row.crawl_id) || [];
    } catch (error) {
      console.error('Error loading user signups:', error);
      return [];
    }
  };

  const loadCurrentCrawl = async () => {
    if (!userId) return;

    try {
      // Check for public crawl in progress
      const { data: publicProgress, error: publicError } = await supabase
        .from('crawl_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public_crawl', true)
        .single();

      if (publicProgress && !publicError) {
        setCurrentCrawl({
          crawlId: publicProgress.crawl_id,
          currentStep: publicProgress.current_step,
          completedSteps: publicProgress.completed_steps || [],
          startTime: publicProgress.start_time,
          isPublicCrawl: true
        });
        return;
      }

      // Check for library crawl in progress
      const { data: libraryProgress, error: libraryError } = await supabase
        .from('crawl_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public_crawl', false)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (libraryProgress && !libraryError) {
        setCurrentCrawl({
          crawlId: libraryProgress.crawl_id,
          currentStep: libraryProgress.current_step,
          completedSteps: libraryProgress.completed_steps || [],
          startTime: libraryProgress.start_time,
          isPublicCrawl: false
        });
      }
    } catch (error) {
      console.error('Error loading current crawl:', error);
    }
  };

  const handleContinueCrawl = async () => {
    if (!currentCrawl) return;

    try {
      // Load the full crawl data
      let crawlData: any = null;
      
      if (currentCrawl.isPublicCrawl) {
        // Load public crawl data
        const publicCrawls = await loadPublicCrawls();
        crawlData = publicCrawls.find((c: any) => c.id === currentCrawl.crawlId);
      } else {
        // Load library crawl data
        const asset = Asset.fromModule(require('../../assets/crawl-library/crawls.yml'));
        await asset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const data = yaml.load(yamlString) as { crawls: any[] };
        crawlData = data.crawls.find((c: any) => c.id === currentCrawl.crawlId);
        
        if (crawlData) {
          // Load steps for the crawl
          const stepsData = await loadCrawlSteps(crawlData.assetFolder);
          crawlData.steps = stepsData?.steps || [];
        }
      }

      if (!crawlData) {
        Alert.alert('Error', 'Could not load crawl data');
        return;
      }

      const resumeData = {
        currentStep: currentCrawl.currentStep,
        completedSteps: currentCrawl.completedSteps,
        startTime: currentCrawl.startTime
      };

      if (currentCrawl.isPublicCrawl) {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'PublicCrawlSession',
            params: {
              crawl: crawlData,
              resumeData
            },
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'CrawlSession',
            params: {
              crawl: crawlData,
              resumeData
            },
          })
        );
      }
    } catch (error) {
      console.error('Error loading crawl data:', error);
      Alert.alert('Error', 'Could not load crawl data');
    }
  };

  const handleFeaturedCrawlPress = async (crawlId: string) => {
    try {
      // Load the full crawl data from the crawl library
      const asset = Asset.fromModule(require('../../assets/crawl-library/crawls.yml'));
      await asset.downloadAsync();
      const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
      const data = yaml.load(yamlString) as { crawls: Crawl[] };
      
      const crawl = data.crawls.find(c => c.id === crawlId);
      if (crawl) {
        // Load steps for the crawl
        const stepsData = await loadCrawlSteps(crawl.assetFolder);
        const fullCrawl = {
          ...crawl,
          steps: stepsData?.steps || []
        };
        
        navigation.dispatch(
          CommonActions.navigate({
            name: 'CrawlDetail',
            params: { crawl: fullCrawl },
          })
        );
      }
    } catch (error) {
      console.error('Error loading crawl data:', error);
      Alert.alert('Error', 'Could not load crawl data');
    }
  };

  const handlePublicCrawlPress = (crawlId: string) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'PublicCrawlDetail',
        params: { crawlId },
      })
    );
  };

  const handleViewAllPublicCrawls = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'PublicCrawls',
      })
    );
  };

  const handleViewAllFeaturedCrawls = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Tabs',
        params: { screen: 'Crawl Library' },
      })
    );
  };

  const renderContinueCrawlButton = () => {
    if (!currentCrawl) return null;

    const crawl = upcomingCrawls.find(c => c.id === currentCrawl.crawlId) || 
                  featuredCrawls.find(c => c.id === currentCrawl.crawlId);
    
    const title = crawl?.title || currentCrawl.crawlId;
    const progress = currentCrawl.completedSteps.length;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue Crawl</Text>
        <TouchableOpacity style={styles.continueCrawlCard} onPress={handleContinueCrawl}>
          <View style={styles.continueCrawlContent}>
            <Text style={styles.continueCrawlTitle}>{title}</Text>
            <Text style={styles.continueCrawlSubtitle}>
              {progress} steps completed • Tap to continue
            </Text>
          </View>
          <Text style={styles.continueArrow}>→</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderUpcomingCrawls = () => {
    if (upcomingCrawls.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Public Crawls</Text>
          <TouchableOpacity onPress={handleViewAllPublicCrawls}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={upcomingCrawls}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item: crawl }) => {
            const isSignedUp = userSignups.includes(crawl.id);
            const startTime = new Date(crawl.start_time);
            const now = new Date();
            const timeUntilStartMs = startTime.getTime() - now.getTime();
            const timeUntilStartSeconds = Math.floor(timeUntilStartMs / 1000);
            const timeRemaining = formatTimeRemaining(timeUntilStartSeconds);
            
            return (
              <TouchableOpacity
                style={styles.horizontalCrawlCard}
                onPress={() => handlePublicCrawlPress(crawl.id)}
              >
                <Image 
                  source={getHeroImageSource(crawl.assetFolder)} 
                  style={styles.horizontalCrawlImage}
                  resizeMode="cover"
                  onError={(error) => console.log('Image loading error:', error)}
                />
                <View style={styles.horizontalCrawlContent}>
                  <Text style={styles.horizontalCrawlTitle} numberOfLines={1}>{crawl.title}</Text>
                  <Text style={styles.horizontalCrawlDescription} numberOfLines={2}>
                    {crawl.description}
                  </Text>
                  <View style={styles.horizontalCrawlMeta}>
                    <Text style={styles.horizontalCrawlTime}>{timeRemaining}</Text>
                    {isSignedUp && (
                      <View style={styles.signedUpBadge}>
                        <Text style={styles.signedUpText}>Signed Up</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const renderFeaturedCrawls = () => {
    if (featuredCrawls.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Crawls</Text>
          <TouchableOpacity onPress={handleViewAllFeaturedCrawls}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredCrawls}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item: crawl }) => (
            <TouchableOpacity
              style={styles.horizontalCrawlCard}
              onPress={() => handleFeaturedCrawlPress(crawl.id)}
            >
              <Image 
                source={getHeroImageSource(crawl.assetFolder)} 
                style={styles.horizontalCrawlImage}
                resizeMode="cover"
                onError={(error) => console.log('Image loading error:', error)}
              />
              <View style={styles.horizontalCrawlContent}>
                <Text style={styles.horizontalCrawlTitle} numberOfLines={1}>{crawl.title}</Text>
                <Text style={styles.horizontalCrawlDescription} numberOfLines={2}>
                  {crawl.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <SafeAreaViewRN style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading authentication...</Text>
        </View>
      </SafeAreaViewRN>
    );
  }

  if (loading) {
    return (
      <SafeAreaViewRN style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaViewRN>
    );
  }

  return (
    <SafeAreaViewRN style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>City Crawler</Text>
          <Text style={styles.subtitle}>Discover your city, one step at a time</Text>
        </View>

        {renderContinueCrawlButton()}
        {renderUpcomingCrawls()}
        {renderFeaturedCrawls()}
      </ScrollView>
    </SafeAreaViewRN>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  viewAllButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  continueCrawlCard: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueCrawlContent: {
    flex: 1,
  },
  continueCrawlTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  continueCrawlSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  continueArrow: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  crawlCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  crawlImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  crawlContent: {
    padding: 16,
  },
  crawlTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  crawlDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  crawlMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crawlTime: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  signedUpBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  signedUpText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  horizontalListContainer: {
    paddingHorizontal: 20,
  },
  horizontalCrawlCard: {
    backgroundColor: 'white',
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 320,
  },
  horizontalCrawlImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  horizontalCrawlContent: {
    padding: 16,
  },
  horizontalCrawlTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  horizontalCrawlDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  horizontalCrawlMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalCrawlTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
}); 
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
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthContext } from '../context/AuthContext';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import { supabase } from '../../utils/supabase';
import { loadPublicCrawls } from '../../utils/publicCrawlLoader';
import { loadFeaturedCrawls, FeaturedCrawl } from '../../utils/featuredCrawlLoader';
import { loadCrawlStops } from '../auto-generated/crawlAssetLoader';
import { formatTimeRemaining } from '../../utils/crawlStatus';
import { Crawl } from '../../types/crawl';
import { getHeroImageSource } from '../auto-generated/ImageLoader';
import { RootStackParamList } from '../../types/navigation';
import CrawlCard from '../ui/CrawlCard';

interface PublicCrawl {
  id: string;
  name: string;
  title?: string;
  description: string;
  start_time: string;
  hero_image: string;
  stops: any[];
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
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, isLoading } = useAuthContext();
  const userId = user?.id;
  const [featuredCrawls, setFeaturedCrawls] = useState<FeaturedCrawl[]>([]);
  const [fullFeaturedCrawls, setFullFeaturedCrawls] = useState<Crawl[]>([]);
  const [upcomingCrawls, setUpcomingCrawls] = useState<PublicCrawl[]>([]);
  const [userSignups, setUserSignups] = useState<string[]>([]);
  const [currentCrawl, setCurrentCrawl] = useState<CrawlProgress | null>(null);
  const [inProgressCrawls, setInProgressCrawls] = useState<CrawlProgress[]>([]);
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

      // Load full crawl data for featured crawls
      const fullFeaturedData = await Promise.all(
        featured.map(async (featuredCrawl) => {
          try {
            // Load the main crawls data
            const asset = Asset.fromModule(require('../../assets/crawl-library/crawls.yml'));
            await asset.downloadAsync();
            const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
            const data = yaml.load(yamlString) as any;
            
            // Find the full crawl data
            const crawl = data.crawls.find((c: any) => c.id === featuredCrawl.id);
            if (crawl) {
              // Load stops for the crawl
              const stopsData = await loadCrawlStops(crawl.assetFolder);
              return {
                ...crawl,
                stops: stopsData?.stops || [],
              };
            }
            return null;
          } catch (error) {
            console.error('Error loading full crawl data for featured crawl:', error);
            return null;
          }
        })
      );
      
      const validFullFeaturedCrawls = fullFeaturedData.filter(crawl => crawl !== null) as Crawl[];
      setFullFeaturedCrawls(validFullFeaturedCrawls);

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
          const totalDuration = crawl.stops.reduce((total: number, stop: any) => total + (stop.reveal_after_minutes || 0), 0);
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
      console.log('Loading current crawls for user:', userId);
      
      // Get all in-progress crawls (both public and library)
      const { data: allProgress, error } = await supabase
        .from('crawl_progress')
        .select('*')
        .eq('user_id', userId)
        .is('completed_at', null)
        .order('started_at', { ascending: false });

      console.log('All progress:', allProgress, 'Error:', error);

      if (allProgress && allProgress.length > 0) {
        const inProgressCrawlsData: CrawlProgress[] = allProgress.map(progress => ({
          crawlId: progress.crawl_id,
          currentStep: progress.current_stop,
          completedSteps: progress.completed_stops || [],
          startTime: progress.started_at,
          isPublicCrawl: false // We'll determine this by checking if it's in public crawls
        }));

        console.log('All in-progress crawls:', inProgressCrawlsData);
        setInProgressCrawls(inProgressCrawlsData);
        setCurrentCrawl(inProgressCrawlsData[0]);
      } else {
        setInProgressCrawls([]);
        setCurrentCrawl(null);
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
          // Load stops for the crawl
          const stopsData = await loadCrawlStops(crawlData.assetFolder);
          crawlData.stops = stopsData?.stops || [];
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
      const data = yaml.load(yamlString) as any;
      
      const crawl = data.crawls.find((c: any) => c.id === crawlId);
      if (crawl) {
        // Load stops for the crawl
        const stopsData = await loadCrawlStops(crawl.assetFolder);
        const crawlWithStops = {
          ...crawl,
          stops: stopsData?.stops || [],
        };
        
        navigation.dispatch(
          CommonActions.navigate({
            name: 'CrawlDetail',
            params: { crawl: crawlWithStops },
          })
        );
      }
    } catch (error) {
      console.error('Error loading featured crawl:', error);
    }
  };

  const handleFeaturedCrawlCardPress = (crawl: Crawl) => {
    handleFeaturedCrawlPress(crawl.id);
  };

  const handleFeaturedCrawlCardStart = (crawl: Crawl) => {
    handleFeaturedCrawlPress(crawl.id);
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
    navigation.navigate('CrawlLibrary');
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
    if (fullFeaturedCrawls.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Crawls</Text>
        <FlatList
          data={fullFeaturedCrawls}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item: crawl }) => (
            <View style={styles.horizontalCardContainer}>
              <CrawlCard 
                crawl={crawl} 
                onPress={handleFeaturedCrawlCardPress}
                onStart={handleFeaturedCrawlCardStart}
                isExpanded={false}
                width={280}
                marginHorizontal={2}
              />
            </View>
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
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>City Crawler</Text>
              <Text style={styles.subtitle}>Discover your city, one stop at a time</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => navigation.navigate('UserProfile')}
              >
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Text style={styles.profilePlaceholderText}>
                      {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {renderUpcomingCrawls()}
        
        {/* Crawl Library Button */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.halfWidthButton} 
              onPress={() => navigation.navigate('CrawlLibrary')}
            >
              <Text style={styles.halfWidthButtonText}>📚 Crawl Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.halfWidthButton} 
              onPress={() => console.log('Join crawl button pressed')}
            >
              <Text style={styles.halfWidthButtonText}>🎯 Join Crawl</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Crawls in Progress Section */}
        {user && inProgressCrawls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crawls in Progress</Text>
            <FlatList
              data={inProgressCrawls}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
              keyExtractor={(item) => item.crawlId}
              renderItem={({ item: crawlProgress }) => {
                // Find the full crawl data
                const crawl = upcomingCrawls.find(c => c.id === crawlProgress.crawlId) || 
                             fullFeaturedCrawls.find(c => c.id === crawlProgress.crawlId);
                
                if (!crawl) {
                  // If we can't find the crawl data, show a placeholder
                  return (
                    <View style={styles.horizontalCardContainer}>
                      <View style={styles.inProgressCard}>
                        <View style={styles.inProgressCardContent}>
                          <View style={styles.inProgressCardLeft}>
                            <Text style={styles.inProgressCardTitle} numberOfLines={1}>
                              Crawl {crawlProgress.crawlId}
                            </Text>
                            <Text style={styles.inProgressCardSubtitle}>
                              {crawlProgress.completedSteps.length} stops completed • Tap to continue
                            </Text>
                          </View>
                          <Text style={styles.inProgressArrow}>→</Text>
                        </View>
                      </View>
                    </View>
                  );
                }
                
                return (
                  <View style={styles.horizontalCardContainer}>
                    <CrawlCard 
                      crawl={crawl as Crawl} 
                      onPress={() => {
                        // Set this as the current crawl and continue
                        setCurrentCrawl(crawlProgress);
                        handleContinueCrawl();
                      }}
                      onStart={() => {
                        // Set this as the current crawl and continue
                        setCurrentCrawl(crawlProgress);
                        handleContinueCrawl();
                      }}
                      isExpanded={false}
                      width={280}
                      marginHorizontal={2}
                    />
                  </View>
                );
              }}
            />
          </View>
        )}
        
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
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
    fontWeight: 'bold',
    color: '#333',
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
    paddingHorizontal: 4,
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
  profileButton: {
    padding: 8,
    borderRadius: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    gap: 12,
  },
  halfWidthButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  halfWidthButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  horizontalCardContainer: {
    marginRight: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  crawlDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  inProgressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inProgressCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inProgressCardLeft: {
    flex: 1,
  },
  inProgressCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  inProgressCardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inProgressArrow: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
}); 
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import CrawlList from '../ui/CrawlList';
import { useCrawlContext } from '../context/CrawlContext';
import { useTheme } from '../context/ThemeContext';
import { Alert } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import { Crawl, CrawlDefinition } from '../../types/crawl';
import { getCrawlDefinitionsByType, getCrawlStops } from '../../utils/database';
import { useNavigation, CommonActions } from '@react-navigation/native';
import BackButton from '../ui/BackButton';

type CrawlLibraryNavigationProp = StackNavigationProp<RootStackParamList, 'CrawlLibrary'>;
type CrawlLibraryRouteProp = RouteProp<RootStackParamList, 'CrawlLibrary'>;

const CrawlLibrary: React.FC = () => {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingCrawl, setIsStartingCrawl] = useState(false);
  const navigation = useNavigation<CrawlLibraryNavigationProp>();
  const route = useRoute<CrawlLibraryRouteProp>();

  // Read initial filter values from route params or default
  const initialMinStops = route.params?.minStops ?? 0;
  const initialMaxDistanceMiles = route.params?.maxDistanceMiles ?? 10;

  const [minStops, setMinStops] = useState(initialMinStops);
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(initialMaxDistanceMiles);
  
  const { startCrawlWithNavigation, hasCrawlInProgress, getCurrentCrawlName, endCurrentCrawlAndStartNew } = useCrawlContext();
  const { user } = useAuthContext();
  const { theme } = useTheme();

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        console.log('Loading crawls from database...');
        
        // Get private crawls (is_public: false) from database
        const crawlDefinitions = await getCrawlDefinitionsByType(false);
        console.log(`Found ${crawlDefinitions.length} private crawls in database`);
        
        // Load stops for each crawl
        const crawlsWithStops = await Promise.all(
          crawlDefinitions.map(async (crawlDef) => {
            try {
              console.log(`Loading stops for ${crawlDef.name} (${crawlDef.crawl_definition_id})...`);
              const stops = await getCrawlStops(crawlDef.crawl_definition_id);
              
              // Transform database crawl definition to legacy Crawl format for backward compatibility
              const crawl: Crawl = {
                id: crawlDef.crawl_definition_id,
                name: crawlDef.name,
                description: crawlDef.description,
                assetFolder: crawlDef.asset_folder,
                duration: crawlDef.duration,
                difficulty: crawlDef.difficulty,
                distance: crawlDef.distance,
                'public-crawl': crawlDef.is_public,
                start_time: crawlDef.start_time,
                hero_image_url: crawlDef.hero_image_url,
                stops: stops.map(stop => ({
                  stop_number: stop.stop_number,
                  stop_type: stop.stop_type,
                  location_name: stop.location_name,
                  location_link: stop.location_link,
                  stop_components: stop.stop_components,
                  reveal_after_minutes: stop.reveal_after_minutes
                }))
              };
              
              return crawl;
            } catch (error) {
              console.warn(`Could not load stops for ${crawlDef.name}:`, error);
              // Return crawl without stops
              return {
                id: crawlDef.crawl_definition_id,
                name: crawlDef.name,
                description: crawlDef.description,
                assetFolder: crawlDef.asset_folder,
                duration: crawlDef.duration,
                difficulty: crawlDef.difficulty,
                distance: crawlDef.distance,
                'public-crawl': crawlDef.is_public,
                start_time: crawlDef.start_time,
                hero_image_url: crawlDef.hero_image_url,
                stops: []
              } as Crawl;
            }
          })
        );
        
        console.log('All crawls loaded successfully:', crawlsWithStops.map(c => ({ name: c.name, stops: c.stops?.length || 0 })));
        setCrawls(crawlsWithStops);
      } catch (error) {
        console.error('Error loading crawls from database:', error);
        setCrawls([]);
      } finally {
        setLoading(false);
      }
    };
    loadCrawls();
  }, []);

  const handleCrawlPress = (crawl: Crawl) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CrawlDetail',
        params: { crawl },
      })
    );
  };

  const handleCrawlStart = (crawl: Crawl) => {
    if (!isStartingCrawl) {
      setIsStartingCrawl(true);
      
      // Check if there's already a crawl in progress
      if (hasCrawlInProgress()) {
        const currentCrawlName = getCurrentCrawlName();
        Alert.alert(
          'Crawl in Progress',
          `You have "${currentCrawlName}" in progress. Would you like to end that crawl and start "${crawl.name}"?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsStartingCrawl(false) },
            {
              text: 'Yes, Start New Crawl',
              style: 'destructive',
              onPress: () => {
                endCurrentCrawlAndStartNew(crawl, () => {
                  (navigation as any).navigate('CrawlSession', { crawl });
                  setIsStartingCrawl(false);
                }, user?.id);
              },
            },
          ]
        );
      } else {
        // No crawl in progress, start normally
        startCrawlWithNavigation(crawl, () => {
          (navigation as any).navigate('CrawlSession', { crawl });
          setIsStartingCrawl(false);
        });
      }
    }
  };

  const filteredCrawls = crawls.filter(crawl => {
    const stopsCount = crawl.stops?.length || 0;
    const distanceKm = typeof crawl.distance === 'number' ? crawl.distance : Number(crawl.distance) || 0;
    const distanceMiles = distanceKm * 0.621371;
    return stopsCount >= minStops && distanceMiles <= maxDistanceMiles;
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.button.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (crawls.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Library</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity 
                  style={styles.profileButton} 
                  onPress={() => navigation.navigate('UserProfile')}
                >
                  {user?.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                  ) : (
                    <View style={[styles.profilePlaceholder, { backgroundColor: theme.special.avatarPlaceholder }]}>
                      <Text style={[styles.profilePlaceholderText, { color: theme.text.secondary }]}>
                        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <Text style={[styles.errorText, { color: theme.text.tertiary }]}>No crawls found in the database.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Library</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => navigation.navigate('UserProfile')}
              >
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profilePlaceholder, { backgroundColor: theme.special.avatarPlaceholder }]}>
                    <Text style={[styles.profilePlaceholderText, { color: theme.text.secondary }]}>
                      {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Action buttons row */}
        <View style={styles.actionRow}>
          <BackButton onPress={() => navigation.navigate('Home')} />
          <TouchableOpacity onPress={() => navigation.navigate('CrawlLibraryFilters', { minStops, maxDistanceMiles })} style={[styles.filtersButton, { backgroundColor: theme.background.tertiary }]}>
            <Text style={[styles.filtersButtonText, { color: theme.button.primary }]}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CrawlList 
        crawls={filteredCrawls} 
        onCrawlPress={handleCrawlPress}
        onCrawlStart={handleCrawlStart}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToHomeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    marginRight: 8,
  },
  backToHomeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filtersButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 16,
    marginTop: 8,
  },
});

export default CrawlLibrary; 
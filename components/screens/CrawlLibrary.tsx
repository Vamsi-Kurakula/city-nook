import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, StatusBar, ActivityIndicator, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import yaml from 'js-yaml';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import CrawlList from '../ui/CrawlList';
import { useCrawlContext } from '../context/CrawlContext';
import { useAuthContext } from '../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import { Crawl } from '../../types/crawl';
import { loadCrawlSteps } from '../auto-generated/crawlAssetLoader';
import { useNavigation, CommonActions } from '@react-navigation/native';

interface CrawlData {
  crawls: Crawl[];
}

type CrawlLibraryNavigationProp = StackNavigationProp<RootStackParamList, 'CrawlLibrary'>;
type CrawlLibraryRouteProp = RouteProp<RootStackParamList, 'CrawlLibrary'>;

const CrawlLibrary: React.FC = () => {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingCrawl, setIsStartingCrawl] = useState(false);
  const navigation = useNavigation<CrawlLibraryNavigationProp>();
  const route = useRoute<CrawlLibraryRouteProp>();

  // Read initial filter values from route params or default
  const initialMinSteps = route.params?.minSteps ?? 0;
  const initialMaxDistanceMiles = route.params?.maxDistanceMiles ?? 10;

  const [minSteps, setMinSteps] = useState(initialMinSteps);
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(initialMaxDistanceMiles);
  
  const { startCrawlWithNavigation } = useCrawlContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        console.log('Loading crawls...');
        // Load main crawls list
        const asset = Asset.fromModule(require('../../assets/crawl-library/crawls.yml'));
        await asset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const data = yaml.load(yamlString) as CrawlData;
        
        if (data && Array.isArray(data.crawls)) {
          console.log(`Found ${data.crawls.length} crawls, loading steps...`);
          
          // Load steps for each crawl using the utility
          const crawlsWithSteps = await Promise.all(
            data.crawls.map(async (crawl) => {
              console.log('About to load steps for assetFolder:', crawl.assetFolder, 'in crawl:', crawl.name);
              if (!crawl.assetFolder) {
                console.warn('Skipping crawl with missing assetFolder:', crawl);
                return crawl;
              }
              try {
                console.log(`Loading steps for ${crawl.name} (${crawl.assetFolder})...`);
                const stepsData = await loadCrawlSteps(crawl.assetFolder);
                return {
                  ...crawl,
                  steps: stepsData?.steps || [],
                };
              } catch (error) {
                console.warn(`Could not load steps for ${crawl.name}:`, error);
                return crawl;
              }
            })
          );
          console.log('All crawls loaded successfully:', crawlsWithSteps.map(c => ({ name: c.name, steps: c.steps?.length || 0 })));
          
          // Filter to only show private crawls (public-crawl: false) in Crawl Library
          const privateCrawls = crawlsWithSteps.filter(crawl => crawl['public-crawl'] === false);
          console.log(`Filtered to ${privateCrawls.length} private crawls`);
          
          setCrawls(privateCrawls);
        } else {
          console.error('No crawls found in data');
          setCrawls([]);
        }
      } catch (e) {
        console.error('Error loading crawls:', e);
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
      
      // Use the context function to handle state updates and navigation
      startCrawlWithNavigation(crawl, () => {
        (navigation as any).navigate('CrawlSession', { crawl });
        setIsStartingCrawl(false);
      });
    }
  };

  const filteredCrawls = crawls.filter(crawl => {
    const stepsCount = crawl.steps?.length || 0;
    const distanceKm = typeof crawl.distance === 'number' ? crawl.distance : Number(crawl.distance) || 0;
    const distanceMiles = distanceKm * 0.621371;
    return stepsCount >= minSteps && distanceMiles <= maxDistanceMiles;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (crawls.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Crawl Library</Text>
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
        </View>
        <Text style={styles.errorText}>No crawls found. Please check your crawls.yml file.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Crawl Library</Text>
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
        {/* Action buttons row */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backToHomeButton}>
            <Text style={styles.backToHomeText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CrawlLibraryFilters', { minSteps, maxDistanceMiles })} style={styles.filtersButton}>
            <Text style={styles.filtersButtonText}>Filters</Text>
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
    backgroundColor: '#f8f9fa',
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
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
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
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  backToHomeButton: {
    height: 44,
    justifyContent: 'center',
  },
  backToHomeText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  filtersButton: {
    height: 44,
    justifyContent: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  filtersButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    height: 44,
    marginBottom: 8,
    marginTop: 4,
  },
});

export default CrawlLibrary; 
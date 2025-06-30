import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import yaml from 'js-yaml';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import CrawlList from './CrawlList';
import { useCrawlContext } from './CrawlContext';
import { RootTabParamList } from '../types/navigation';
import { Crawl, CrawlSteps } from '../types/crawl';
import { loadCrawlSteps } from './auto-generated/crawlAssetLoader';
import { useNavigation } from '@react-navigation/native';

interface CrawlData {
  crawls: Crawl[];
}

type CrawlLibraryNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Crawls'>;

interface CrawlLibraryProps {
  navigation: CrawlLibraryNavigationProp;
}

const CrawlLibrary: React.FC = () => {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingCrawl, setIsStartingCrawl] = useState(false);
  
  const { startCrawlWithNavigation } = useCrawlContext();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        console.log('Loading crawls...');
        // Load main crawls list
        const asset = Asset.fromModule(require('../assets/crawl-library/crawls.yml'));
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
    navigation.navigate('CrawlDetail', { crawl });
  };

  const handleCrawlStart = (crawl: Crawl) => {
    if (!isStartingCrawl) {
      setIsStartingCrawl(true);
      
      // Use the context function to handle state updates and navigation
      startCrawlWithNavigation(crawl, () => {
        navigation.navigate('Current Crawl');
        setIsStartingCrawl(false);
      });
    }
  };

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
        <Text style={styles.header}>Crawl Library</Text>
        <Text style={styles.errorText}>No crawls found. Please check your crawls.yml file.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Crawl Library</Text>
      <CrawlList 
        crawls={crawls} 
        onCrawlPress={handleCrawlPress}
        onCrawlStart={handleCrawlStart}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CrawlLibrary; 
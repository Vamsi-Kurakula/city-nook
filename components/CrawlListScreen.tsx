import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as yaml from 'js-yaml';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import CrawlList from './CrawlList';
import { useCrawlContext } from './CrawlContext';
import { RootTabParamList } from '../types/navigation';

interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
}

interface CrawlData {
  crawls: Crawl[];
}

type CrawlListScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Crawls'>;

interface CrawlListScreenProps {
  navigation: CrawlListScreenNavigationProp;
}

const CrawlListScreen: React.FC<CrawlListScreenProps> = ({ navigation }) => {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingCrawl, setIsStartingCrawl] = useState(false);
  
  const { startCrawlWithNavigation } = useCrawlContext();

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        const asset = Asset.fromModule(require('../assets/crawls/crawls.yml'));
        await asset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const data = yaml.load(yamlString) as CrawlData;
        if (data && Array.isArray(data.crawls)) {
          setCrawls(data.crawls);
        } else {
          setCrawls([]);
        }
      } catch (e) {
        setCrawls([]);
      } finally {
        setLoading(false);
      }
    };
    loadCrawls();
  }, []);

  const handleCrawlPress = (crawl: Crawl) => {
    // This can be used for future functionality like showing more details
    // Currently just handles the expand/collapse functionality
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
        <Text style={styles.header}>City Crawls</Text>
        <Text style={styles.errorText}>No crawls found. Please check your crawls.yml file.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>City Crawls</Text>
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

export default CrawlListScreen; 
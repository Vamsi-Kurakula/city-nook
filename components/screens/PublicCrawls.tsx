import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import CrawlList from '../ui/CrawlList';
import { Crawl } from '../../types/crawl';
import { loadCrawlStops } from '../auto-generated/crawlAssetLoader';
import { useNavigation, CommonActions } from '@react-navigation/native';

interface CrawlData {
  crawls: Crawl[];
}

const PublicCrawls: React.FC = () => {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        console.log('Loading public crawls...');
        // Load main crawls list
        const asset = Asset.fromModule(require('../assets/public-crawls/crawls.yml'));
        await asset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const data = yaml.load(yamlString) as CrawlData;
        
        if (data && Array.isArray(data.crawls)) {
          console.log(`Found ${data.crawls.length} crawls, loading stops...`);
          
          // Load stops for each crawl using the utility
          const crawlsWithStops = await Promise.all(
            data.crawls.map(async (crawl) => {
              try {
                console.log(`Loading stops for ${crawl.name} (${crawl.assetFolder})...`);
                const stopsData = await loadCrawlStops(crawl.assetFolder);
                return {
                  ...crawl,
                  stops: stopsData?.stops || [],
                };
              } catch (error) {
                console.warn(`Could not load stops for ${crawl.name}:`, error);
                return crawl;
              }
            })
          );
          console.log('All crawls loaded successfully:', crawlsWithStops.map(c => ({ name: c.name, stops: c.stops?.length || 0 })));
          
          // Filter to only show public crawls (public-crawl: true)
          const publicCrawls = crawlsWithStops.filter(crawl => crawl['public-crawl'] === true);
          console.log(`Filtered to ${publicCrawls.length} public crawls`);
          
          setCrawls(publicCrawls);
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
        name: 'PublicCrawlDetail',
        params: { crawl },
      })
    );
  };

  const handleCrawlStart = (crawl: Crawl) => {
    // For now, just log the crawl start
    console.log('Public crawl started:', crawl.name);
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
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Public Crawls</Text>
        </View>
        <Text style={styles.errorText}>No public crawls available yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Public Crawls</Text>
      </View>
      <CrawlList
        crawls={crawls}
        onCrawlPress={handleCrawlPress}
        onCrawlStart={() => {}}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default PublicCrawls; 
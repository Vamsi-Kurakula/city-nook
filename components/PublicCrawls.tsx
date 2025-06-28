import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import yaml from 'js-yaml';
import CrawlList from './CrawlList';
import { Crawl } from '../types/crawl';
import { loadCrawlSteps } from './auto-generated/crawlAssetLoader';

interface CrawlData {
  crawls: Crawl[];
}

const PublicCrawls: React.FC = () => {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        console.log('Loading public crawls...');
        // Load main crawls list
        const asset = Asset.fromModule(require('../assets/crawls/crawls.yml'));
        await asset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const data = yaml.load(yamlString) as CrawlData;
        
        if (data && Array.isArray(data.crawls)) {
          console.log(`Found ${data.crawls.length} crawls, loading steps...`);
          
          // Load steps for each crawl using the utility
          const crawlsWithSteps = await Promise.all(
            data.crawls.map(async (crawl) => {
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
          
          // Filter to only show public crawls (public-crawl: true)
          const publicCrawls = crawlsWithSteps.filter(crawl => crawl['public-crawl'] === true);
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
    // For now, just log the crawl press
    console.log('Public crawl pressed:', crawl.name);
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
        <Text style={styles.header}>Public Crawls</Text>
        <Text style={styles.errorText}>No public crawls available yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Public Crawls</Text>
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

export default PublicCrawls; 
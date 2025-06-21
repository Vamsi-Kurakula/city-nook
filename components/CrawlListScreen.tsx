import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, StatusBar, ActivityIndicator, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as yaml from 'js-yaml';
import CrawlList from './CrawlList';
import CrawlDetailPane from './CrawlDetailPane';
import { getHeroImageSource } from './ImageLoader';

const { height: screenHeight } = require('react-native').Dimensions.get('window');

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

const CrawlListScreen: React.FC = () => {
  const [crawls, setCrawls] = useState<Crawl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrawl, setSelectedCrawl] = useState<Crawl | null>(null);
  const [detailPaneVisible, setDetailPaneVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(screenHeight))[0];

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

  const showDetailPane = (crawl: Crawl) => {
    slideAnim.setValue(screenHeight);
    setSelectedCrawl(crawl);
    setDetailPaneVisible(true);
    setImageLoading(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const hideDetailPane = () => {
    Animated.spring(slideAnim, {
      toValue: screenHeight,
      useNativeDriver: true,
    }).start(() => {
      setDetailPaneVisible(false);
      setSelectedCrawl(null);
      setImageLoading(false);
      slideAnim.setValue(screenHeight);
    });
  };

  const startCrawl = () => {
    hideDetailPane();
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
      <CrawlList crawls={crawls} onCrawlPress={showDetailPane} />
      <CrawlDetailPane
        crawl={selectedCrawl ?? undefined}
        visible={detailPaneVisible && !!selectedCrawl}
        slideAnim={slideAnim}
        onClose={hideDetailPane}
        onStart={startCrawl}
        getHeroImageSource={getHeroImageSource}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCrawlContext } from './CrawlContext';
import { getHeroImageSource } from './ImageLoader';

const CurrentCrawl: React.FC = () => {
  const { currentCrawl, isCrawlActive, setCurrentCrawl, setIsCrawlActive } = useCrawlContext();

  const endCrawl = () => {
    setCurrentCrawl(null);
    setIsCrawlActive(false);
  };

  if (!isCrawlActive || !currentCrawl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Current Crawl</Text>
          <Text style={styles.subtitle}>No active crawl</Text>
          <Text style={styles.instruction}>
            Select a crawl from the Crawls tab to get started!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Crawl</Text>
        <TouchableOpacity style={styles.endButton} onPress={endCrawl}>
          <Text style={styles.endButtonText}>End Crawl</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.crawlContent}>
        <View style={styles.imageContainer}>
          {getHeroImageSource(currentCrawl.assetFolder) ? (
            <Image
              source={getHeroImageSource(currentCrawl.assetFolder)}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.crawlInfo}>
          <Text style={styles.crawlTitle}>{currentCrawl.name}</Text>
          <Text style={styles.crawlDescription}>{currentCrawl.description}</Text>
          
          <View style={styles.crawlMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>{currentCrawl.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Distance</Text>
              <Text style={styles.metaValue}>{currentCrawl.distance}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={styles.metaValue}>{currentCrawl.difficulty}</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Progress</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>0% Complete</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  endButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  crawlContent: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
  },
  crawlInfo: {
    padding: 20,
  },
  crawlTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  crawlDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  crawlMeta: {
    marginBottom: 30,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metaLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
    width: '0%',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default CurrentCrawl; 
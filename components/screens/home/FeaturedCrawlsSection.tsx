import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Crawl } from '../../../types/crawl';
import { getHeroImageSource } from '../../auto-generated/ImageLoader';

interface FeaturedCrawlsSectionProps {
  featuredCrawls: Crawl[];
  onCrawlPress: (crawl: Crawl) => void;
  onCrawlStart: (crawl: Crawl) => void;
  onViewAllPress: () => void;
}

export default function FeaturedCrawlsSection({
  featuredCrawls,
  onCrawlPress,
  onCrawlStart,
  onViewAllPress,
}: FeaturedCrawlsSectionProps) {
  const renderCrawlItem = ({ item }: { item: Crawl }) => {
    const heroImageSource = getHeroImageSource(item.assetFolder);

    return (
      <TouchableOpacity
        style={styles.crawlCard}
        onPress={() => onCrawlPress(item)}
      >
        <View style={styles.crawlImageContainer}>
          <Image 
            source={heroImageSource} 
            style={styles.crawlImage}
            resizeMode="cover"
            onError={(error) => console.log('Image loading error:', error)}
          />
        </View>
        <View style={styles.crawlContent}>
          <Text style={styles.crawlTitle}>{item.name}</Text>
          <Text style={styles.crawlDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.crawlMeta}>
            <Text style={styles.crawlStops}>{item.stops?.length || 0} stops</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onCrawlStart(item)}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (featuredCrawls.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Crawls</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={featuredCrawls.slice(0, 3)}
        renderItem={renderCrawlItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  horizontalListContainer: {
    paddingHorizontal: 4,
  },
  crawlCard: {
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
  crawlImageContainer: {
    height: 180,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crawlImage: {
    width: '100%',
    height: '100%',
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
  crawlStops: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 
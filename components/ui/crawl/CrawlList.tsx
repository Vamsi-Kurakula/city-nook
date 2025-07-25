import React, { useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Crawl } from '../../../types/crawl';
import DatabaseImage from './DatabaseImage';
import { useTheme } from '../../context/ThemeContext';

interface CrawlListProps {
  crawls: Crawl[];
  onCrawlPress: (crawl: Crawl) => void;
  onCrawlStart: (crawl: Crawl) => void;
}

const CrawlList: React.FC<CrawlListProps> = ({ crawls, onCrawlPress, onCrawlStart }) => {
  const { theme } = useTheme();

  const renderCrawlItem = ({ item }: { item: Crawl }) => {
    return (
      <TouchableOpacity
        style={[styles.crawlCard, { backgroundColor: theme.background.primary, borderColor: theme.background.secondary, shadowColor: theme.shadow.primary }]}
        onPress={() => onCrawlPress(item)}
      >
        <View style={[styles.crawlImageContainer, { backgroundColor: theme.background.tertiary }]}>
          <DatabaseImage 
            assetFolder={item.assetFolder}
            heroImageUrl={item.hero_image_url}
            style={styles.crawlImage}
            resizeMode="cover"
            onError={(error: any) => console.log('Image loading error:', error)}
          />
        </View>
        <View style={styles.crawlContent}>
          <Text style={[styles.crawlTitle, { color: theme.text.primary }]}>{item.name}</Text>
          <Text style={[styles.crawlDescription, { color: theme.text.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.crawlMeta}>
            <View style={styles.metaLeft}>
              <Text style={[styles.crawlStops, { color: theme.button.primary }]}>{item.stops?.length || 0} stops</Text>
              <Text style={[styles.crawlDistance, { color: theme.button.primary }]}>• {item.distance}</Text>
              <Text style={[styles.crawlDuration, { color: theme.button.primary }]}>• {item.duration}</Text>
            </View>
            <Text style={[styles.crawlDifficulty, { color: theme.text.secondary }]}>{item.difficulty}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={crawls}
      keyExtractor={item => item.id}
      renderItem={renderCrawlItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  crawlCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
  },
  crawlImageContainer: {
    height: 180,
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
    marginBottom: 4,
  },
  crawlDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  crawlMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crawlStops: {
    fontSize: 14,
    fontWeight: '500',
  },
  crawlDistance: {
    fontSize: 14,
    fontWeight: '500',
  },
  crawlDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  crawlDifficulty: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CrawlList; 
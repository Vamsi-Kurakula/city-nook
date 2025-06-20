import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
}

interface CrawlCardProps {
  crawl: Crawl;
  onPress: (crawl: Crawl) => void;
}

const CrawlCard: React.FC<CrawlCardProps> = ({ crawl, onPress }) => (
  <TouchableOpacity style={styles.crawlCard} onPress={() => onPress(crawl)} activeOpacity={0.7}>
    <Text style={styles.crawlTitle}>{crawl.name}</Text>
    <Text style={styles.crawlDesc} numberOfLines={2}>{crawl.description}</Text>
    <View style={styles.crawlMeta}>
      <Text style={styles.metaText}>{crawl.duration}</Text>
      <Text style={styles.metaText}>{crawl.distance}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  crawlCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  crawlTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  crawlDesc: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  crawlMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
});

export default CrawlCard; 
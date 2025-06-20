import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import CrawlCard from './CrawlCard';

interface Crawl {
  id: string;
  name: string;
  description: string;
  assetFolder: string;
  duration: string;
  difficulty: string;
  distance: string;
}

interface CrawlListProps {
  crawls: Crawl[];
  onCrawlPress: (crawl: Crawl) => void;
}

const CrawlList: React.FC<CrawlListProps> = ({ crawls, onCrawlPress }) => (
  <FlatList
    data={crawls}
    keyExtractor={item => item.id}
    renderItem={({ item }) => (
      <CrawlCard crawl={item} onPress={onCrawlPress} />
    )}
    contentContainerStyle={styles.listContent}
  />
);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default CrawlList; 
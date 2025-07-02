import React, { useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import CrawlCard from './CrawlCard';
import { Crawl } from '../../types/crawl';

interface CrawlListProps {
  crawls: Crawl[];
  onCrawlPress: (crawl: Crawl) => void;
  onCrawlStart: (crawl: Crawl) => void;
}

const CrawlList: React.FC<CrawlListProps> = ({ crawls, onCrawlPress, onCrawlStart }) => {
  // Remove expanded state for library context
  // const [expandedCrawlId, setExpandedCrawlId] = useState<string | null>(null);

  const handleCrawlPress = (crawl: Crawl) => {
    onCrawlPress(crawl);
  };

  const handleCrawlStart = (crawl: Crawl) => {
    onCrawlStart(crawl);
    // setExpandedCrawlId(null); // No expand/collapse
  };

  return (
    <FlatList
      data={crawls}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <CrawlCard 
          crawl={item} 
          onPress={handleCrawlPress}
          onStart={handleCrawlStart}
          isExpanded={false}
        />
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default CrawlList; 
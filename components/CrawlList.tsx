import React, { useState } from 'react';
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
  onCrawlStart: (crawl: Crawl) => void;
}

const CrawlList: React.FC<CrawlListProps> = ({ crawls, onCrawlPress, onCrawlStart }) => {
  const [expandedCrawlId, setExpandedCrawlId] = useState<string | null>(null);

  const handleCrawlPress = (crawl: Crawl) => {
    if (expandedCrawlId === crawl.id) {
      // If already expanded, collapse it
      setExpandedCrawlId(null);
    } else {
      // Expand this crawl and collapse any other
      setExpandedCrawlId(crawl.id);
    }
    onCrawlPress(crawl);
  };

  const handleCrawlStart = (crawl: Crawl) => {
    onCrawlStart(crawl);
    setExpandedCrawlId(null); // Collapse after starting
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
          isExpanded={expandedCrawlId === item.id}
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
import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { Crawl } from '../types/crawl';

interface CrawlCardProps {
  crawl: Crawl;
  onPress: (crawl: Crawl) => void;
  onStart: (crawl: Crawl) => void;
  isExpanded: boolean;
}

const CrawlCard: React.FC<CrawlCardProps> = ({ crawl, onPress, onStart, isExpanded }) => {
  const [animation] = useState(new Animated.Value(1));

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: isExpanded ? 0.95 : 1,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  return (
    <Animated.View style={[styles.crawlCard, { transform: [{ scale: animation }] }]}>
      <TouchableOpacity 
        style={styles.cardContent} 
        onPress={() => onPress(crawl)} 
        activeOpacity={0.7}
        disabled={isExpanded}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.crawlTitle}>{crawl.name}</Text>
          {!isExpanded && (
            <Text style={styles.crawlDesc} numberOfLines={2}>{crawl.description}</Text>
          )}
          <View style={styles.crawlMeta}>
            <Text style={styles.metaText}>{crawl.duration}</Text>
            <Text style={styles.metaText}>{crawl.distance}</Text>
            {crawl.steps && (
              <Text style={styles.metaText}>{crawl.steps.length} steps</Text>
            )}
          </View>
        </View>
        
        {isExpanded && (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => onStart(crawl)}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  crawlCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardLeft: {
    flex: 1,
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
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrawlCard; 
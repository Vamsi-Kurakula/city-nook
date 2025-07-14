import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Crawl } from '../../../types/crawl';
import DatabaseImage from '../../ui/DatabaseImage';
import { useTheme } from '../../context/ThemeContext';

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
            onError={(error) => console.log('Image loading error:', error)}
          />
        </View>
        <View style={styles.crawlContent}>
          <Text style={[styles.crawlTitle, { color: theme.text.primary }]}>{item.name}</Text>
          <Text style={[styles.crawlDescription, { color: theme.text.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.crawlMeta}>
            <Text style={[styles.crawlStops, { color: theme.button.primary }]}>{item.stops?.length || 0} stops</Text>
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
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Featured Crawls</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={[styles.viewAllText, { color: theme.button.primary }]}>View All</Text>
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
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
  horizontalListContainer: {
    paddingHorizontal: 4,
  },
  crawlCard: {
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 320,
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
  crawlStops: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 
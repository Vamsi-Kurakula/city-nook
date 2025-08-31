import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Crawl } from '../../../types/crawl';
import DatabaseImage from '../../ui/crawl/DatabaseImage';
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
        activeOpacity={0.8}
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
            <Text style={[styles.crawlStops, { color: theme.text.tertiary }]}>{item.stops?.length || 0} stops</Text>
            <Text style={[styles.crawlDistance, { color: theme.text.tertiary }]}>• {item.distance}</Text>
            <Text style={[styles.crawlDuration, { color: theme.text.tertiary }]}>• {item.duration}</Text>
            <Text style={[styles.crawlDifficulty, { color: theme.text.secondary }]}>• {item.difficulty}</Text>
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
        <TouchableOpacity onPress={onViewAllPress} activeOpacity={0.8}>
          <Text style={[styles.viewAllText, { color: theme.button.primary }]}>View All Crawls</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={featuredCrawls.slice(0, 3)}
        renderItem={renderCrawlItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContainer}
        // Simple, clean configuration that works on both platforms
        removeClippedSubviews={false}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        scrollEventThrottle={16}
        decelerationRate="normal"
        snapToAlignment="start"
        // Platform-specific optimizations
        {...Platform.select({
          android: {
            overScrollMode: 'never',
            nestedScrollEnabled: false,
            scrollIndicatorInsets: { right: 1 },
          },
          ios: {
            alwaysBounceHorizontal: false,
            scrollIndicatorInsets: { right: 1 },
          },
        })}
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
    alignItems: 'center',
    flexWrap: 'wrap',
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

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme, createTextStyles, spacing } from '../context';
import { CrawlDefinition } from '../../types/crawl';

interface LibraryCrawlCardProps {
  crawl: CrawlDefinition;
  onPress: (crawl: CrawlDefinition) => void;
}

export default function LibraryCrawlCard({ crawl, onPress }: LibraryCrawlCardProps) {
  const { theme } = useTheme();
  const textStyles = createTextStyles(theme);

  const handlePress = () => {
    onPress(crawl);
  };

  // Get number of stops from description or use a default
  const getStopCount = () => {
    // This is a placeholder - in a real app, you'd query the crawl_stops table
    const match = crawl.description.match(/(\d+)\s*stops?/i);
    return match ? parseInt(match[1]) : 5;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.background.secondary }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Hero Image - Full Width */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: crawl.hero_image_url || 'https://via.placeholder.com/400x200/666666/FFFFFF?text=No+Image'
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        {/* Content Overlay */}
        <View style={[styles.contentOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <Text style={[styles.cardTitle, { color: theme.text.inverse }]} numberOfLines={2}>
            {crawl.name}
          </Text>
          
          <Text style={[styles.cardDescription, { color: theme.text.inverse }]} numberOfLines={2}>
            {crawl.description}
          </Text>
          
          <View style={styles.statsContainer}>
            <Text style={[styles.statText, { color: theme.text.inverse }]}>
              {getStopCount()} stops
            </Text>
            <Text style={[styles.statSeparator, { color: theme.text.inverse }]}>•</Text>
            <Text style={[styles.statText, { color: theme.text.inverse }]}>
              {crawl.distance}
            </Text>
            <Text style={[styles.statSeparator, { color: theme.text.inverse }]}>•</Text>
            <Text style={[styles.statText, { color: theme.text.inverse }]}>
              {crawl.duration}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    height: 200,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statSeparator: {
    fontSize: 14,
    marginHorizontal: spacing.xs,
  },
});

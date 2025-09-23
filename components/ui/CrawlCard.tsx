import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme, createTextStyles, spacing } from '../context';
import { CrawlDefinition } from '../../types/crawl';

interface CrawlCardProps {
  crawl: CrawlDefinition;
  onPress: (crawl: CrawlDefinition) => void;
}

export default function CrawlCard({ crawl, onPress }: CrawlCardProps) {
  const { theme } = useTheme();
  const textStyles = createTextStyles(theme);

  const handlePress = () => {
    onPress(crawl);
  };

  // Get number of stops from description or use a default
  const getStopCount = () => {
    // This is a placeholder - in a real app, you'd query the crawl_stops table
    // For now, we'll extract from description or use a default
    const match = crawl.description.match(/(\d+)\s*stops?/i);
    return match ? parseInt(match[1]) : 5; // Default to 5 stops
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.background.secondary }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: crawl.hero_image_url || 'https://via.placeholder.com/300x200/666666/FFFFFF?text=No+Image'
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.cardTitle, { color: theme.text.primary }]} numberOfLines={2}>
          {crawl.name}
        </Text>
        
        <Text style={[textStyles.body, { color: theme.text.secondary }]} numberOfLines={3}>
          {crawl.description}
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[textStyles.caption, { color: theme.text.tertiary }]}>
              {getStopCount()} stops
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[textStyles.caption, { color: theme.text.tertiary }]}>
              {crawl.distance}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[textStyles.caption, { color: theme.text.tertiary }]}>
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
    width: 280,
    borderRadius: 16,
    marginRight: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
});

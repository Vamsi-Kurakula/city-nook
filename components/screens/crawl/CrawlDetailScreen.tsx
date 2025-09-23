import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, createTextStyles, spacing } from '../../context';
import { CrawlDefinition } from '../../../types/crawl';

type CrawlDetailScreenRouteProp = RouteProp<{ params: { crawl: CrawlDefinition } }, 'params'>;
type CrawlDetailScreenNavigationProp = StackNavigationProp<any, 'CrawlDetail'>;

interface CrawlDetailScreenProps {
  navigation: CrawlDetailScreenNavigationProp;
  route: CrawlDetailScreenRouteProp;
}

export default function CrawlDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<CrawlDetailScreenNavigationProp>();
  const route = useRoute<CrawlDetailScreenRouteProp>();
  const textStyles = createTextStyles(theme);
  
  const { crawl } = route.params;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleStartCrawl = () => {
    // TODO: Implement start crawl functionality
    console.log('Starting crawl:', crawl.name);
  };


  const getStopCount = () => {
    // This is a placeholder - in a real app, you'd query the crawl_stops table
    const match = crawl.description.match(/(\d+)\s*stops?/i);
    return match ? parseInt(match[1]) : 5;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.backButtonText, { color: theme.text.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: crawl.hero_image_url || 'https://via.placeholder.com/400x300/666666/FFFFFF?text=No+Image'
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={[textStyles.title, { color: theme.text.primary }]}>
              {crawl.name}
            </Text>
          </View>

          {/* Description */}
          <Text style={[textStyles.body, { color: theme.text.secondary, marginBottom: spacing.lg }]}>
            {crawl.description}
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
             <View style={[styles.statCard, { backgroundColor: theme.background.secondary }]}>
               <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                 STOPS
               </Text>
               <Text style={[styles.statValue, { color: theme.text.primary }]}>
                 {getStopCount()}
               </Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: theme.background.secondary }]}>
               <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                 DISTANCE
               </Text>
               <Text style={[styles.statValue, { color: theme.text.primary }]}>
                 {crawl.distance}
               </Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: theme.background.secondary }]}>
               <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                 DURATION
               </Text>
               <Text style={[styles.statValue, { color: theme.text.primary }]}>
                 {crawl.duration}
               </Text>
             </View>
          </View>

          {/* Start Time (if available) */}
          {crawl.start_time && (
            <View style={[styles.startTimeCard, { backgroundColor: theme.background.secondary }]}>
              <Text style={[textStyles.caption, { color: theme.text.tertiary }]}>
                START TIME
              </Text>
              <Text style={[textStyles.body, { color: theme.text.primary }]}>
                {new Date(crawl.start_time).toLocaleString()}
              </Text>
            </View>
          )}

          {/* Start Crawl Button */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.special.accent }]}
            onPress={handleStartCrawl}
            activeOpacity={0.8}
          >
            <Text style={[textStyles.button, { color: theme.text.inverse }]}>
              Start Crawl
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  heroContainer: {
    position: 'relative',
    height: 250,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  startTimeCard: {
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  startButton: {
    paddingVertical: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});

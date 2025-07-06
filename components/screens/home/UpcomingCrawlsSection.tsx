import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { formatTimeRemaining } from '../../../utils/crawlStatus';
import { getHeroImageSource } from '../../auto-generated/ImageLoader';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface PublicCrawl {
  id: string;
  name: string;
  title?: string;
  description: string;
  start_time: string;
  hero_image: string;
  stops: any[];
  assetFolder: string;
}

interface UpcomingCrawlsSectionProps {
  upcomingCrawls: PublicCrawl[];
  userSignups: string[];
  onCrawlPress: (crawlId: string) => void;
  onViewAllPress: () => void;
  onSignUpPress: (crawlId: string) => void;
}

export default function UpcomingCrawlsSection({
  upcomingCrawls,
  userSignups,
  onCrawlPress,
  onViewAllPress,
  onSignUpPress,
}: UpcomingCrawlsSectionProps) {
  const { user } = useAuthContext();
  const { theme } = useTheme();

  if (upcomingCrawls.length === 0) {
    return null;
  }

  const renderCrawlItem = ({ item }: { item: PublicCrawl }) => {
    const isSignedUp = userSignups.includes(item.id);
    
    // Calculate time remaining in seconds
    const startTime = new Date(item.start_time);
    const now = new Date();
    const timeRemainingSeconds = Math.max(0, Math.floor((startTime.getTime() - now.getTime()) / 1000));
    const timeRemaining = formatTimeRemaining(timeRemainingSeconds);
    
    const heroImageSource = getHeroImageSource(item.assetFolder);

    return (
      <TouchableOpacity
        style={[styles.crawlCard, { backgroundColor: theme.background.secondary, shadowColor: theme.shadow.primary }]}
        onPress={() => onCrawlPress(item.id)}
      >
        <View style={[styles.crawlImageContainer, { backgroundColor: theme.background.tertiary }]}>
          <Text style={styles.crawlImage}>🖼️</Text>
        </View>
        <View style={styles.crawlContent}>
          <Text style={[styles.crawlTitle, { color: theme.text.primary }]}>{item.title || item.name}</Text>
          <Text style={[styles.crawlDescription, { color: theme.text.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.crawlMeta}>
            <Text style={[styles.crawlTime, { color: theme.button.primary }]}>{timeRemaining}</Text>
            {isSignedUp && (
              <View style={[styles.signedUpBadge, { backgroundColor: theme.status.success }]}>
                <Text style={[styles.signedUpText, { color: theme.text.inverse }]}>Signed Up</Text>
              </View>
            )}
          </View>
          {!isSignedUp && user && (
            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: theme.button.primary }]}
              onPress={() => onSignUpPress(item.id)}
            >
              <Text style={[styles.signUpButtonText, { color: theme.text.inverse }]}>Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Upcoming Public Crawls</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={[styles.viewAllText, { color: theme.button.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={upcomingCrawls.slice(0, 3)}
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
  },
  crawlImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crawlImage: {
    fontSize: 40,
  },
  crawlContent: {
    padding: 16,
  },
  crawlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  crawlTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  signedUpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  signedUpText: {
    fontSize: 10,
    fontWeight: '600',
  },
  signUpButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useCrawlContext } from '../../context/CrawlContext';
import { useTheme } from '../../context/ThemeContext';

import HomeHeader from './HomeHeader';
import FeaturedCrawlsSection from './FeaturedCrawlsSection';
import DatabaseImage from '../../ui/DatabaseImage';
import { useHomeData } from './hooks/useHomeData';
import { useCrawlActions } from './hooks/useCrawlActions';
import { getFriendsList } from '../../../utils/database/friendshipOperations';
import { SocialUserProfile } from '../../../types/social';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoading } = useAuthContext();
  const { hasCrawlInProgress, getCurrentCrawlName } = useCrawlContext();
  const { theme } = useTheme();
  const userId = user?.id;

  const {
    featuredCrawls,
    currentCrawl,
    currentCrawlDetails,
    loading,
  } = useHomeData();

  const {
    handleFeaturedCrawlCardPress,
    handleFeaturedCrawlCardStart,
    handleInProgressCrawlPress,
    handleViewAllFeaturedCrawls,
    handleSignUpForCrawl,
  } = useCrawlActions();

  const [friends, setFriends] = React.useState<SocialUserProfile[]>([]);
  const [friendsLoading, setFriendsLoading] = React.useState(true);
  React.useEffect(() => {
    let mounted = true;
    async function fetchFriends() {
      if (!userId) return;
      setFriendsLoading(true);
      try {
        const result = await getFriendsList(userId);
        if (mounted) setFriends(result);
      } catch (e) {
        if (mounted) setFriends([]);
      } finally {
        if (mounted) setFriendsLoading(false);
      }
    }
    fetchFriends();
    return () => { mounted = false; };
  }, [userId]);


  // Convert CrawlDefinition to Crawl format for compatibility
  const convertedFeaturedCrawls = featuredCrawls.map(crawl => ({
    id: crawl.crawl_definition_id,
    name: crawl.name,
    description: crawl.description,
    duration: crawl.duration,
    difficulty: crawl.difficulty,
    distance: crawl.distance,
    'public-crawl': crawl.is_public,
    hero_image_url: crawl.hero_image_url,
    stops: (crawl as any).stops || [], // Use the stops that were loaded from database
  }));

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <HomeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.button.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HomeHeader />
        
        {/* Crawl Library Button - Moved to top for better visibility */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.fullWidthButton, { backgroundColor: theme.background.secondary }]} 
              onPress={() => navigation.navigate('CrawlLibrary')}
            >
              <Text style={[styles.fullWidthButtonText, { color: theme.text.primary }]}>Crawl Library</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Debug Section - Disabled for now */}
        {false && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Debug Info</Text>
            </View>
            <View style={[styles.debugCard, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.debugText, { color: theme.text.primary }]}>
                User ID: {userId || 'Not logged in'}
              </Text>
              <Text style={[styles.debugText, { color: theme.text.primary }]}>
                Current Crawl: {currentCrawl ? 'Yes' : 'No'}
              </Text>
              <Text style={[styles.debugText, { color: theme.text.primary }]}>
                Crawl Details: {currentCrawlDetails ? 'Yes' : 'No'}
              </Text>
              {currentCrawl && (
                <>
                  <Text style={[styles.debugText, { color: theme.text.primary }]}>
                    Crawl ID: {currentCrawl?.crawlId}
                  </Text>
                  <Text style={[styles.debugText, { color: theme.text.primary }]}>
                    Current Step: {currentCrawl?.currentStep}
                  </Text>
                  <Text style={[styles.debugText, { color: theme.text.primary }]}>
                    Is Public: {currentCrawl?.isPublicCrawl ? 'Yes' : 'No'}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
        
        {/* In Progress Crawl Section */}
        {currentCrawl && currentCrawlDetails && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Continue Crawling</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.continueCrawlCard,
                {
                  backgroundColor: theme.background.primary,
                  borderColor: theme.background.secondary,
                  borderWidth: 1,
                  flexDirection: 'row',
                  padding: 0,
                  shadowColor: theme.shadow.primary,
                },
              ]}
              onPress={() => handleInProgressCrawlPress(currentCrawl)}
              activeOpacity={0.9}
            >
              {/* Left: Hero Image */}
              <View style={styles.continueCrawlImageWrapper}>
                <DatabaseImage
                  heroImageUrl={currentCrawlDetails.hero_image_url}
                  style={styles.continueCrawlImage}
                  resizeMode="cover"
                />
              </View>
              {/* Right: Info */}
              <View style={styles.continueCrawlInfoWrapper}>
                <View style={styles.continueCrawlInfoContent}>
                  <Text style={[styles.crawlTitle, { color: theme.text.primary, marginBottom: 12 }]}>{currentCrawlDetails.name}</Text>
                  <Text style={[styles.continueCrawlLabel, { color: theme.text.primary }]}>Currently At:</Text>
                  <Text style={[styles.continueCrawlValue, { color: theme.text.primary }]}>
                    {currentCrawlDetails.stops && currentCrawl.currentStep && currentCrawlDetails.stops[currentCrawl.currentStep - 1]?.location_name || 'N/A'}
                  </Text>
                  <Text style={[styles.continueCrawlLabel, { color: theme.text.primary, marginTop: 8 }]}>Stops Left:</Text>
                  <Text style={[styles.continueCrawlValue, { color: theme.text.primary }]}>
                    {currentCrawlDetails.stops ? currentCrawlDetails.stops.length - currentCrawl.currentStep + 1 : 'N/A'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Crawls Section */}
        <FeaturedCrawlsSection
          featuredCrawls={convertedFeaturedCrawls}
          onCrawlPress={handleFeaturedCrawlCardPress}
          onCrawlStart={handleFeaturedCrawlCardStart}
          onViewAllPress={handleViewAllFeaturedCrawls}
        />
        {/* Fellow Crawlers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Fellow Crawlers</Text>
          </View>
          {friendsLoading ? (
            <ActivityIndicator size="small" color={theme.button.primary} style={{ marginVertical: 16 }} />
          ) : friends.length === 0 ? (
            <Text style={{ color: theme.text.secondary, textAlign: 'center', marginVertical: 16 }}>No friends yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsScroll}>
              {friends.map(friend => (
                <TouchableOpacity
                  key={friend.user_profile_id}
                  style={styles.friendAvatarWrapper}
                  onPress={() => navigation.navigate('FriendProfile', { friend })}
                  activeOpacity={0.8}
                >
                  {friend.avatar_url ? (
                    <Image source={{ uri: friend.avatar_url }} style={[styles.friendAvatar, { borderColor: theme.background.secondary }]} />
                  ) : (
                    <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder, { backgroundColor: theme.button.primary }]}> 
                      <Text style={[styles.friendAvatarText, { color: theme.text.inverse }]}> 
                        {friend.full_name?.charAt(0) || friend.email?.charAt(0) || 'F'}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.friendName, { color: theme.text.primary }]} numberOfLines={1}>{friend.full_name || 'Unknown'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
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
  crawlTitle: {
    fontSize: 18,
    fontWeight: '400',
  },
  continueCrawlCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
    overflow: 'hidden',
  },
  continueCrawlImageWrapper: {
    flex: 1,
    minWidth: 0,
    minHeight: 140,
    maxHeight: 180,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
    height: '100%',
  },
  continueCrawlImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    flex: 1,
  },
  continueCrawlInfoWrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  continueCrawlInfoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  continueCrawlLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  continueCrawlValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  fullWidthButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  fullWidthButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  debugCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugText: {
    fontSize: 14,
    marginBottom: 4,
  },
  friendsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  friendAvatarWrapper: {
    alignItems: 'center',
    marginRight: 12,
    width: 72,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  friendName: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 64,
  },
}); 
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, Image, RefreshControl, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useCrawlContext } from '../../context/CrawlContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';

import HomeHeader from './HomeHeader';
import FeaturedCrawlsSection from './FeaturedCrawlsSection';
import { DatabaseImage } from '../../ui/crawl';
import { useHomeData } from './hooks/useHomeData';
import { useCrawlActions } from './hooks/useCrawlActions';
import { getFriendsList } from '../../../utils/database/friendshipOperations';
import { getPendingRequests } from '../../../utils/database/friendRequestOperations';
import { SocialUserProfile } from '../../../types/social';
import GradientBackground from '../../ui/common/GradientBackground';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoading } = useAuthContext();
  const { hasCrawlInProgress, getCurrentCrawlName } = useCrawlContext();
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const userId = user?.id;
  const insets = useSafeAreaInsets();

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
  const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);



  // Helper to reload all home data and friends
  const onRefresh = async () => {
    setRefreshing(true);
    // Optionally, you can trigger a reload in useHomeData if it supports it, or force a re-render
    // For now, manually re-fetch friends and pending requests
    if (userId) {
      try {
        setFriendsLoading(true);
        const token = await getToken({ template: 'supabase' });
        if (token) {
          const [friendsResult, pending] = await Promise.all([
            getFriendsList(userId, token),
            getPendingRequests(userId, token)
          ]);
          setFriends(friendsResult);
          setPendingRequestsCount(pending.length);
        } else {
          console.log('No JWT token available for refreshing friends data');
          setFriends([]);
          setPendingRequestsCount(0);
        }
      } catch {
        setFriends([]);
        setPendingRequestsCount(0);
      } finally {
        setFriendsLoading(false);
      }
    }
    // If useHomeData supports a reload, trigger it here (e.g., by calling a refetch function or updating a key)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('homeDataRefresh'));
    }
    setRefreshing(false);
  };

  React.useEffect(() => {
    let mounted = true;
    async function fetchFriends() {
      if (!userId) return;
      setFriendsLoading(true);
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          const result = await getFriendsList(userId, token);
          if (mounted) setFriends(result);
        } else {
          console.log('No JWT token available for fetching friends');
          if (mounted) setFriends([]);
        }
      } catch (e) {
        if (mounted) setFriends([]);
      } finally {
        if (mounted) setFriendsLoading(false);
      }
    }
    fetchFriends();
    return () => { mounted = false; };
  }, [userId]);

  React.useEffect(() => {
    let mounted = true;
    async function fetchPendingRequests() {
      if (!userId) return;
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          const pending = await getPendingRequests(userId, token);
          if (mounted) setPendingRequestsCount(pending.length);
        } else {
          console.log('No JWT token available for fetching pending requests');
          if (mounted) setPendingRequestsCount(0);
        }
      } catch {
        if (mounted) setPendingRequestsCount(0);
      }
    }
    fetchPendingRequests();
    return () => { mounted = false; };
  }, [userId]);


  // Convert PublicCrawl to Crawl format for compatibility
  const convertedFeaturedCrawls = featuredCrawls.map(crawl => ({
    id: crawl.id,
    name: crawl.name,
    description: crawl.description,
    duration: crawl.duration || '',
    difficulty: crawl.difficulty || '',
    distance: crawl.distance || '',
    'public-crawl': crawl.is_public || false,
    hero_image_url: crawl.hero_image_url || crawl.hero_image,
    assetFolder: crawl.assetFolder,
    stops: crawl.stops || [],
  }));

  if (loading) {
    return (
      <GradientBackground variant="page" style={styles.container}>
        <View style={[
          styles.loadingContainer, 
          { 
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }
        ]}>
          <HomeHeader />
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.button.primary} />
            <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading...</Text>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="page" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.button.primary]}
              tintColor={theme.button.primary}
            />
          }
        >
          <HomeHeader />

          {/* Fellow Crawlers Section - Right under the "Crawls" title */}
          <View style={[styles.section, { marginTop: 20 }]}>
            {friendsLoading ? (
              <ActivityIndicator size="small" color={theme.button.primary} style={{ marginVertical: 16 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsScroll}>
                {friends.slice(0, 3).map(friend => (
                  <TouchableOpacity
                    key={friend.user_profile_id}
                    style={styles.friendAvatarWrapper}
                    onPress={() => navigation.navigate('FriendProfile', { friend })}
                    activeOpacity={0.8}
                  >
                    {friend.avatar_url ? (
                      <Image source={{ uri: friend.avatar_url }} style={[styles.friendAvatar, { borderColor: 'transparent' }]} />
                    ) : (
                      <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder, { backgroundColor: theme.button.primary }]}>
                        <Text style={[styles.friendAvatarText, { color: theme.text.inverse }]}>
                          {friend.full_name?.charAt(0) || friend.email?.charAt(0) || 'F'}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.friendName, { color: theme.text.primary }]} numberOfLines={2}>{friend.full_name || 'Unknown'}</Text>
                  </TouchableOpacity>
                ))}
                {friends.length > 3 && (
                  <TouchableOpacity
                    key="view-all-friends"
                    style={[styles.friendAvatarWrapper, styles.viewAllButtonWrapper]}
                    onPress={() => navigation.navigate('FriendsList')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.friendAvatar, styles.viewAllButton, { backgroundColor: theme.button.primary, borderColor: 'transparent' }]}>
                      <Text style={[styles.viewAllButtonText, { color: theme.text.inverse }]}>+{friends.length - 3}</Text>
                    </View>
                    <Text style={[styles.friendName, { color: theme.text.primary }]} numberOfLines={2}>View All</Text>
                  </TouchableOpacity>
                )}
                {friends.length < 3 && (
                  <TouchableOpacity
                    key="add-friends"
                    style={[styles.friendAvatarWrapper, styles.addFriendButtonWrapper]}
                    onPress={() => navigation.navigate('AddFriends')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.friendAvatar, styles.addFriendButton, { backgroundColor: 'transparent', borderColor: theme.button.primary, borderWidth: 2 }]}>
                      <Text style={[styles.addFriendButtonText, { color: theme.button.primary }]}>+</Text>
                      {pendingRequestsCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: theme.button.secondary }]}>
                          <Text style={[styles.badgeText, { color: theme.button.primary }]}>{pendingRequestsCount}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.friendName, { color: theme.text.primary }]} numberOfLines={2}>Add Friends</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>

          {/* In Progress Crawl Section */}
          {currentCrawl && currentCrawlDetails && (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
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

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
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
    paddingHorizontal: 8,
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

  friendsScroll: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 70, // even more space for badge overflow
    gap: 16,
    alignItems: 'flex-start',
    paddingBottom: 8,
    overflow: 'visible', // Ensure overflow is visible for badge
  },
  friendAvatarWrapper: {
    alignItems: 'center',
    marginRight: 12,
    width: 72,
    position: 'relative',
    overflow: 'visible', // Ensure overflow is visible for badge
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
    lineHeight: 16,
    height: 32,
    flexWrap: 'wrap',
  },
  viewAllButtonWrapper: {
    alignItems: 'center',
    marginRight: 0,
    width: 72,
  },
  viewAllButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#888',
  },
  viewAllButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addFriendButtonWrapper: {
    alignItems: 'center',
    marginRight: 48, // even more space for badge
    width: 72,
    position: 'relative',
    overflow: 'visible', // Ensure overflow is visible for badge
  },
  addFriendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#888',
  },
  addFriendButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: 0, // Move badge slightly inward
    right: 0, // Move badge slightly inward
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: '#FF5252', // fallback, will be overridden inline
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 

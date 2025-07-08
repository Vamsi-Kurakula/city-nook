import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useCrawlContext } from '../../context/CrawlContext';
import { useTheme } from '../../context/ThemeContext';

import HomeHeader from './HomeHeader';
import UpcomingCrawlsSection from './UpcomingCrawlsSection';
import FeaturedCrawlsSection from './FeaturedCrawlsSection';
import { useHomeData } from './hooks/useHomeData';
import { useCrawlActions } from './hooks/useCrawlActions';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoading } = useAuthContext();
  const { hasCrawlInProgress, getCurrentCrawlName } = useCrawlContext();
  const { theme } = useTheme();
  const userId = user?.id;



  const {
    fullFeaturedCrawls,
    upcomingCrawls,
    userSignups,
    currentCrawl,
    currentCrawlDetails,
    loading,
  } = useHomeData(userId, isLoading);

  const {
    handleFeaturedCrawlCardPress,
    handleFeaturedCrawlCardStart,
    handleInProgressCrawlPress,
    handlePublicCrawlPress,
    handleViewAllPublicCrawls,
    handleViewAllFeaturedCrawls,
    handleSignUpForCrawl,
  } = useCrawlActions();

  const handleSignUpForCrawlWrapper = (crawlId: string) => {
    if (userId) {
      handleSignUpForCrawl(crawlId, userId);
    }
  };

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
                <Image
                  source={require('../../auto-generated/ImageLoader').getHeroImageSource(currentCrawlDetails.assetFolder)}
                  style={styles.continueCrawlImage}
                  resizeMode="cover"
                />
              </View>
              {/* Right: Info */}
              <View style={styles.continueCrawlInfoWrapper}>
                <View style={styles.continueCrawlInfoContent}>
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

        {/* Upcoming Public Crawls Section */}
        <UpcomingCrawlsSection
          upcomingCrawls={upcomingCrawls}
          userSignups={userSignups}
          onCrawlPress={handlePublicCrawlPress}
          onViewAllPress={handleViewAllPublicCrawls}
          onSignUpPress={handleSignUpForCrawlWrapper}
        />

        {/* Featured Crawls Section */}
        <FeaturedCrawlsSection
          featuredCrawls={fullFeaturedCrawls}
          onCrawlPress={handleFeaturedCrawlCardPress}
          onCrawlStart={handleFeaturedCrawlCardStart}
          onViewAllPress={handleViewAllFeaturedCrawls}
        />
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
  },
  continueCrawlImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
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
}); 
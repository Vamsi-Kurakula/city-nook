import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
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
              style={[styles.halfWidthButton, { backgroundColor: theme.background.secondary, shadowColor: theme.shadow.primary }]} 
              onPress={() => navigation.navigate('CrawlLibrary')}
            >
              <Text style={[styles.halfWidthButtonText, { color: theme.text.primary }]}>📚 Crawl Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.halfWidthButton, { backgroundColor: theme.background.secondary, shadowColor: theme.shadow.primary }]} 
              onPress={() => navigation.navigate('PublicCrawls')}
            >
              <Text style={[styles.halfWidthButtonText, { color: theme.text.primary }]}>🎯 Join Crawl</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* In Progress Crawl Section */}
        {currentCrawl && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Continue Your Crawl</Text>
            </View>
            <TouchableOpacity
              style={[styles.continueCrawlCard, { backgroundColor: theme.button.primary, shadowColor: theme.shadow.primary }]}
              onPress={() => handleInProgressCrawlPress(currentCrawl)}
            >
              <View style={styles.continueCrawlContent}>
                <Text style={[styles.continueCrawlTitle, { color: theme.text.inverse }]}>
                  {getCurrentCrawlName() || 'Current Crawl'}
                </Text>
                <Text style={[styles.continueCrawlProgress, { color: theme.text.inverse }]}>
                  Stop {currentCrawl.currentStep} of {currentCrawl.completedSteps.length + 1}
                </Text>
                <Text style={[styles.continueCrawlButton, { color: theme.text.inverse }]}>Continue →</Text>
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
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueCrawlContent: {
    alignItems: 'center',
  },
  continueCrawlTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  continueCrawlProgress: {
    fontSize: 14,
    marginBottom: 8,
  },
  continueCrawlButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  halfWidthButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  halfWidthButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 
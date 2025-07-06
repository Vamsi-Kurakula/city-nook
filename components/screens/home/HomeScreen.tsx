import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useCrawlContext } from '../../context/CrawlContext';
import HomeHeader from './HomeHeader';
import UpcomingCrawlsSection from './UpcomingCrawlsSection';
import FeaturedCrawlsSection from './FeaturedCrawlsSection';
import { useHomeData } from './hooks/useHomeData';
import { useCrawlActions } from './hooks/useCrawlActions';

interface CrawlProgress {
  crawlId: string;
  currentStep: number;
  completedSteps: number[];
  startTime: string;
  isPublicCrawl: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoading } = useAuthContext();
  const { hasCrawlInProgress, getCurrentCrawlName } = useCrawlContext();
  const userId = user?.id;

  // Add debugging
  console.log('HomeScreen render:', { 
    user: user ? 'defined' : 'undefined', 
    userId, 
    isLoading,
    userEmail: user?.emailAddresses?.[0]?.emailAddress 
  });

  const {
    featuredCrawls,
    fullFeaturedCrawls,
    upcomingCrawls,
    userSignups,
    currentCrawl,
    inProgressCrawls,
    allLibraryCrawls,
    loading,
    loadHomeData,
  } = useHomeData(userId, isLoading);

  const {
    handleContinueCrawl,
    handleFeaturedCrawlPress,
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
      <SafeAreaView style={styles.container}>
        <HomeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HomeHeader />
        
        {/* Crawl Library Button - Moved to top for better visibility */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.halfWidthButton} 
              onPress={() => navigation.navigate('CrawlLibrary')}
            >
              <Text style={styles.halfWidthButtonText}>📚 Crawl Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.halfWidthButton} 
              onPress={() => console.log('Join crawl button pressed')}
            >
              <Text style={styles.halfWidthButtonText}>🎯 Join Crawl</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* In Progress Crawl Section */}
        {currentCrawl && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Your Crawl</Text>
            </View>
            <TouchableOpacity
              style={styles.continueCrawlCard}
              onPress={() => handleInProgressCrawlPress(currentCrawl)}
            >
              <View style={styles.continueCrawlContent}>
                <Text style={styles.continueCrawlTitle}>
                  {getCurrentCrawlName() || 'Current Crawl'}
                </Text>
                <Text style={styles.continueCrawlProgress}>
                  Stop {currentCrawl.currentStep} of {currentCrawl.completedSteps.length + 1}
                </Text>
                <Text style={styles.continueCrawlButton}>Continue →</Text>
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
    backgroundColor: '#f8f9fa',
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
    color: '#666',
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
    color: '#1a1a1a',
  },
  continueCrawlCard: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
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
    color: 'white',
    marginBottom: 4,
  },
  continueCrawlProgress: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  continueCrawlButton: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  halfWidthButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  halfWidthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
}); 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, createTextStyles, spacing } from '../../context';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedNavigator';
import FeaturedCrawlCard from '../../ui/FeaturedCrawlCard';
import { CrawlDefinition } from '../../../types/crawl';
import { getFeaturedCrawls } from '../../../services/crawlService';

type HomeScreenNavigationProp = StackNavigationProp<AuthorizedStackParamList, 'Home'>;

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const textStyles = createTextStyles(theme);
  const [featuredCrawls, setFeaturedCrawls] = useState<CrawlDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured crawls from database
  useEffect(() => {
    const fetchFeaturedCrawls = async () => {
      try {
        setLoading(true);
        const crawls = await getFeaturedCrawls();
        setFeaturedCrawls(crawls);
      } catch (error) {
        console.error('Failed to fetch featured crawls:', error);
        setFeaturedCrawls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCrawls();
  }, []);

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleCrawlPress = (crawl: CrawlDefinition) => {
    navigation.navigate('CrawlDetail', { crawl });
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.content}>
          <Text style={[textStyles.subtitle, { color: theme.text.secondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary, textAlign: 'left' }]}>
            Crawls
          </Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <Image
              source={{ 
                uri: user?.imageUrl || 'https://via.placeholder.com/50x50/666666/FFFFFF?text=U'
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Featured Crawls Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={[textStyles.subtitle, { color: theme.text.primary, textAlign: 'left' }]}>
              Featured Crawls
            </Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CrawlLibrary')}
              activeOpacity={0.8}
            >
              <Text style={[styles.viewAllText, { color: theme.special.accent }]}>
                View All Crawls
              </Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[textStyles.body, { color: theme.text.secondary }]}>
                Loading featured crawls...
              </Text>
            </View>
          ) : featuredCrawls.length > 0 ? (
            <FlatList
              data={featuredCrawls}
              renderItem={({ item, index }) => (
                <FeaturedCrawlCard 
                  crawl={item} 
                  onPress={handleCrawlPress}
                  style={index === featuredCrawls.length - 1 ? { marginRight: spacing.lg } : {}}
                />
              )}
              keyExtractor={(item) => item.crawl_definition_id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.crawlListContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[textStyles.body, { color: theme.text.secondary }]}>
                No featured crawls available
              </Text>
            </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  profileButton: {
    padding: spacing.xs,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuredSection: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  viewAllButton: {
    padding: spacing.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  crawlListContent: {
    paddingLeft: spacing.lg,
    paddingRight: 0,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

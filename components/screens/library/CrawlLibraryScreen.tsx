import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, createTextStyles, spacing } from '../../context';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedNavigator';
import LibraryCrawlCard from '../../ui/LibraryCrawlCard';
import { CrawlDefinition } from '../../../types/crawl';
import { getAllCrawls } from '../../../services/crawlService';

type CrawlLibraryScreenNavigationProp = StackNavigationProp<AuthorizedStackParamList, 'CrawlLibrary'>;

export default function CrawlLibraryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<CrawlLibraryScreenNavigationProp>();
  const textStyles = createTextStyles(theme);
  
  const [allCrawls, setAllCrawls] = useState<CrawlDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all crawls from database
  useEffect(() => {
    fetchAllCrawls();
  }, []);

  const fetchAllCrawls = async () => {
    try {
      setLoading(true);
      const crawls = await getAllCrawls();
      setAllCrawls(crawls);
    } catch (error) {
      console.error('Failed to fetch all crawls:', error);
      setAllCrawls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllCrawls();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCrawlPress = (crawl: CrawlDefinition) => {
    navigation.navigate('CrawlDetail', { crawl });
  };

  const renderCrawlCard = ({ item }: { item: CrawlDefinition }) => (
    <LibraryCrawlCard crawl={item} onPress={handleCrawlPress} />
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
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
          <Text style={[textStyles.title, { color: theme.text.primary }]}>
            Crawl Library
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[textStyles.body, { color: theme.text.secondary }]}>
            Loading crawls...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
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
        <Text style={[textStyles.title, { color: theme.text.primary }]}>
          Crawl Library
        </Text>
      </View>

      {/* Crawls List */}
      <FlatList
        data={allCrawls}
        renderItem={renderCrawlCard}
        keyExtractor={(item) => item.crawl_definition_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.text.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[textStyles.body, { color: theme.text.secondary }]}>
              No crawls available
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
});

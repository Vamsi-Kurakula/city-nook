import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '@clerk/clerk-expo';
import { useTheme } from '../../context/ThemeContext';
import { getCrawlHistory } from '../../../utils/database/historyOperations';
import { getCrawlNameMapping } from '../../../utils/database/crawlMetadataOperations';
import BackButton from '../../ui/common/BackButton';

interface CrawlHistoryItem {
  user_crawl_history_id: string;
  crawl_id: string;
  completed_at: string;
  total_time_minutes: number;
  score?: number;
  created_at: string;
  crawlName?: string;
}

const CrawlHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, isLoading } = useAuthContext();
  const { getToken } = useAuth();
  const { theme } = useTheme();
  const [history, setHistory] = useState<CrawlHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id || isLoading) return;
      
      setLoading(true);
      try {
        const token = await getToken({ template: 'supabase' });
        const history = token ? await getCrawlHistory(user.id, token) : [];
        const crawlNameMapping = await getCrawlNameMapping();
        setHistory(
          (history || []).map((item: any) => ({
            ...item,
            crawlName: crawlNameMapping[item.crawl_id] || item.crawl_id,
          }))
        );
      } catch (error) {
        console.error('Error fetching crawl history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id, isLoading]);

  const handleHistoryItemPress = (item: CrawlHistoryItem) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CrawlHistoryDetail',
        params: { 
          crawlId: item.crawl_id,
          completedAt: item.completed_at,
          totalTimeMinutes: item.total_time_minutes,
          score: item.score,
        },
      })
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.button.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.button.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={[styles.title, { color: theme.text.primary }]}>Crawl History</Text>
      
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No crawl history yet.</Text>
          <Text style={[styles.emptySubtext, { color: theme.text.tertiary }]}>Complete your first crawl to see it here!</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.user_crawl_history_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.historyItem, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}
              onPress={() => handleHistoryItemPress(item)}
            >
              <View style={styles.historyContent}>
                <Text style={[styles.crawlName, { color: theme.text.primary }]}>{item.crawlName}</Text>
                <Text style={[styles.completionDate, { color: theme.text.secondary }]}>
                  Completed: {formatDate(item.completed_at)}
                </Text>
                <Text style={[styles.duration, { color: theme.button.primary }]}>
                  Duration: {formatDuration(item.total_time_minutes)}
                </Text>
              </View>
              <Text style={[styles.arrow, { color: theme.text.tertiary }]}>→</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  historyContent: {
    flex: 1,
  },
  crawlName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  duration: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 12,
  },
  backButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 12 
  },
  backButtonText: { 
    color: '#888', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});

export default CrawlHistoryScreen; 

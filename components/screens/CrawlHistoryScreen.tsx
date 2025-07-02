import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import { getCrawlHistory, getCrawlNameMapping } from '../../utils/supabase';

interface CrawlHistoryItem {
  id: string;
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
  const [history, setHistory] = useState<CrawlHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id || isLoading) return;
      
      setLoading(true);
      try {
        const history = await getCrawlHistory(user.id);
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
        params: { crawlId: item.crawl_id },
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Crawl History</Text>
      
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No crawl history yet.</Text>
          <Text style={styles.emptySubtext}>Complete your first crawl to see it here!</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => handleHistoryItemPress(item)}
            >
              <View style={styles.historyContent}>
                <Text style={styles.crawlName}>{item.crawlName}</Text>
                <Text style={styles.completionDate}>
                  Completed: {formatDate(item.completed_at)}
                </Text>
                <Text style={styles.duration}>
                  Duration: {formatDuration(item.total_time_minutes)}
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    padding: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
});

export default CrawlHistoryScreen; 
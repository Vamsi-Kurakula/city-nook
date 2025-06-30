import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from './AuthContext';
import { getCrawlHistory, getCrawlNameMapping } from '../utils/supabase';

interface CrawlHistoryItem {
  id: string;
  crawl_id: string;
  completed_at: string;
  total_time_minutes: number;
  score?: number;
  created_at: string;
}

const CrawlHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const [history, setHistory] = useState<CrawlHistoryItem[]>([]);
  const [crawlNames, setCrawlNames] = useState<{ [crawlId: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      
      // Fetch both history and crawl names in parallel
      const [historyData, crawlNameMapping] = await Promise.all([
        getCrawlHistory(user.id),
        getCrawlNameMapping()
      ]);
      
      setHistory(historyData || []);
      setCrawlNames(crawlNameMapping || {});
      setLoading(false);
    };

    fetchData();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  const getCrawlDisplayName = (crawlId: string) => {
    const crawlName = crawlNames[crawlId];
    return crawlName || `Crawl ${crawlId}`;
  };

  const renderHistoryItem = ({ item }: { item: CrawlHistoryItem }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => navigation.navigate('CrawlHistoryDetail', {
        crawlId: item.crawl_id,
        completedAt: item.completed_at,
        totalTimeMinutes: item.total_time_minutes,
        score: item.score,
      })}
      activeOpacity={0.7}
    >
      <View style={styles.historyHeader}>
        <Text style={styles.crawlName}>{getCrawlDisplayName(item.crawl_id)}</Text>
        <Text style={styles.completionDate}>{formatDate(item.completed_at)}</Text>
      </View>
      
      <View style={styles.historyDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Completion Time:</Text>
          <Text style={styles.detailValue}>{formatTime(item.total_time_minutes)}</Text>
        </View>
        
        {item.score !== null && item.score !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Score:</Text>
            <Text style={styles.detailValue}>{item.score}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.tapHint}>Tap to view steps</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crawl History</Text>
        
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No completed crawls yet.</Text>
            <Text style={styles.emptySubtext}>Complete your first crawl to see it here!</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
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
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  crawlName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completionDate: {
    fontSize: 14,
    color: '#666',
  },
  historyDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  backButton: {
    padding: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default CrawlHistoryScreen; 
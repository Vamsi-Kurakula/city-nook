import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../ui/BackButton';
import { SocialUserProfile } from '../../types/social';
import { getCrawlStats } from '../../utils/database/statsOperations';
import { getCrawlHistory } from '../../utils/database/historyOperations';
import { getCrawlDefinitionById } from '../../utils/database/crawlDefinitionOperations';

interface FriendProfileRouteParams {
  friend: SocialUserProfile;
}

interface CrawlHistoryItem {
  user_crawl_history_id: string;
  crawl_id: string;
  completed_at: string;
  total_time_minutes: number;
  score?: number;
  created_at: string;
  crawlName?: string;
}

export default function FriendProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { friend } = route.params as FriendProfileRouteParams;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentCrawls, setRecentCrawls] = useState<CrawlHistoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsResult = await getCrawlStats(friend.user_profile_id);
        setStats(statsResult);
        const history = await getCrawlHistory(friend.user_profile_id) || [];
        const latest = history.slice(0, 5);
        // Fetch crawl details for each
        const crawlsWithDetails = await Promise.all(latest.map(async (h: any) => {
          const crawlDef = await getCrawlDefinitionById(h.crawl_id);
          return {
            ...h,
            crawlName: crawlDef?.name || 'Unknown Crawl',
          };
        }));
        setRecentCrawls(crawlsWithDetails);
      } catch (err) {
        setStats(null);
        setRecentCrawls([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [friend.user_profile_id]);

  const handleCrawlHistoryItemPress = (item: CrawlHistoryItem) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CrawlDetail',
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

  const renderCrawlItem = ({ item }: { item: CrawlHistoryItem }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}
      onPress={() => handleCrawlHistoryItemPress(item)}
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
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}> 
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {friend.avatar_url ? (
                <Image source={{ uri: friend.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.background.secondary }]}> 
                  <Text style={[styles.avatarText, { color: theme.text.secondary }]}> 
                    {friend.full_name?.charAt(0) || friend.email?.charAt(0) || 'F'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.name, { color: theme.text.primary }]}>{friend.full_name || 'Unknown User'}</Text>
          </View>

          {/* Crawl Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>{stats ? stats.totalCompleted : '-'}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Crawls</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>{stats ? stats.uniqueCompleted : '-'}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Unique</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>{stats ? stats.inProgress : '-'}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>In Progress</Text>
            </View>
          </View>

          {/* Latest 5 Crawls */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Latest Crawls</Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.button.primary} />
            ) : recentCrawls.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No recent crawls.</Text>
            ) : (
              <FlatList
                data={recentCrawls}
                keyExtractor={(item) => item.user_crawl_history_id}
                renderItem={renderCrawlItem}
                scrollEnabled={false}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  listContainer: {
    padding: 0,
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
}); 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';
import BackButton from '../../ui/common/BackButton';
import { getCrawlStats } from '../../../utils/database/statsOperations';

export default function CrawlStatsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const token = await getToken({ template: 'supabase' });
        if (!token) {
          console.log('No JWT token available for loading stats');
          setError('Authentication required to load stats');
          return;
        }

        const statsData = await getCrawlStats(user.id, token);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.button.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.errorText, { color: theme.text.secondary }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Statistics</Text>
        
        {stats ? (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{stats.totalCompleted || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Total Crawls Completed</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{stats.uniqueCompleted || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Unique Crawls Completed</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.text.primary }]}>{stats.inProgress || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Crawls In Progress</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No statistics available</Text>
          </View>
        )}
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  statsContainer: {
    gap: 20,
  },
  statCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
}); 

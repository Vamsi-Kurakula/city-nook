import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';
import BackButton from '../ui/BackButton';
import { getCrawlStats } from '../../utils/database/statsOperations';

export default function CrawlStatsScreen() {
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
          <BackButton onPress={() => {}} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Statistics</Text>
        </View>
        <View style={styles.loadingContainer}>
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
          <BackButton onPress={() => {}} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Statistics</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text.secondary }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <BackButton onPress={() => {}} />
        <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Statistics</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {stats ? (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.button.primary }]}>{stats.totalCompleted}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Total Crawls Completed</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.button.primary }]}>{stats.uniqueCompleted}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Unique Crawls Completed</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.statNumber, { color: theme.button.primary }]}>{stats.inProgress}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Crawls In Progress</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No statistics available</Text>
          </View>
        )}
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
  statsContainer: {
    gap: 20,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCrawlStats } from '../../utils/database';

const CrawlStatsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, isLoading } = useAuthContext();
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id || isLoading) return;
      
      setLoading(true);
      const statsData = await getCrawlStats(user.id);
      setStats(statsData);
      setLoading(false);
    };

    fetchStats();
  }, [user?.id, isLoading]);

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.text.secondary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.text.secondary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.button.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.text.secondary }]}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Crawl Statistics</Text>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.text.primary }]}>{stats?.totalCompleted || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Total Crawls Completed</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.text.primary }]}>{stats?.uniqueCompleted || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Unique Crawls Completed</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: 'transparent', borderColor: theme.background.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.text.primary }]}>{stats?.inProgress || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Crawls In Progress</Text>
          </View>
        </View>
      </View>
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
});

export default CrawlStatsScreen; 
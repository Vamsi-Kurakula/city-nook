import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '@clerk/clerk-expo';
import { getFriendsList } from '../../../utils/database/friendshipOperations';
import { getPendingRequests } from '../../../utils/database/friendRequestOperations';
import FriendCard from '../../ui/social/FriendCard';
import { SocialUserProfile } from '../../../types/social';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../ui/common/BackButton';

export default function FriendsListScreen() {
  const { user } = useAuthContext();
  const { getToken } = useAuth();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [friends, setFriends] = useState<SocialUserProfile[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    if (!user?.id) {
      setError('No authenticated user');
      setFriends([]);
      setPendingRequestsCount(0);
      return;
    }
    
    try {
      // Get JWT token for Supabase authentication
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
      
      // Fetch friends and pending requests in parallel
      const [friendsResult, pendingRequests] = await Promise.all([
        getFriendsList(user.id, token),
        getPendingRequests(user.id, token)
      ]);
      
      setFriends(friendsResult);
      setPendingRequestsCount(pendingRequests.length);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setFriends([]);
      setPendingRequestsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}> 
      <BackButton onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 20 }} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Friends</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.addFriendsButton, { backgroundColor: theme.button.primary }]}
            onPress={() => navigation.navigate('AddFriends')}
          >
            <Text style={[styles.addFriendsButtonText, { color: theme.text.inverse }]}>Add Friends</Text>
            {pendingRequestsCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.button.secondary }]}>
                <Text style={[styles.badgeText, { color: theme.button.primary }]}>{pendingRequestsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.button.primary} style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={[styles.errorText, { color: theme.status.error }]}>{error}</Text>
      ) : (
        <ScrollView 
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.button.primary]}
              tintColor={theme.button.primary}
            />
          }
        >
          {friends.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>You have no friends yet.</Text>
          ) : (
            friends.map(friend => (
              <FriendCard 
                key={friend.user_profile_id} 
                friend={friend} 
                onPress={() => navigation.navigate('FriendProfile', { friend })}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'relative',
  },
  addFriendsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addFriendsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
}); 

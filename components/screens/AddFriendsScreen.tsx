import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../ui/BackButton';
import { useAuthContext } from '../context/AuthContext';
import { searchUsers } from '../../utils/database/userSearchOperations';
import { sendFriendRequest } from '../../utils/database/friendRequestOperations';
import { getPendingRequests, acceptFriendRequest, rejectFriendRequest } from '../../utils/database/friendRequestOperations';
import { getUserProfilesByIds } from '../../utils/database/userOperations';
import UserSearchCard from '../ui/social/UserSearchCard';
import FriendRequestCard from '../ui/social/FriendRequestCard';
import { SocialUserProfile, FriendRequest } from '../../types/social';

export default function AddFriendsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuthContext();

  // Friend requests state
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [requestSenders, setRequestSenders] = useState<{ [id: string]: SocialUserProfile }>({});
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SocialUserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [requestSentIds, setRequestSentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch friend requests and their senders
  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoadingRequests(true);
    try {
      const requests = await getPendingRequests(user.id);
      setFriendRequests(requests);
      const senderIds = requests.map(r => r.from_user_id);
      const profiles = await getUserProfilesByIds(senderIds);
      const senderMap: { [id: string]: SocialUserProfile } = {};
      profiles.forEach((p: SocialUserProfile) => { senderMap[p.user_profile_id] = p; });
      setRequestSenders(senderMap);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const refreshRequests = async () => {
    if (!user?.id) return;
    setLoadingRequests(true);
    try {
      const requests = await getPendingRequests(user.id);
      setFriendRequests(requests);
      const senderIds = requests.map(r => r.from_user_id);
      const profiles = await getUserProfilesByIds(senderIds);
      const senderMap: { [id: string]: SocialUserProfile } = {};
      profiles.forEach((p: SocialUserProfile) => { senderMap[p.user_profile_id] = p; });
      setRequestSenders(senderMap);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingRequests(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    // Clear search results on refresh
    setSearchQuery('');
    setRequestSentIds([]);
    setError(null);
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await refreshRequests();
      Alert.alert('Success', 'Friend request accepted!');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await refreshRequests();
      Alert.alert('Success', 'Friend request rejected.');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  // Search logic
  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;
    setSearching(true);
    setError(null);
    try {
      const results = await searchUsers(searchQuery.trim(), user.id);
      setSearchResults(results);
    } catch (err) {
      setError((err as Error).message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!user?.id) return;
    try {
      await sendFriendRequest(user.id, toUserId);
      setRequestSentIds(prev => [...prev, toUserId]);
      Alert.alert('Success', 'Friend request sent!');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}> 
      <BackButton onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 20 }} />
      <ScrollView 
        style={styles.content} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.button.primary]}
            tintColor={theme.button.primary}
          />
        }
      >
        <Text style={[styles.title, { color: theme.text.primary }]}>Add Friends</Text>
        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Friend Requests</Text>
            <Text style={[styles.sectionDescription, { color: theme.text.secondary }]}>Manage incoming friend requests here.</Text>
            {loadingRequests ? (
              <ActivityIndicator size="small" color={theme.button.primary} style={{ marginTop: 16 }} />
            ) : (
              <View style={styles.requestsList}>
                {friendRequests.map(request => {
                  const sender = requestSenders[request.from_user_id];
                  if (!sender) return null;
                  return (
                    <FriendRequestCard
                      key={request.friend_request_id}
                      request={request}
                      user={sender}
                      onAccept={() => handleAcceptRequest(request.friend_request_id)}
                      onReject={() => handleRejectRequest(request.friend_request_id)}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}
        {/* Search Users Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Search Users</Text>
          <Text style={[styles.sectionDescription, { color: theme.text.secondary }]}>Find and add new friends by searching for their email or name.</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.text.primary, color: theme.background.primary, borderColor: theme.border.primary }]}
              placeholder="Enter email or name..."
              placeholderTextColor={theme.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: theme.button.primary }]}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color={theme.text.inverse} />
              ) : (
                <Text style={[styles.searchButtonText, { color: theme.text.inverse }]}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
          {error && <Text style={[styles.errorText, { color: theme.status.error }]}>{error}</Text>}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <Text style={[styles.resultsTitle, { color: theme.text.secondary }]}>Search Results ({searchResults.length})</Text>
              {searchResults.map(u => (
                <UserSearchCard
                  key={u.user_profile_id}
                  user={u}
                  onAddFriend={() => handleSendFriendRequest(u.user_profile_id)}
                  isRequestSent={u.friendship_status === 'pending_sent'}
                  isFriend={u.is_friend}
                />
              ))}
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
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchResults: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  requestsList: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
}); 
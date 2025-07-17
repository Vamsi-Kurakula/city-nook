import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SocialUserProfile } from '../../../types/social';
import { useTheme } from '../../context/ThemeContext';

interface UserSearchCardProps {
  user: SocialUserProfile;
  onAddFriend?: () => void;
  isRequestSent?: boolean;
  isFriend?: boolean;
  mutualFriendsCount?: number;
}

export default function UserSearchCard({ user, onAddFriend, isRequestSent, isFriend, mutualFriendsCount }: UserSearchCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: 'transparent', borderColor: theme.background.secondary, borderWidth:1 }]}> 
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.button.primary }]}> 
            <Text style={[styles.avatarText, { color: theme.text.inverse }]}> 
              {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
      </View>
      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
          {user.full_name || 'Unknown User'}
        </Text>
        <Text style={[styles.email, { color: theme.text.secondary }]} numberOfLines={1}>
          {user.email}
        </Text>
        {typeof mutualFriendsCount === 'number' && mutualFriendsCount > 0 && (
          <Text style={[styles.mutualFriends, { color: theme.text.tertiary }]}>
            {mutualFriendsCount} mutual friend{mutualFriendsCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      {/* Actions */}
      <View style={styles.actionsContainer}>
        {isFriend ? (
          <Text style={[styles.friendStatus, { color: theme.text.secondary }]}>Friend</Text>
        ) : isRequestSent ? (
          <Text style={[styles.requestSent, { color: theme.text.tertiary }]}>Request Sent</Text>
        ) : (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.button.primary }]}
            onPress={onAddFriend}
          >
            <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Add Friend</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
  },
  actionsContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  friendStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestSent: {
    fontSize: 12,
    fontStyle: 'italic',
  },
}); 
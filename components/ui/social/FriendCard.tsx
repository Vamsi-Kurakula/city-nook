import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SocialUserProfile } from '../../../types/social';
import { useTheme } from '../../context/ThemeContext';

interface FriendCardProps {
  friend: SocialUserProfile;
  onPress?: () => void;
  onRemoveFriend?: () => void;
  showRemoveButton?: boolean;
}

export default function FriendCard({
  friend,
  onPress,
  onRemoveFriend,
  showRemoveButton = false
}: FriendCardProps) {
  const { theme } = useTheme();

  const handleRemoveFriend = () => {
    if (onRemoveFriend) {
      onRemoveFriend();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: 'transparent', borderColor: theme.background.secondary, borderWidth:1 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {friend.avatar_url ? (
          <Image source={{ uri: friend.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.button.primary }]}>
            <Text style={[styles.avatarText, { color: theme.text.inverse }]}>
              {friend.full_name?.charAt(0) || friend.email?.charAt(0) || 'F'}
            </Text>
          </View>
        )}
      </View>

      {/* Friend Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
          {friend.full_name || 'Unknown User'}
        </Text>
        <Text style={[styles.email, { color: theme.text.secondary }]} numberOfLines={1}>
          {friend.email}
        </Text>
        {friend.mutual_friends_count !== undefined && friend.mutual_friends_count > 0 && (
          <Text style={[styles.mutualFriends, { color: theme.text.tertiary }]}>
            {friend.mutual_friends_count} mutual friend{friend.mutual_friends_count !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {showRemoveButton && (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: theme.button.danger }]}
            onPress={handleRemoveFriend}
          >
            <Text style={[styles.removeButtonText, { color: theme.text.inverse }]}>
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
    marginRight: 12
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
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FriendRequest, SocialUserProfile } from '../../../types/social';
import { useTheme } from '../../context/ThemeContext';

interface FriendRequestCardProps {
  request: FriendRequest;
  user: SocialUserProfile; // The user who sent the request
  onAccept: () => void;
  onReject: () => void;
}

export default function FriendRequestCard({ request, user, onAccept, onReject }: FriendRequestCardProps) {
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
        {request.message && (
          <Text style={[styles.message, { color: theme.text.tertiary }]} numberOfLines={2}>
            {request.message}
          </Text>
        )}
        <Text style={[styles.timestamp, { color: theme.text.tertiary }]}>
          {new Date(request.created_at).toLocaleString()}
        </Text>
      </View>
      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.button.success }]}
          onPress={onAccept}
        >
          <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.button.danger }]}
          onPress={onReject}
        >
          <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>Reject</Text>
        </TouchableOpacity>
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
  message: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsContainer: {
    marginLeft: 8,
    flexDirection: 'column',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from './AuthContext';

const UserProfile: React.FC = () => {
  const { user, userProfile, signOut, isLoading } = useAuthContext();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>{user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User'}</Text>
            <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name:</Text>
              <Text style={styles.infoValue}>{userProfile?.full_name || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userProfile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
              <Text style={styles.actionButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfile; 
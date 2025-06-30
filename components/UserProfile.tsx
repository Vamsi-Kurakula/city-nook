import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from './AuthContext';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const UserProfile: React.FC = () => {
  const { user, userProfile, signOut, isLoading, isSignedIn } = useAuthContext();
  const navigation = useNavigation<any>();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

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

  const handleSignIn = async () => {
    try {
      console.log('Starting OAuth flow...');
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        console.log('Session activated successfully');
      } else if (signUp && signUp.status === 'missing_requirements') {
        const email = signUp.emailAddress || '';
        const username = email ? email.split('@')[0] + Math.floor(Math.random() * 1000) : '';
        
        const result = await signUp.upsert({
          username,
          emailAddress: email,
        });
        
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive!({ session: result.createdSessionId });
        }
      }
    } catch (err) {
      console.error('OAuth error:', err);
      Alert.alert(
        'Sign In Error',
        `Failed to sign in: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleCrawlStats = () => {
    navigation.navigate('CrawlStats');
  };

  const handleCrawlHistory = () => {
    navigation.navigate('CrawlHistory');
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

  // Show sign-in screen if user is not authenticated
  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.signInContent}>
          <View style={styles.signInHeader}>
            <Text style={styles.title}>City Crawler</Text>
            <Text style={styles.subtitle}>Sign in to track your crawl progress and view your history</Text>
          </View>

          <View style={styles.authSection}>
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleSignIn}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
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
            <Text style={styles.sectionTitle}>Crawl Activity</Text>
            <TouchableOpacity style={styles.activityButton} onPress={handleCrawlStats}>
              <Text style={styles.activityButtonText}>📊 Crawl Statistics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activityButton} onPress={handleCrawlHistory}>
              <Text style={styles.activityButtonText}>📋 Crawl History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Sign Out Button at Bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
  bottomContainer: {
    padding: 20,
    alignItems: 'center',
  },
  signOutButton: {
    padding: 8,
  },
  signOutButtonText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '600',
  },
  activityButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  activityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginBottom: 40,
  },
  authSection: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  signInContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInHeader: {
    alignItems: 'center',
    marginBottom: 60,
  },
});

export default UserProfile; 
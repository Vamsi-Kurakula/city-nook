import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { deleteUserAccount, exportUserData } from '../../utils/database/userOperations';

const UserProfile: React.FC = () => {
  const { user, userProfile, signOut, isLoading, isSignedIn } = useAuthContext();
  const { theme, themeType, setTheme } = useTheme();
  const navigation = useNavigation<any>();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
              // AuthNavigator will automatically show the sign-in screen
              // when isSignedIn becomes false
            } catch (error) {
              console.error('Error during sign out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleSignIn = () => {
    // This should not be needed anymore since AuthNavigator handles sign-in flow
    // But keeping it as a fallback that shows an alert
    Alert.alert(
      'Sign In',
      'Please use the sign-in screen to authenticate.',
      [{ text: 'OK' }]
    );
  };

  const handleCrawlStats = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CrawlStats',
      })
    );
  };

  const handleCrawlHistory = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CrawlHistory',
      })
    );
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleExportData = async () => {
    if (!user?.id) return;
    
    try {
      const result = await exportUserData(user.id);
      if (result.success && result.data) {
        Alert.alert(
          'Data Export',
          'Your data has been prepared for export. Check your email for the download link.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive', 
          onPress: async () => {
            if (!user?.id) return;
            
            try {
              const result = await deleteUserAccount(user.id);
              if (result.success) {
                Alert.alert(
                  'Account Deleted',
                  'Your account and all associated data have been permanently deleted.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await signOut();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.content}>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.signInContent}>
          <View style={styles.signInHeader}>
            <Text style={[styles.title, { color: theme.text.primary }]}>City Crawler</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>Sign in to track your crawl progress and view your history</Text>
          </View>

          <View style={styles.authSection}>
            <TouchableOpacity 
              style={[styles.googleButton, { backgroundColor: theme.button.primary }]} 
              onPress={() => {
                // Navigate back to trigger AuthNavigator to show sign-in screen
                navigation.goBack();
              }}
            >
              <Text style={[styles.googleButtonText, { color: theme.text.inverse }]}>Go to Sign In</Text>
            </TouchableOpacity>

            <Text style={[styles.termsText, { color: theme.text.tertiary }]}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.background.secondary }]}>
                  <Text style={[styles.avatarText, { color: theme.text.secondary }]}>
                    {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.name, { color: theme.text.primary }]}>{user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}</Text>
            <Text style={[styles.email, { color: theme.text.secondary }]}>{user?.emailAddresses?.[0]?.emailAddress}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Profile Information</Text>
            <View style={[styles.infoRow, { borderBottomColor: theme.background.secondary }]}>
              <Text style={[styles.infoLabel, { color: theme.text.secondary }]}>Full Name:</Text>
              <Text style={[styles.infoValue, { color: theme.text.primary }]}>{userProfile?.full_name || 'Not set'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: theme.background.secondary }]}>
              <Text style={[styles.infoLabel, { color: theme.text.secondary }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: theme.text.primary }]}>{userProfile?.email}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: theme.background.secondary }]}>
              <Text style={[styles.infoLabel, { color: theme.text.secondary }]}>Member Since:</Text>
              <Text style={[styles.infoValue, { color: theme.text.primary }]}>
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Crawl Activity</Text>
            <TouchableOpacity style={[styles.activityButton, { backgroundColor: theme.background.secondary, borderColor: theme.background.tertiary }]} onPress={handleCrawlStats}>
              <Text style={[styles.activityButtonText, { color: theme.text.primary }]}>📊 Crawl Statistics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.activityButton, { backgroundColor: theme.background.secondary, borderColor: theme.background.tertiary }]} onPress={handleCrawlHistory}>
              <Text style={[styles.activityButtonText, { color: theme.text.primary }]}>📋 Crawl History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Appearance</Text>
            <View style={styles.themeSection}>
              <Text style={[styles.themeLabel, { color: theme.text.secondary }]}>Theme</Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity 
                  style={[
                    styles.themeButton, 
                    { backgroundColor: themeType === 'light' ? theme.button.primary : theme.background.secondary },
                    { borderColor: theme.border.primary }
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Text style={[
                    styles.themeButtonText, 
                    { color: themeType === 'light' ? theme.text.inverse : theme.text.primary }
                  ]}>
                    Light
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.themeButton, 
                    { backgroundColor: themeType === 'dark' ? theme.button.primary : theme.background.secondary },
                    { borderColor: theme.border.primary }
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Text style={[
                    styles.themeButtonText, 
                    { color: themeType === 'dark' ? theme.text.inverse : theme.text.primary }
                  ]}>
                    Dark
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Account Details</Text>
            <TouchableOpacity style={[styles.accountButton, { backgroundColor: theme.background.secondary, borderColor: theme.background.tertiary }]} onPress={handleExportData}>
              <Text style={[styles.accountButtonText, { color: theme.text.primary }]}>📤 Export My Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.accountButton, { backgroundColor: theme.button.danger }]} onPress={handleDeleteAccount}>
              <Text style={[styles.accountButtonText, { color: theme.text.inverse }]}>🗑️ Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Sign Out Button at Bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={[styles.signOutButtonText, { color: theme.button.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          View our
          <Text style={{ color: theme.button.primary }} onPress={() => navigation.navigate('PrivacyPolicy')}> Privacy Policy</Text>
          {' '}and
          <Text style={{ color: theme.button.primary }} onPress={() => navigation.navigate('TermsOfService')}> Terms of Service</Text>.
        </Text>
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
  profileHeader: {
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
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
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
  accountButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  accountButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  themeSection: {
    marginBottom: 16,
  },
  themeLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserProfile; 
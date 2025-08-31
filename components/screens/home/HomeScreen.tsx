import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useTheme, createButtonStyles, createTextStyles, spacing } from '../../context';

export default function HomeScreen() {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();
  const { theme } = useTheme();
  
  const buttonStyles = createButtonStyles(theme);
  const textStyles = createTextStyles(theme);

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.content}>
          <Text style={[textStyles.subtitle, { color: theme.text.secondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[textStyles.title, { fontSize: 32, marginBottom: spacing.sm }]}>
            Welcome back!
          </Text>
          <Text style={[textStyles.subtitle, { color: theme.text.secondary }]}>
            {user?.emailAddresses?.[0]?.emailAddress || 'User'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[textStyles.subtitle, { fontSize: 18, marginBottom: spacing.md }]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.button.primary }]}
              activeOpacity={0.8}
            >
              <Text style={[textStyles.button, { color: theme.text.inverse }]}>
                Start New Crawl
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.button.secondary }]}
              activeOpacity={0.8}
            >
              <Text style={[textStyles.button, { color: theme.text.inverse }]}>
                View My Crawls
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.button.tertiary }]}
              activeOpacity={0.8}
            >
              <Text style={[textStyles.button, { color: theme.text.inverse }]}>
                Explore Cities
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[textStyles.subtitle, { fontSize: 18, marginBottom: spacing.md }]}>
            Recent Activity
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.background.secondary }]}>
            <Text style={[textStyles.subtitle, { color: theme.text.primary, marginBottom: spacing.sm }]}>
              No recent crawls yet
            </Text>
            <Text style={[textStyles.subtitle, { color: theme.text.tertiary, fontSize: 14 }]}>
              Start your first crawl to see your activity here
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.signOutButton, { borderColor: theme.button.danger }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={[textStyles.button, { color: theme.button.danger }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  signOutButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
});

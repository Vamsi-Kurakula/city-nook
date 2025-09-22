import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, createButtonStyles, createTextStyles, spacing } from '../../context';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<AuthorizedStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();
  const { theme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
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

  const handleGoBack = () => {
    navigation.goBack();
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
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={[textStyles.button, { color: theme.text.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[textStyles.title, { color: theme.text.primary }]}>
            Profile
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Content */}
        <View style={styles.profileContent}>
          <Text style={[textStyles.subtitle, { color: theme.text.secondary, marginBottom: spacing.lg }]}>
            Profile page coming soon...
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.background.secondary }]}>
            <Text style={[textStyles.subtitle, { color: theme.text.primary, marginBottom: spacing.sm }]}>
              User Information
            </Text>
            <Text style={[textStyles.body, { color: theme.text.secondary, marginBottom: spacing.xs }]}>
              Email: {user?.emailAddresses?.[0]?.emailAddress || 'Not available'}
            </Text>
            <Text style={[textStyles.body, { color: theme.text.secondary }]}>
              Name: {user?.fullName || 'Not available'}
            </Text>
          </View>

          {/* Sign Out Button */}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  backButton: {
    padding: spacing.sm,
  },
  placeholder: {
    width: 60, // Same width as back button to center the title
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: spacing.xl,
    width: '100%',
  },
  signOutButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
});

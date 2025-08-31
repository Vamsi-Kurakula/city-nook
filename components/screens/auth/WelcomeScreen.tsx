import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useTheme, createButtonStyles, createTextStyles, spacing } from '../../context';

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  
  const buttonStyles = createButtonStyles(theme);
  const textStyles = createTextStyles(theme);

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    
    setLoading(true);
    try {
      const result = await signIn.create({
        strategy: 'oauth_google',
        redirectUrl: 'crawls://oauth-callback',
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Navigation will be handled by the auth state change
      } else {
        Alert.alert('Error', 'Google sign in failed. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.special.gradient.end }]}>
        <View style={styles.content}>
          <Text style={[textStyles.subtitle, { color: theme.text.secondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.special.gradient.end }]}>
      <View style={styles.content}>
        <Text style={[textStyles.title, { fontSize: 48, marginBottom: spacing.md }]}>
          Crawls
        </Text>
        <Text style={[textStyles.subtitle, { marginBottom: spacing.xxl }]}>
          Discover your city, one stop at a time
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[buttonStyles.primary, loading && { opacity: 0.6 }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={textStyles.button}>
              {loading ? 'Signing In...' : 'Sign In with Google'}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
});

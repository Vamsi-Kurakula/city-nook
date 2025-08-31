import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import { useTheme, createButtonStyles, createTextStyles, spacing } from '../../context';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { isSignedIn } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const buttonStyles = createButtonStyles(theme);
  const textStyles = createTextStyles(theme);

  const handleSignInWithGoogle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('Starting OAuth flow...');
      
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      console.log('OAuth flow result:', { 
        createdSessionId: !!createdSessionId, 
        hasSignIn: !!signIn, 
        hasSignUp: !!signUp,
        signUpStatus: signUp?.status,
        signInStatus: signIn?.status
      });

      if (createdSessionId) {
        console.log('Session created, setting active...');
        await setActive!({ session: createdSessionId });
        console.log('Session activated successfully');
        // AuthNavigator will handle navigation automatically
      } else {
        console.log('No session created, checking signIn/signUp...');
        
        // Prioritize signUp if both are present
        if (signUp && signUp.status === 'missing_requirements') {
          console.log('Sign up required with missing requirements');
          try {
            const email = signUp.emailAddress;
            const firstName = signUp.firstName || '';
            const lastName = signUp.lastName || '';
            
            if (!email) {
              throw new Error('Email is required for sign up');
            }
            
            // Generate a username from email
            const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
            
            console.log('Completing sign up with:', { email, firstName, lastName, username });
            
            const result = await signUp.upsert({
              username,
              emailAddress: email,
            });
            
            console.log('Sign up result:', result);
            
            if (result.status === 'complete' && result.createdSessionId) {
              await setActive!({ session: result.createdSessionId });
              console.log('Sign up completed and session activated');
            } else if (result.status === 'missing_requirements') {
              console.log('Still missing requirements:', result.missingFields);
              Alert.alert('Sign Up Error', 'Please complete all required fields');
            }
          } catch (signUpError) {
            console.error('Sign up error:', signUpError);
            Alert.alert('Sign Up Error', 'Failed to complete sign up');
          }
        } else if (signIn) {
          console.log('Sign in required - this should not happen with OAuth');
          Alert.alert('Sign In Error', 'Unexpected sign in requirement');
        } else {
          console.log('Neither signIn nor signUp available');
          Alert.alert('Authentication Error', 'Unable to complete authentication');
        }
      }
    } catch (err) {
      console.error('OAuth error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      Alert.alert(
        'Sign In Error',
        `Failed to sign in: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.content}>
          <Text style={[textStyles.title, { fontSize: 48, marginBottom: spacing.md }]}>
            Crawls
          </Text>
          <Text style={[textStyles.subtitle, { marginBottom: spacing.xxl }]}>
            Welcome back! You're already signed in.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.content}>
        <Text style={[textStyles.title, { fontSize: 48, marginBottom: spacing.md }]}>
          Crawls
        </Text>
        <Text style={[textStyles.subtitle, { marginBottom: spacing.xxl }]}>
          Discover your city, one stop at a time
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[buttonStyles.primary, isLoading && { opacity: 0.6 }]}
            onPress={handleSignInWithGoogle}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={textStyles.button}>
              {isLoading ? 'Signing In...' : 'Sign In with Google'}
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

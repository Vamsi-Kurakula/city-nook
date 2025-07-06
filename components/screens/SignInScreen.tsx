import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import { useAuthContext } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { isSignedIn } = useAuth();
  const { signOut } = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleContinueWithCurrentAccount = async () => {
    try {
      if (isSignedIn) {
        // User is already signed in, AuthNavigator will handle navigation
        console.log('User is signed in, continuing...');
      } else {
        // This shouldn't happen if we're on the sign-in screen
        console.log('User not signed in');
      }
    } catch (error) {
      console.error('Error continuing with current account:', error);
    }
  };

  const handleSignInWithGoogle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('Starting OAuth flow...');
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      console.log('OAuth flow result:', { createdSessionId, signIn, signUp });

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
      Alert.alert(
        'Sign In Error',
        `Failed to sign in: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Stay on sign-in screen after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>City Crawler</Text>
          <Text style={styles.subtitle}>Discover your city, one crawl at a time</Text>
        </View>

        {/* Sign In Options */}
        <View style={styles.signInOptions}>
          {isSignedIn ? (
            <>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContinueWithCurrentAccount}
              >
                <Text style={styles.primaryButtonText}>Continue with Current Account</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSignOut}
              >
                <Text style={styles.secondaryButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </>
                    ) : (
            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
              onPress={handleSignInWithGoogle}
              disabled={isLoading}
            >
              <View style={styles.googleButtonContent}>
                <Text style={styles.googleButtonText}>
                  {isLoading ? 'Signing in...' : 'Sign in with Google'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  signInOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 280,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 280,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    minWidth: 280,
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
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
}); 
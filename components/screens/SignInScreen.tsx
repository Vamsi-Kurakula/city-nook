import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SignInScreen: React.FC = () => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [isLoading, setIsLoading] = useState(false);

  const onPress = React.useCallback(async () => {
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
      } else {
        console.log('No session created, checking signIn/signUp...');
        
        // Prioritize signUp if both are present (which is the case here)
        if (signUp && signUp.status === 'missing_requirements') {
          console.log('Sign up required with missing requirements');
          // Complete the sign up with required fields
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
            
            // Try using upsert instead of create for OAuth flows
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
  }, [isLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>City Crawler</Text>
          <Text style={styles.subtitle}>Discover your city through interactive adventures</Text>
        </View>

        <View style={styles.authSection}>
          <TouchableOpacity 
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]} 
            onPress={onPress}
            disabled={isLoading}
          >
            <Text style={styles.googleButtonText}>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
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
  googleButtonDisabled: {
    backgroundColor: '#ccc',
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
});

export default SignInScreen; 
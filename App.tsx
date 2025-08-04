import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthNavigator } from './components/navigation';
import { ClerkProvider, tokenCache } from './utils/clerk';
import { CLERK_PUBLISHABLE_KEY_CONFIG as CLERK_PUBLISHABLE_KEY } from './utils/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './components/context/AuthContext';
import { CrawlProvider } from './components/context/CrawlContext';
import { ThemeProvider } from './components/context/ThemeContext';
import { StatusBar, GradientBackground } from './components/ui/common';
import ErrorBoundary from './components/error/ErrorBoundary';
import { checkEnvironmentConfiguration } from './utils/checkEnvironment';
import { testSupabaseConnection } from './utils/networkTest';

const AppContent = memo(() => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <CrawlProvider>
            <ThemeProvider>
              <StatusBar />
              <GradientBackground>
                <AuthNavigator />
              </GradientBackground>
            </ThemeProvider>
          </CrawlProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});

AppContent.displayName = 'AppContent';

export default function App() {
  // Check environment configuration on app startup
  useEffect(() => {
    checkEnvironmentConfiguration();
    
    // Test network connectivity to Supabase Storage
    testSupabaseConnection();
  }, []);

  // Check if we have a valid Clerk key before rendering
  if (!CLERK_PUBLISHABLE_KEY || !CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
    console.error('❌ Invalid or missing Clerk publishable key:', CLERK_PUBLISHABLE_KEY);
    return (
      <ErrorBoundary>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Configuration Error</Text>
          <Text style={styles.errorText}>Missing or invalid Clerk publishable key. Please check your environment variables.</Text>
          <Text style={styles.errorKey}>Key: {CLERK_PUBLISHABLE_KEY || 'undefined'}</Text>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <AppContent />
      </ClerkProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4757',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorKey: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
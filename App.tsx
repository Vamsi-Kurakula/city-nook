import React from 'react';
import { AuthNavigator } from './components/navigation';
import { ClerkProvider, tokenCache } from './utils/clerk';
import { CLERK_PUBLISHABLE_KEY_CONFIG as CLERK_PUBLISHABLE_KEY } from './utils/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './components/context/AuthContext';
import { CrawlProvider } from './components/context/CrawlContext';
import { ThemeProvider } from './components/context/ThemeContext';
import StatusBar from './components/ui/StatusBar';
import ErrorBoundary from './components/error/ErrorBoundary';

// Simple test component to debug environment variables
const DebugInfo = () => {
  console.log('App starting...');
  console.log('CLERK_PUBLISHABLE_KEY length:', CLERK_PUBLISHABLE_KEY?.length || 0);
  console.log('Environment check complete');
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <DebugInfo />
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <CrawlProvider>
                <ThemeProvider>
                  <StatusBar />
                  <AuthNavigator />
                </ThemeProvider>
              </CrawlProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
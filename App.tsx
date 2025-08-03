import React, { useEffect } from 'react';
import { AuthNavigator } from './components/navigation';
import { ClerkProvider, tokenCache } from './utils/clerk';
import { CLERK_PUBLISHABLE_KEY_CONFIG as CLERK_PUBLISHABLE_KEY } from './utils/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './components/context/AuthContext';
import { CrawlProvider } from './components/context/CrawlContext';
import { ThemeProvider } from './components/context/ThemeContext';
import { StatusBar } from './components/ui/common';
import ErrorBoundary from './components/error/ErrorBoundary';
import { checkEnvironmentConfiguration } from './utils/checkEnvironment';

// Debug function that can be called from console
const debugDatabaseAccess = async () => {
  try {
    const { debugDatabaseAccess } = await import('./utils/database/debugOperations');
    const { useAuth } = await import('@clerk/clerk-expo');
    
    // This is a simplified version - in practice you'd need to get the token from auth context
    console.log('🔧 To debug database access, call: debugDatabaseAccess(token)');
    console.log('🔧 You can also test specific tables with: testTableAccess("table_name", token)');
  } catch (error) {
    console.error('❌ Debug setup failed:', error);
  }
};

// Make debug function available globally for testing
if (typeof global !== 'undefined') {
  (global as any).debugDatabaseAccess = debugDatabaseAccess;
}

export default function App() {
  // Check environment configuration on app startup
  useEffect(() => {
    checkEnvironmentConfiguration();
    
    // Add debug info to console
    console.log('🔧 Debug commands available:');
    console.log('🔧 debugDatabaseAccess() - Test database access');
    console.log('🔧 Check the console for detailed database access logs');
  }, []);

  // Check if we have a valid Clerk key before rendering
  if (!CLERK_PUBLISHABLE_KEY || !CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
    console.error('❌ Invalid or missing Clerk publishable key:', CLERK_PUBLISHABLE_KEY);
    return (
      <ErrorBoundary>
        <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <h2>Configuration Error</h2>
          <p>Missing or invalid Clerk publishable key. Please check your environment variables.</p>
          <p>Key: {CLERK_PUBLISHABLE_KEY || 'undefined'}</p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
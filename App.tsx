import React from 'react';
import AppNavigator from './AppNavigator';
import { ClerkProvider, tokenCache, CLERK_PUBLISHABLE_KEY } from './utils/clerk';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './components/AuthContext';
import { CrawlProvider } from './components/CrawlContext';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <CrawlProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </CrawlProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
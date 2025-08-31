import React from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import UnauthorizedNavigator from './components/navigation/UnauthorizedNavigator';
import { ENV, validateEnvironment } from './config/environment';
import { ThemeProvider } from './components/context';

// Validate environment variables on app start
validateEnvironment();

export default function App() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={ENV.CLERK_PUBLISHABLE_KEY}>
        <NavigationContainer>
          <SignedOut>
            <UnauthorizedNavigator />
          </SignedOut>
          <SignedIn>
            {/* TODO: Add AuthorizedNavigator here */}
            <UnauthorizedNavigator />
          </SignedIn>
        </NavigationContainer>
      </ClerkProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import UnauthorizedNavigator from './components/navigation/UnauthorizedNavigator';
import AuthorizedNavigator from './components/navigation/AuthorizedNavigator';
import { ENV, validateEnvironment } from './config/environment';
import { ThemeProvider } from './components/context';
import GradientBackground from './components/ui/GradientBackground';

// Validate environment variables on app start
validateEnvironment();

export default function App() {
  return (
    <ThemeProvider>
      <GradientBackground>
        <ClerkProvider publishableKey={ENV.CLERK_PUBLISHABLE_KEY}>
          <NavigationContainer>
            <SignedOut>
              <UnauthorizedNavigator />
            </SignedOut>
            <SignedIn>
              <AuthorizedNavigator />
            </SignedIn>
          </NavigationContainer>
        </ClerkProvider>
      </GradientBackground>
    </ThemeProvider>
  );
}

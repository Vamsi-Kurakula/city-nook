import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthContext } from '../context/AuthContext';
import { SignInScreen } from '../screens/auth';
import { PrivacyPolicyScreen, TermsOfServiceScreen } from '../screens/legal';
import { AppNavigator } from './index';
import { LoadingScreen } from '../ui/common';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const { isSignedIn, isLoading } = useAuthContext();
  const [error, setError] = useState<string | undefined>(undefined);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setError('Loading is taking longer than expected. Please check your internet connection.');
      }, 10000); // 10 second timeout
      
      setTimeoutId(timeout);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setError(undefined);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." error={error} />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          background: 'transparent',
          primary: 'transparent',
          card: 'transparent',
          text: 'transparent',
          border: 'transparent',
          notification: 'transparent',
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          cardOverlayEnabled: false,
          gestureEnabled: false,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 0,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 0,
              },
            },
          },
        }}
      >
        {!isSignedIn ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          </>
        ) : (
          <Stack.Screen name="MainApp" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 
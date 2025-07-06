import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthContext } from '../context/AuthContext';
import SignInScreen from '../screens/SignInScreen';
import { AppNavigator } from './index';
import LoadingScreen from '../ui/LoadingScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const { isSignedIn, isLoading } = useAuthContext();

  // Show loading screen while checking auth status
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isSignedIn ? (
          <Stack.Screen name="SignIn" component={SignInScreen} />
        ) : (
          <Stack.Screen name="MainApp" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 
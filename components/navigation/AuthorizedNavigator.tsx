import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile';
import { useTheme } from '../context';

export type AuthorizedStackParamList = {
  Home: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<AuthorizedStackParamList>();

export default function AuthorizedNavigator() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
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
        cardStyleInterpolator: () => ({}),
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
}

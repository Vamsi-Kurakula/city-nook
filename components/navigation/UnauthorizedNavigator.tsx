import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import { useTheme } from '../context';

export type UnauthorizedStackParamList = {
  Welcome: undefined;
};

const Stack = createStackNavigator<UnauthorizedStackParamList>();

export default function UnauthorizedNavigator() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.special.gradient.end },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}

import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile';
import { CrawlDetailScreen } from '../screens/crawl';
import { CrawlLibraryScreen } from '../screens/library';
import { useTheme } from '../context';
import { CrawlDefinition } from '../../types/crawl';

export type AuthorizedStackParamList = {
  Home: undefined;
  Profile: undefined;
  CrawlDetail: { crawl: CrawlDefinition };
  CrawlLibrary: undefined;
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
      <Stack.Screen 
        name="CrawlDetail" 
        component={CrawlDetailScreen}
      />
      <Stack.Screen 
        name="CrawlLibrary" 
        component={CrawlLibraryScreen}
      />
    </Stack.Navigator>
  );
}

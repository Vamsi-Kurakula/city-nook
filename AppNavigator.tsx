import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './components/screens/HomeScreen';
import PublicCrawls from './components/screens/PublicCrawls';
import CrawlLibrary from './components/screens/CrawlLibrary';
import UserProfile from './components/screens/UserProfile';
import CrawlDetailScreen from './components/screens/CrawlDetailScreen';
import CrawlSessionScreen from './components/screens/CrawlSessionScreen';
import PublicCrawlDetailScreen from './components/screens/PublicCrawlDetailScreen';
import CrawlStatsScreen from './components/screens/CrawlStatsScreen';
import CrawlHistoryScreen from './components/screens/CrawlHistoryScreen';
import CrawlHistoryDetailScreen from './components/screens/CrawlHistoryDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  console.log('AppNavigator rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CrawlLibrary" component={CrawlLibrary} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="CrawlDetail" component={CrawlDetailScreen} />
      <Stack.Screen name="PublicCrawlDetail" component={PublicCrawlDetailScreen} />
      <Stack.Screen name="CrawlSession" component={CrawlSessionScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="PublicCrawlSession" component={CrawlSessionScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="PublicCrawls" component={PublicCrawls} />
      <Stack.Screen name="CrawlStats" component={CrawlStatsScreen} />
      <Stack.Screen name="CrawlHistory" component={CrawlHistoryScreen} />
      <Stack.Screen name="CrawlHistoryDetail" component={CrawlHistoryDetailScreen} />
    </Stack.Navigator>
  );
} 
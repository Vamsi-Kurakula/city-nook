import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import PublicCrawls from '../screens/PublicCrawls';
import CrawlLibrary from '../screens/CrawlLibrary';
import UserProfile from '../screens/UserProfile';
import CrawlDetailScreen from '../screens/CrawlDetailScreen';
import CrawlSessionScreen from '../screens/CrawlSessionScreen';
import PublicCrawlDetailScreen from '../screens/PublicCrawlDetailScreen';
import CrawlStatsScreen from '../screens/CrawlStatsScreen';
import CrawlHistoryScreen from '../screens/CrawlHistoryScreen';
import CrawlHistoryDetailScreen from '../screens/CrawlHistoryDetailScreen';
import CrawlLibraryFilters from '../screens/CrawlLibraryFilters';

const Stack = createStackNavigator();

export default function AppNavigator() {

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
      <Stack.Screen name="CrawlLibraryFilters" component={CrawlLibraryFilters} />
    </Stack.Navigator>
  );
} 
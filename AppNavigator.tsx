import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './components/screens/HomeScreen';
import PublicCrawls from './components/screens/PublicCrawls';
import CrawlLibrary from './components/screens/CrawlLibrary';
import UserProfile from './components/screens/UserProfile';
import { Ionicons } from '@expo/vector-icons';
import CrawlDetailScreen from './components/screens/CrawlDetailScreen';
import CrawlSessionScreen from './components/screens/CrawlSessionScreen';
import PublicCrawlDetailScreen from './components/screens/PublicCrawlDetailScreen';
import CrawlStatsScreen from './components/screens/CrawlStatsScreen';
import CrawlHistoryScreen from './components/screens/CrawlHistoryScreen';
import CrawlHistoryDetailScreen from './components/screens/CrawlHistoryDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
  
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Crawl Library') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }
  
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Crawl Library" component={CrawlLibrary} />
        <Tab.Screen name="Profile" component={UserProfile} />
      </Tab.Navigator>
    );
  }

export default function AppNavigator() {
  console.log('AppNavigator rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
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
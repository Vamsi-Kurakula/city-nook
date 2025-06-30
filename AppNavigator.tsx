import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PublicCrawls from './components/PublicCrawls';
import CrawlLibrary from './components/CrawlLibrary';
import UserProfile from './components/UserProfile';
import { Ionicons } from '@expo/vector-icons';
import CrawlDetailScreen from './components/CrawlDetailScreen';

// We'll add these screens in later steps
// import CrawlDetailScreen from './components/CrawlDetailScreen';
// import CrawlSessionScreen from './components/CrawlSessionScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
  
            if (route.name === 'Public Crawls') {
              iconName = focused ? 'earth' : 'earth-outline';
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
        <Tab.Screen name="Public Crawls" component={PublicCrawls} />
        <Tab.Screen name="Crawl Library" component={CrawlLibrary} />
        <Tab.Screen name="Profile" component={UserProfile} />
      </Tab.Navigator>
    );
  }

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="CrawlDetail" component={CrawlDetailScreen} />
      {/* We'll add CrawlSession screens here in later steps */}
    </Stack.Navigator>
  );
} 
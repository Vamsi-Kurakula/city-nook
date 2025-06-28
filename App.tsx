import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import CrawlLibrary from './components/CrawlLibrary';
import CurrentCrawl from './components/CurrentCrawl';
import UserProfile from './components/UserProfile';
import PublicCrawls from './components/PublicCrawls';
import { CrawlProvider } from './components/CrawlContext';
import { RootTabParamList } from './types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CrawlProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: keyof typeof Ionicons.glyphMap;

                  if (route.name === 'Crawls') {
                    iconName = focused ? 'list' : 'list-outline';
                  } else if (route.name === 'Current Crawl') {
                    iconName = focused ? 'play-circle' : 'play-circle-outline';
                  } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                  } else if (route.name === 'PublicCrawls') {
                    iconName = focused ? 'earth' : 'earth-outline';
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
              <Tab.Screen 
                name="PublicCrawls" 
                component={PublicCrawls}
                options={{ title: 'Public Crawls' }}
              />
              <Tab.Screen
                name="Crawls"
                component={CrawlLibrary}
                options={{ title: 'Crawl Library' }}
              />
              <Tab.Screen
                name="Current Crawl"
                component={CurrentCrawl}
                options={{ title: 'Current Crawl' }}
              />
              <Tab.Screen
                name="Profile"
                component={UserProfile}
                options={{ title: 'Profile' }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </CrawlProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ClerkProvider, tokenCache, CLERK_PUBLISHABLE_KEY } from './utils/clerk';

import CrawlLibrary from './components/CrawlLibrary';
import CurrentCrawl from './components/CurrentCrawl';
import UserProfile from './components/UserProfile';
import PublicCrawls from './components/PublicCrawls';
import SignInScreen from './components/SignInScreen';
import { CrawlProvider } from './components/CrawlContext';
import { AuthProvider, useAuthContext } from './components/AuthContext';
import { RootTabParamList } from './types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppContent: React.FC = () => {
  const { isSignedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (!isSignedIn) {
    return <SignInScreen />;
  }

  return (
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
  );
};

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <CrawlProvider>
              <AppContent />
            </CrawlProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

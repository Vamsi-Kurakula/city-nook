import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import { 
  CrawlLibrary, 
  CrawlDetailScreen, 
  CrawlSessionScreen, 
  CrawlMapScreen, 
  CrawlStatsScreen, 
  CrawlHistoryScreen, 
  CrawlHistoryDetailScreen, 
  CrawlLibraryFilters, 
  CrawlCompletionScreen,

  CrawlRecsScreen,
  CrawlStartStopScreen
} from '../screens/crawl';
import { 
  UserProfile, 
  FriendsListScreen, 
  AddFriendsScreen, 
  FriendProfileScreen 
} from '../screens/social';
import { 
  PrivacyPolicyScreen, 
  TermsOfServiceScreen 
} from '../screens/legal';

const Stack = createStackNavigator();

export default function AppNavigator() {

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: false,
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
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CrawlLibrary" component={CrawlLibrary} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="CrawlDetail" component={CrawlDetailScreen} />
      <Stack.Screen name="CrawlSession" component={CrawlSessionScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen 
        name="CrawlMap" 
        component={CrawlMapScreen} 
        options={{ 
          headerShown: false, 
          presentation: 'modal',
          unmountOnBlur: true,
          cardStyle: { backgroundColor: '#000000' },
          cardOverlayEnabled: false,
        }} 
      />
      <Stack.Screen name="CrawlStats" component={CrawlStatsScreen} />
      <Stack.Screen name="CrawlHistory" component={CrawlHistoryScreen} />
      <Stack.Screen name="CrawlHistoryDetail" component={CrawlHistoryDetailScreen} />
      <Stack.Screen name="CrawlLibraryFilters" component={CrawlLibraryFilters} />
      <Stack.Screen name="CrawlCompletion" component={CrawlCompletionScreen} />

      <Stack.Screen name="CrawlRecs" component={CrawlRecsScreen} />
      <Stack.Screen name="CrawlStartStop" component={CrawlStartStopScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="FriendsList" component={FriendsListScreen} options={{ title: 'Friends' }} />
      <Stack.Screen name="AddFriends" component={AddFriendsScreen} options={{ title: 'Add Friends' }} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ title: 'Friend Profile' }} />
    </Stack.Navigator>
  );
} 
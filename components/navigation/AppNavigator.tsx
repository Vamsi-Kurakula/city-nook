import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import CrawlLibrary from '../screens/CrawlLibrary';
import UserProfile from '../screens/UserProfile';
import CrawlDetailScreen from '../screens/CrawlDetailScreen';
import CrawlSessionScreen from '../screens/CrawlSessionScreen';
import CrawlMapScreen from '../screens/CrawlMapScreen';
import CrawlStatsScreen from '../screens/CrawlStatsScreen';
import CrawlHistoryScreen from '../screens/CrawlHistoryScreen';
import CrawlHistoryDetailScreen from '../screens/CrawlHistoryDetailScreen';
import CrawlLibraryFilters from '../screens/CrawlLibraryFilters';
import CrawlCompletionScreen from '../screens/CrawlCompletionScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import SocialTestScreen from '../screens/SocialTestScreen';
import FriendsListScreen from '../screens/FriendsListScreen';
import AddFriendsScreen from '../screens/AddFriendsScreen';
import FriendProfileScreen from '../screens/FriendProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CrawlLibrary" component={CrawlLibrary} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="CrawlDetail" component={CrawlDetailScreen} />
      <Stack.Screen name="CrawlSession" component={CrawlSessionScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="CrawlMap" component={CrawlMapScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="CrawlStats" component={CrawlStatsScreen} />
      <Stack.Screen name="CrawlHistory" component={CrawlHistoryScreen} />
      <Stack.Screen name="CrawlHistoryDetail" component={CrawlHistoryDetailScreen} />
      <Stack.Screen name="CrawlLibraryFilters" component={CrawlLibraryFilters} />
      <Stack.Screen name="CrawlCompletion" component={CrawlCompletionScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="SocialTest" component={SocialTestScreen} options={{ title: 'Test Social Features' }} />
      <Stack.Screen name="FriendsList" component={FriendsListScreen} options={{ title: 'Friends' }} />
      <Stack.Screen name="AddFriends" component={AddFriendsScreen} options={{ title: 'Add Friends' }} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ title: 'Friend Profile' }} />
    </Stack.Navigator>
  );
} 
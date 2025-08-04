# 👥 Social UI Components

## **Overview**

The `social/` directory contains UI components specifically designed for social features and user interactions. These components handle friend management, user profiles, and social networking functionality throughout the application.

## **Files**

### **FriendCard.tsx**
**Purpose**: Displays friend information in a card format with social interaction options

**Key Features**:
- Friend profile display with avatar
- Friend status and activity indicators
- Quick action buttons (message, view profile)
- Friend statistics and achievements

**Props Interface**:
```typescript
interface FriendCardProps {
  friend: Friend;
  onPress?: (friend: Friend) => void;
  onMessagePress?: (friend: Friend) => void;
  onProfilePress?: (friend: Friend) => void;
  showStats?: boolean;
  showActivity?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

**API Integration**:
- **Supabase**: Friend data and profile information
- **Image Loading**: Profile avatar display
- **Real-time Updates**: Friend activity and status
- **Social Actions**: Messaging and profile viewing

**Usage Example**:
```typescript
<FriendCard 
  friend={friendData} 
  onPress={handleFriendPress} 
  onMessagePress={handleMessagePress} 
  onProfilePress={handleProfilePress} 
  showStats={true} 
  showActivity={true} 
/>
```

### **FriendRequestCard.tsx**
**Purpose**: Displays friend requests with accept/decline functionality

**Key Features**:
- Request sender information display
- Accept and decline action buttons
- Request timestamp and context
- Mutual friends display

**Props Interface**:
```typescript
interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (request: FriendRequest) => Promise<void>;
  onDecline?: (request: FriendRequest) => Promise<void>;
  onProfilePress?: (request: FriendRequest) => void;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

**API Integration**:
- **Supabase**: Friend request data and management
- **Real-time Updates**: Request status changes
- **User Actions**: Accept/decline friend requests
- **Profile Integration**: Link to user profiles

**Usage Example**:
```typescript
<FriendRequestCard 
  request={friendRequest} 
  onAccept={handleAcceptRequest} 
  onDecline={handleDeclineRequest} 
  onProfilePress={handleProfilePress} 
  isLoading={isProcessing} 
/>
```

### **UserSearchCard.tsx**
**Purpose**: Displays user search results with add friend functionality

**Key Features**:
- User profile preview
- Add friend button with status
- Mutual friends indicator
- User activity and achievements

**Props Interface**:
```typescript
interface UserSearchCardProps {
  user: User;
  onPress?: (user: User) => void;
  onAddFriend?: (user: User) => Promise<void>;
  onProfilePress?: (user: User) => void;
  friendshipStatus?: 'none' | 'pending' | 'friends' | 'requested';
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

**API Integration**:
- **Supabase**: User search and profile data
- **Friendship Status**: Current friendship state
- **Friend Actions**: Send friend requests
- **Profile Integration**: Link to user profiles

**Usage Example**:
```typescript
<UserSearchCard 
  user={searchResult} 
  onPress={handleUserPress} 
  onAddFriend={handleAddFriend} 
  onProfilePress={handleProfilePress} 
  friendshipStatus={friendshipStatus} 
  isLoading={isAddingFriend} 
/>
```

## **Component Architecture**

### **Data Flow**
```
User Data (Supabase)
      ↓
Social Components
      ↓
Friend Management
      ↓
User Interactions
      ↓
API Updates
      ↓
Real-time Sync
```

### **Friendship Flow**
```
Friend Request
      ↓
FriendRequestCard
      ↓
Accept/Decline
      ↓
Status Update
      ↓
FriendCard Display
```

## **API Integration Details**

### **Supabase Integration**
```typescript
// Friend data fetching
const { data: friends, error } = await supabase
  .from('friendships')
  .select(`
    *,
    friend:users!friendships_friend_id_fkey(*)
  `)
  .eq('user_id', currentUserId)
  .eq('status', 'accepted');

// Friend request management
const { error } = await supabase
  .from('friend_requests')
  .update({ status: 'accepted' })
  .eq('id', requestId);
```

### **Real-time Updates**
```typescript
// Subscribe to friend request changes
const subscription = supabase
  .channel('friend_requests')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'friend_requests',
    filter: `user_id=eq.${currentUserId}`,
  }, handleFriendRequestUpdate)
  .subscribe();
```

### **User Search**
```typescript
// Search users
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .ilike('username', `%${searchQuery}%`)
  .limit(20);
```

## **Social Features**

### **Friend Management**
- **Add Friends**: Send and receive friend requests
- **Friend List**: View and manage friends
- **Friend Activity**: See friend progress and achievements
- **Friend Recommendations**: Suggested friends based on mutual connections

### **User Profiles**
- **Profile Viewing**: View detailed user profiles
- **Achievement Display**: Show user achievements and stats
- **Activity Feed**: Recent user activity
- **Mutual Friends**: Display mutual connections

### **Social Interactions**
- **Messaging**: Direct messaging between friends
- **Activity Sharing**: Share crawl progress and achievements
- **Social Feed**: Activity feed from friends
- **Notifications**: Social interaction notifications

## **Performance Optimization**

### **List Performance**
- **Virtualization**: Efficient friend list rendering
- **Pagination**: Load friends in chunks
- **Caching**: Cache friend data and avatars
- **Debouncing**: Optimize search functionality

### **Image Optimization**
- **Avatar Loading**: Efficient profile picture loading
- **Caching**: Cache user avatars
- **Fallbacks**: Graceful fallback for missing avatars
- **Compression**: Optimized image sizes

### **Real-time Updates**
- **Selective Updates**: Only update changed components
- **Batch Updates**: Group multiple updates
- **Connection Management**: Efficient WebSocket connections
- **Error Recovery**: Handle connection failures gracefully

## **User Experience**

### **Interactive Elements**
- **Touch Feedback**: Visual feedback for interactions
- **Loading States**: Clear loading indicators
- **Success/Error Messages**: User feedback for actions
- **Confirmation Dialogs**: Confirm important actions

### **Visual Design**
- **Profile Pictures**: Consistent avatar display
- **Status Indicators**: Clear friendship status
- **Action Buttons**: Prominent and accessible buttons
- **Activity Indicators**: Show user activity and engagement

## **Error Handling**

### **API Errors**
```typescript
const handleAddFriend = async (user: User) => {
  try {
    setIsLoading(true);
    await addFriend(user.id);
    showSuccessMessage('Friend request sent!');
  } catch (error) {
    console.error('Add friend error:', error);
    showErrorMessage('Failed to send friend request');
  } finally {
    setIsLoading(false);
  }
};
```

### **Network Errors**
```typescript
const handleNetworkError = (error: Error) => {
  if (error.message.includes('network')) {
    showErrorMessage('Network error. Please try again.');
  } else {
    showErrorMessage('Something went wrong. Please try again.');
  }
};
```

### **Data Validation**
```typescript
const validateUserData = (user: User) => {
  if (!user.id || !user.username) {
    throw new Error('Invalid user data');
  }
  return user;
};
```

## **Testing Strategy**

### **Component Testing**
```typescript
// FriendCard test
describe('FriendCard', () => {
  it('renders friend information correctly', () => {
    const { getByText } = render(
      <FriendCard friend={mockFriend} />
    );
    expect(getByText(mockFriend.username)).toBeTruthy();
  });

  it('handles friend actions', () => {
    const onMessagePress = jest.fn();
    const { getByTestId } = render(
      <FriendCard friend={mockFriend} onMessagePress={onMessagePress} />
    );
    fireEvent.press(getByTestId('message-button'));
    expect(onMessagePress).toHaveBeenCalledWith(mockFriend);
  });
});
```

### **API Integration Testing**
```typescript
// Friend request test
describe('FriendRequestCard', () => {
  it('accepts friend request', async () => {
    const onAccept = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <FriendRequestCard request={mockRequest} onAccept={onAccept} />
    );
    fireEvent.press(getByTestId('accept-button'));
    await waitFor(() => {
      expect(onAccept).toHaveBeenCalledWith(mockRequest);
    });
  });
});
```

## **Development Guidelines**

### **Component Creation**
1. **Define Purpose**: Clear social functionality
2. **Design Interface**: Consistent props interface
3. **Add API Integration**: Supabase social features
4. **Handle Real-time Updates**: WebSocket integration
5. **Add Error Handling**: Graceful error handling
6. **Test Social Interactions**: Unit and integration tests

### **Best Practices**
- **Privacy**: Respect user privacy settings
- **Performance**: Optimize for social data loading
- **Real-time**: Handle real-time updates efficiently
- **Accessibility**: Ensure social features are accessible
- **Security**: Validate social interactions

## **Dependencies**

### **External Dependencies**
- **Supabase**: Database and real-time features
- **React Native**: Core UI components
- **Expo**: Platform-specific features

### **Internal Dependencies**
- **Context**: Authentication and user contexts
- **Utils**: Social utility functions
- **Types**: Social type definitions
- **Constants**: Social feature configuration

---

**Last Updated**: Version 1.2.0
**Maintainer**: Development Team 
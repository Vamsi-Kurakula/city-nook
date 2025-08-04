# 👥 Social Screens

## **Overview**

The `social/` directory contains all social and user interaction screens. These screens handle user profiles, friend management, social features, and community interactions within the application.

## **Directory Contents**

```
social/
├── UserProfile.tsx           # Main user profile screen
├── AddFriendsScreen.tsx      # Friend discovery and addition
├── FriendsListScreen.tsx     # Friends list and management
├── FriendProfileScreen.tsx   # Individual friend profile view
└── index.ts                  # Export definitions
```

## **Components**

### **UserProfile.tsx** (18KB, 576 lines)
- **Purpose**: Main user profile and settings screen
- **Features**:
  - Complete user profile display
  - Profile editing and customization
  - Achievement showcase
  - Crawl history and statistics
  - Social connections display
  - Privacy settings
  - Account management
  - Photo gallery
  - Activity feed

### **AddFriendsScreen.tsx** (11KB, 317 lines)
- **Purpose**: Friend discovery and addition interface
- **Features**:
  - User search functionality
  - Friend recommendations
  - Social media integration
  - Contact import
  - Friend request management
  - User filtering and sorting
  - Search suggestions
  - Recent searches

### **FriendsListScreen.tsx** (5.6KB, 184 lines)
- **Purpose**: Friends list display and management
- **Features**:
  - Complete friends list
  - Friend categorization
  - Online status indicators
  - Quick actions (message, invite)
  - Friend request notifications
  - Search and filtering
  - Sort options
  - Bulk actions

### **FriendProfileScreen.tsx** (8.9KB, 294 lines)
- **Purpose**: Individual friend profile view
- **Features**:
  - Friend profile information
  - Shared crawl history
  - Mutual friends display
  - Activity timeline
  - Photo gallery
  - Achievement comparison
  - Direct messaging
  - Crawl invitations

## **API Integration**

### **Database Operations**
- **Supabase**: Primary data source
  - User profiles and preferences
  - Friend relationships
  - Friend requests
  - Social interactions
  - Activity tracking
  - Achievement data

### **External Services**
- **Clerk**: User authentication and profile
  - User session management
  - Profile data access
  - Authentication status
- **Image Storage**: Profile pictures and photos
  - Profile picture management
  - Photo gallery storage
  - Image optimization

### **Required APIs**
```typescript
// Database Operations
import { supabase } from '@/utils/database/client';
import { profileOperations } from '@/utils/database/profileOperations';
import { friendshipOperations } from '@/utils/database/friendshipOperations';
import { friendRequestOperations } from '@/utils/database/friendRequestOperations';

// Authentication
import { useAuth, useUser } from '@clerk/clerk-expo';

// Image Handling
import { DatabaseImage } from '@/components/ui/crawl/DatabaseImage';
```

## **State Management**

### **Context Integration**
- **AuthContext**: User authentication state
  - User session information
  - Profile data
  - Authentication status
- **CrawlContext**: Crawl-related state
  - Shared crawl activities
  - Social interactions
  - Achievement tracking

### **Local State**
- **Profile State**: User profile data and editing
- **Friends State**: Friends list and relationships
- **Search State**: User search and filtering
- **UI State**: Component-specific UI state

## **Navigation Flow**

### **Social Navigation**
```
UserProfile → AddFriends → FriendsList → FriendProfile
     ↓              ↓            ↓            ↓
Profile Edit ← Friend Requests ← Friend Actions ← Direct Message
```

### **Navigation Dependencies**
- **AppNavigator**: Main navigation container
- **Tab Navigation**: Bottom tab navigation
- **Stack Navigation**: Screen transitions
- **Modal Navigation**: Overlay screens

## **User Experience**

### **Design Patterns**
- **Profile Cards**: Consistent profile display
- **Search Interface**: Intuitive user search
- **Friend Management**: Easy friend operations
- **Social Interactions**: Seamless social features

### **Performance Features**
- **Lazy Loading**: Content loaded on demand
- **Image Optimization**: Efficient image loading
- **Search Optimization**: Fast search functionality
- **Real-time Updates**: Live social updates

## **Social Features**

### **Friend Management**
- **Friend Discovery**: Find and add new friends
- **Friend Requests**: Send and manage friend requests
- **Friend Categories**: Organize friends by categories
- **Friend Actions**: Quick actions for friends

### **Social Interactions**
- **Activity Sharing**: Share crawl activities
- **Achievement Comparison**: Compare achievements
- **Direct Messaging**: Private messaging system
- **Crawl Invitations**: Invite friends to crawls

### **Privacy Controls**
- **Profile Privacy**: Control profile visibility
- **Activity Privacy**: Control activity sharing
- **Friend Privacy**: Control friend list visibility
- **Photo Privacy**: Control photo sharing

## **Integration Points**

### **With Other Components**
- **Context Providers**: AuthContext and CrawlContext
- **UI Components**: Social-specific UI components
- **Navigation**: Screen routing and transitions
- **Error Handling**: Error boundaries and recovery

### **With External Services**
- **Database**: Real-time social data synchronization
- **Authentication**: User session management
- **Image Services**: Profile and content images
- **Social APIs**: External social media integration

## **Data Flow**

### **Social Data Pipeline**
```
User Login → Profile Data → Friend Data → Social Display
     ↓              ↓              ↓              ↓
Social Updates ← Activity Data ← Friend Actions ← Real-time Sync
```

### **Friend Management Flow**
```
Search Users → Send Request → Accept Request → Friend Relationship
     ↓              ↓              ↓              ↓
User Discovery ← Request Management ← Friend Actions ← Social Features
```

## **Error Handling**

### **Social-Specific Errors**
- **Profile Errors**: Profile loading and update failures
- **Friend Errors**: Friend request and relationship errors
- **Search Errors**: User search and discovery failures
- **Privacy Errors**: Privacy setting and permission errors

### **Recovery Strategies**
- **Offline Mode**: Limited functionality with cached data
- **Data Recovery**: Automatic retry for failed operations
- **User Feedback**: Clear error messages and solutions
- **Fallback Content**: Default content when data unavailable

## **Performance Considerations**

### **Optimization Strategies**
- **Image Optimization**: Lazy loading and compression
- **Search Optimization**: Efficient search algorithms
- **Data Caching**: Smart caching strategies
- **Real-time Updates**: Optimized real-time synchronization

### **Memory Management**
- **Image Cleanup**: Proper image memory management
- **List Virtualization**: Efficient list rendering
- **Event Listeners**: Proper listener cleanup
- **Large Data Sets**: Efficient data handling

## **Testing Strategy**

### **Test Coverage**
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Complete social flow testing
- **Performance Tests**: Load and stress testing

### **Test Scenarios**
- **Profile Management**: Profile creation and editing
- **Friend Operations**: Adding and managing friends
- **Social Interactions**: Sharing and messaging
- **Privacy Controls**: Privacy setting management
- **Performance**: Large friend list handling

## **Development Guidelines**

### **Adding New Social Features**
1. **Define Requirements**: Feature specification and user stories
2. **Update Types**: Add necessary TypeScript interfaces
3. **Implement UI**: Create or modify social components
4. **Add API Integration**: Connect to required services
5. **Update Navigation**: Modify routing as needed
6. **Test Thoroughly**: Validate all scenarios and edge cases

### **Code Standards**
- **TypeScript**: Strict type checking for all components
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized for mobile devices
- **Accessibility**: WCAG compliance for all UI elements

## **Privacy and Security**

### **Privacy Features**
- **Data Protection**: Secure handling of user data
- **Privacy Controls**: User-controlled privacy settings
- **Consent Management**: Clear user consent for data sharing
- **Data Minimization**: Minimal data collection and storage

### **Security Measures**
- **Authentication**: Secure user authentication
- **Authorization**: Proper access control
- **Data Encryption**: Encrypted data transmission and storage
- **Input Validation**: Secure input handling

## **Dependencies**

### **External Libraries**
- **@clerk/clerk-expo**: Authentication and user management
- **@supabase/supabase-js**: Database operations
- **react-native**: Core React Native components
- **expo**: Expo platform features

### **Internal Dependencies**
- **AuthContext**: Authentication state management
- **CrawlContext**: Crawl state management
- **UI Components**: Social-specific UI components
- **Database Utils**: Database operation helpers
- **Navigation**: Screen routing and transitions

---

**Last Updated**: Version 1.0.0
**Maintainer**: Social Team 
# 🧭 Navigation Directory

## **Overview**

The `navigation/` directory contains React Navigation components that handle routing, screen transitions, and navigation logic throughout the application. This directory implements a hierarchical navigation structure with authentication-based routing.

## **Files**

### **AppNavigator.tsx**
**Purpose**: Main application navigation container and routing logic

**Key Features**:
- Authentication-based routing
- Main tab navigation
- Screen stack management
- Navigation state handling

**Navigation Structure**:
```typescript
AppNavigator
├── AuthNavigator (Unauthenticated users)
└── MainTabs (Authenticated users)
    ├── HomeTab
    ├── CrawlTab
    ├── SocialTab
    └── ProfileTab
```

**API Integration**:
- **AuthContext**: Authentication state for routing decisions
- **Clerk**: User session validation
- **Deep Linking**: External app navigation

**Navigation Props**:
```typescript
{
  initialRouteName: string
  screenOptions: ScreenOptions
  onStateChange: (state: NavigationState) => void
}
```

**Usage Example**:
```typescript
<AppNavigator initialRouteName="Home" />
```

### **AuthNavigator.tsx**
**Purpose**: Authentication flow navigation for unauthenticated users

**Key Features**:
- Sign-in screen routing
- Authentication flow management
- Redirect logic for authenticated users
- Loading state handling

**Screen Flow**:
```
AuthNavigator
├── SignInScreen
├── LoadingScreen (during auth)
└── Redirect (if already authenticated)
```

**API Integration**:
- **AuthContext**: Authentication state monitoring
- **Clerk**: Authentication flow management
- **Deep Linking**: Authentication callback handling

**Navigation Props**:
```typescript
{
  onAuthSuccess: () => void
  onAuthFailure: (error: Error) => void
  redirectUrl?: string
}
```

**Usage Example**:
```typescript
<AuthNavigator onAuthSuccess={handleAuthSuccess} />
```

### **index.ts**
**Purpose**: Navigation component exports and type definitions

**Exports**:
```typescript
export { default as AppNavigator } from './AppNavigator';
export { default as AuthNavigator } from './AuthNavigator';
```

**Type Definitions**:
```typescript
export type RootStackParamList = {
  Home: undefined;
  CrawlDetail: { crawl: Crawl };
  CrawlSession: { crawl: Crawl };
  // ... other screen params
};
```

## **Navigation Architecture**

### **Navigation Hierarchy**
```
AppNavigator (Root)
├── AuthNavigator (Unauthenticated)
│   ├── SignInScreen
│   └── LoadingScreen
└── MainTabs (Authenticated)
    ├── HomeStack
    │   ├── HomeScreen
    │   ├── CrawlDetailScreen
    │   └── CrawlSessionScreen
    ├── CrawlStack
    │   ├── CrawlLibraryScreen
    │   ├── CrawlHistoryScreen
    │   └── CrawlStatsScreen
    ├── SocialStack
    │   ├── FriendsListScreen
    │   ├── UserProfileScreen
    │   └── AddFriendsScreen
    └── ProfileStack
        ├── UserProfileScreen
        ├── SettingsScreen
        └── LegalScreens
```

### **Navigation Flow**
```
App Launch
    ↓
Check Authentication
    ↓
┌─────────────────┬─────────────────┐
│ Unauthenticated │  Authenticated  │
│     ↓           │       ↓         │
│ AuthNavigator   │   MainTabs      │
│     ↓           │       ↓         │
│ SignInScreen    │   HomeScreen    │
└─────────────────┴─────────────────┘
```

## **Screen Navigation Patterns**

### **1. Stack Navigation**
- **Home Stack**: Main app flow and crawl interactions
- **Crawl Stack**: Crawl management and history
- **Social Stack**: User profiles and social features
- **Profile Stack**: User settings and account management

### **2. Tab Navigation**
- **Home Tab**: Main dashboard and featured content
- **Crawl Tab**: Crawl library and management
- **Social Tab**: Friends and social features
- **Profile Tab**: User profile and settings

### **3. Modal Navigation**
- **Crawl Session**: Full-screen crawl experience
- **User Profile**: Detailed user information
- **Settings**: Configuration and preferences

## **API Integration**

### **Authentication Integration**
```typescript
// AuthContext Integration
const { isAuthenticated, user } = useAuthContext();

// Navigation based on auth state
if (isAuthenticated) {
  navigation.navigate('MainTabs');
} else {
  navigation.navigate('Auth');
}
```

### **Deep Linking Integration**
```typescript
// Deep link handling
const linking = {
  prefixes: ['citycrawler://', 'https://citycrawler.com'],
  config: {
    screens: {
      Home: 'home',
      CrawlDetail: 'crawl/:id',
      UserProfile: 'user/:id',
    },
  },
};
```

### **Navigation State Management**
```typescript
// Navigation state persistence
const navigationRef = useRef<NavigationContainerRef>(null);

// Save navigation state
const onStateChange = (state: NavigationState) => {
  AsyncStorage.setItem('navigationState', JSON.stringify(state));
};
```

## **Navigation Parameters**

### **Screen Parameters**
```typescript
// Crawl Detail Screen
type CrawlDetailParams = {
  crawl: Crawl;
  fromScreen?: string;
};

// User Profile Screen
type UserProfileParams = {
  userId: string;
  showBackButton?: boolean;
};

// Crawl Session Screen
type CrawlSessionParams = {
  crawl: Crawl;
  completedStop?: number;
  userAnswer?: string;
};
```

### **Navigation Options**
```typescript
// Screen options
const screenOptions = {
  headerShown: true,
  headerBackTitle: 'Back',
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  headerTintColor: theme.colors.white,
};
```

## **Error Handling**

### **Navigation Errors**
- **Invalid Routes**: Handle navigation to non-existent screens
- **Authentication Errors**: Redirect to sign-in on auth failures
- **Deep Link Errors**: Handle invalid deep link URLs

### **Fallback Navigation**
```typescript
// Fallback to home screen
const handleNavigationError = (error: NavigationError) => {
  console.error('Navigation error:', error);
  navigation.navigate('Home');
};
```

## **Performance Considerations**

### **Navigation Optimization**
- **Lazy Loading**: Load screens on demand
- **Screen Caching**: Cache frequently accessed screens
- **Memory Management**: Clean up unused screen components

### **Navigation State**
- **State Persistence**: Save and restore navigation state
- **State Validation**: Validate navigation state on app launch
- **State Recovery**: Recover from invalid navigation states

## **Testing Strategy**

### **Navigation Testing**
- **Unit Tests**: Individual navigation components
- **Integration Tests**: Navigation flow testing
- **E2E Tests**: Full navigation user flows

### **Test Utilities**
- **Navigation Mocks**: Mock navigation functions
- **Screen Testing**: Test screen rendering and interactions
- **Deep Link Testing**: Test deep link handling

## **Development Guidelines**

### **Navigation Creation**
1. **Define Routes**: Plan navigation structure and screen hierarchy
2. **Create Navigators**: Implement navigation containers
3. **Add Screens**: Connect screens to navigation
4. **Handle Parameters**: Define and validate navigation parameters
5. **Add Deep Linking**: Implement deep link support
6. **Test Navigation**: Verify navigation flows and edge cases

### **Navigation Best Practices**
- **Consistent Naming**: Use consistent screen and route names
- **Parameter Validation**: Validate navigation parameters
- **Error Handling**: Handle navigation errors gracefully
- **Performance**: Optimize navigation for performance
- **Accessibility**: Ensure navigation is accessible

## **Dependencies**

### **External Dependencies**
- **React Navigation**: Core navigation library
- **React Navigation Stack**: Stack navigation
- **React Navigation Tabs**: Tab navigation
- **React Navigation Native**: Native navigation integration

### **Internal Dependencies**
- **Context**: Authentication and theme contexts
- **Screens**: Screen components for navigation
- **Types**: Navigation type definitions
- **Utils**: Navigation utility functions

---

**Last Updated**: Version 1.2.0
**Maintainer**: Development Team 
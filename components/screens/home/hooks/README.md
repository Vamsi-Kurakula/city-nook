# 🪝 Home Hooks

## **Overview**

The `hooks/` directory contains custom React hooks specifically designed for the home screen functionality. These hooks encapsulate data fetching, state management, and business logic for the home dashboard components.

## **Directory Contents**

```
hooks/
├── useHomeData.ts      # Home data fetching and management
├── useCrawlActions.ts  # Crawl action handlers
└── README.md          # This documentation
```

## **Hooks**

### **useHomeData.ts** (8.7KB, 275 lines)
- **Purpose**: Centralized data fetching and management for home screen
- **Features**:
  - User profile data loading and caching
  - Featured crawls fetching with filtering
  - Recent activity aggregation and sorting
  - Achievement tracking and display
  - Real-time data updates and synchronization
  - Optimized data caching and memory management

#### **API Interface**
```typescript
interface UseHomeDataReturn {
  // User data
  userProfile: UserProfile | null;
  userStats: UserStats | null;
  
  // Content data
  featuredCrawls: CrawlDefinition[];
  recentActivity: ActivityItem[];
  achievements: Achievement[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  loadMoreContent: () => Promise<void>;
}
```

#### **Usage Example**
```typescript
const {
  userProfile,
  featuredCrawls,
  recentActivity,
  isLoading,
  error,
  refreshData
} = useHomeData();
```

#### **Data Sources**
- **Supabase**: Primary data source for all home content
- **Clerk**: User authentication and profile information
- **Local Storage**: Cached data for offline functionality

### **useCrawlActions.ts** (5.8KB, 175 lines)
- **Purpose**: Crawl action handlers and business logic for home screen
- **Features**:
  - Quick start crawl functionality
  - Bookmark and favorite management
  - Social sharing and interactions
  - Progress tracking and updates
  - Achievement unlocking and notifications
  - Error handling and user feedback

#### **API Interface**
```typescript
interface UseCrawlActionsReturn {
  // Crawl actions
  startCrawl: (crawlId: string) => Promise<void>;
  bookmarkCrawl: (crawlId: string) => Promise<void>;
  shareCrawl: (crawlId: string) => Promise<void>;
  
  // Progress actions
  trackProgress: (crawlId: string, progress: number) => Promise<void>;
  updateAchievement: (achievementId: string) => Promise<void>;
  
  // Loading states
  isActionLoading: boolean;
  
  // Error handling
  actionError: string | null;
  
  // Success feedback
  showSuccessMessage: (message: string) => void;
}
```

#### **Usage Example**
```typescript
const {
  startCrawl,
  bookmarkCrawl,
  shareCrawl,
  isActionLoading,
  actionError
} = useCrawlActions();

// Start a crawl
await startCrawl('crawl-123');

// Bookmark a crawl
await bookmarkCrawl('crawl-456');
```

## **API Integration**

### **Database Operations**
- **Supabase Client**: Direct database operations
  - User profile queries and updates
  - Crawl definition fetching
  - Activity and achievement tracking
  - Real-time subscriptions

### **Authentication Services**
- **Clerk**: User session management
  - User authentication status
  - Profile data access
  - Session validation

### **External Services**
- **Image Storage**: Profile and content images
- **Social APIs**: Sharing and interaction features
- **Analytics**: User behavior tracking

### **Required Dependencies**
```typescript
// Database
import { supabase } from '@/utils/database/client';
import { profileOperations } from '@/utils/database/profileOperations';
import { crawlDefinitionOperations } from '@/utils/database/crawlDefinitionOperations';

// Authentication
import { useAuth, useUser } from '@clerk/clerk-expo';

// Utilities
import { featuredCrawlLoader } from '@/utils/featuredCrawlLoader';
```

## **State Management**

### **Local State**
- **Data State**: Cached data and loading states
- **UI State**: Component-specific UI state
- **Error State**: Error handling and recovery
- **Cache State**: Optimized data caching

### **Context Integration**
- **AuthContext**: User authentication state
- **CrawlContext**: Crawl-related state
- **ThemeContext**: UI theme and appearance

## **Data Flow**

### **Home Data Pipeline**
```
User Login → Profile Data → Featured Content → Dashboard Display
     ↓              ↓              ↓              ↓
Recent Activity ← Achievement Data ← Social Data ← Real-time Updates
```

### **Caching Strategy**
- **User Profile**: Cached for session duration
- **Featured Crawls**: Cached with periodic refresh
- **Recent Activity**: Real-time with fallback cache
- **Images**: Optimized caching with lazy loading

## **Error Handling**

### **Hook-Specific Errors**
- **Data Loading Errors**: Graceful fallbacks for missing data
- **Network Errors**: Offline mode with cached content
- **Authentication Errors**: Session management and recovery
- **Action Errors**: User feedback and retry logic

### **Recovery Strategies**
- **Offline Mode**: Limited functionality with cached data
- **Data Recovery**: Automatic retry for failed requests
- **User Feedback**: Clear error messages and solutions
- **Fallback Content**: Default content when data unavailable

## **Performance Considerations**

### **Optimization Strategies**
- **Data Fetching**: Efficient API calls and caching
- **Memory Management**: Proper cleanup and resource management
- **Component Rendering**: Memoization and optimization
- **Background Updates**: Non-blocking data synchronization

### **Caching Implementation**
- **In-Memory Cache**: Fast access to frequently used data
- **Persistent Cache**: Offline data availability
- **Cache Invalidation**: Automatic cache refresh strategies
- **Memory Cleanup**: Proper cache cleanup on unmount

## **Testing Strategy**

### **Hook Testing**
- **Unit Tests**: Individual hook functionality
- **Integration Tests**: Hook interaction testing
- **Mock Testing**: API and service mocking
- **Error Testing**: Error scenario validation

### **Test Scenarios**
- **Data Loading**: Hook initialization and data fetching
- **User Interactions**: Action handling and state updates
- **Error Handling**: Various error scenario handling
- **Performance**: Large data set handling and optimization

## **Development Guidelines**

### **Adding New Hooks**
1. **Define Purpose**: Clear hook responsibility and scope
2. **Design Interface**: TypeScript interfaces and return types
3. **Implement Logic**: Core functionality and error handling
4. **Add Testing**: Comprehensive test coverage
5. **Document Usage**: Clear examples and documentation

### **Code Standards**
- **TypeScript**: Strict type checking for all hooks
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized for mobile devices
- **Testing**: High test coverage and quality

### **Hook Patterns**
- **Single Responsibility**: Each hook has one clear purpose
- **Composability**: Hooks can be combined and reused
- **Error Boundaries**: Proper error handling and recovery
- **Performance**: Optimized rendering and data fetching

## **Dependencies**

### **External Libraries**
- **@clerk/clerk-expo**: Authentication and user management
- **@supabase/supabase-js**: Database operations
- **react**: Core React hooks and utilities
- **expo**: Expo platform features

### **Internal Dependencies**
- **Database Utils**: Database operation helpers
- **Context Providers**: Global state management
- **Utility Functions**: Helper functions and utilities
- **Type Definitions**: TypeScript type definitions

## **Usage Examples**

### **Basic Home Data Usage**
```typescript
import { useHomeData } from './hooks/useHomeData';

function HomeScreen() {
  const {
    userProfile,
    featuredCrawls,
    recentActivity,
    isLoading,
    error,
    refreshData
  } = useHomeData();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <ScrollView>
      <UserProfileSection profile={userProfile} />
      <FeaturedCrawlsSection crawls={featuredCrawls} />
      <RecentActivitySection activities={recentActivity} />
    </ScrollView>
  );
}
```

### **Crawl Actions Usage**
```typescript
import { useCrawlActions } from './hooks/useCrawlActions';

function CrawlCard({ crawl }) {
  const {
    startCrawl,
    bookmarkCrawl,
    isActionLoading,
    actionError
  } = useCrawlActions();

  const handleStartCrawl = async () => {
    try {
      await startCrawl(crawl.id);
      // Navigate to crawl session
    } catch (error) {
      // Handle error
    }
  };

  return (
    <TouchableOpacity onPress={handleStartCrawl} disabled={isActionLoading}>
      <Text>Start Crawl</Text>
    </TouchableOpacity>
  );
}
```

---

**Last Updated**: Version 1.0.0
**Maintainer**: Home Team 
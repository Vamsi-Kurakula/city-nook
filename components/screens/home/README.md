# 🏠 Home Screens

## **Overview**

The `home/` directory contains the main dashboard and home screen components. These screens serve as the primary entry point for users, providing an overview of their crawl activities, featured content, and quick access to key features.

## **Directory Contents**

```
home/
├── HomeScreen.tsx                 # Main dashboard screen
├── HomeHeader.tsx                 # Dashboard header component
├── FeaturedCrawlsSection.tsx      # Featured crawls display
├── UpcomingCrawlsSection.tsx      # Upcoming and recent crawls
├── hooks/                         # Custom hooks for home functionality
│   ├── useHomeData.ts            # Home data fetching and management
│   └── useCrawlActions.ts        # Crawl action handlers
└── index.ts                      # Export definitions
```

## **Components**

### **HomeScreen.tsx** (16KB, 500 lines)
- **Purpose**: Main dashboard and landing screen
- **Features**:
  - User welcome and profile summary
  - Quick action buttons
  - Featured crawls section
  - Recent activity feed
  - Achievement highlights
  - Navigation shortcuts
  - Real-time updates

### **HomeHeader.tsx** (2.8KB, 102 lines)
- **Purpose**: Dashboard header with user info and actions
- **Features**:
  - User profile display
  - Notification indicators
  - Quick settings access
  - Search functionality
  - Theme toggle
  - User menu

### **FeaturedCrawlsSection.tsx** (4.3KB, 154 lines)
- **Purpose**: Display featured and recommended crawls
- **Features**:
  - Curated crawl selection
  - Trending crawls
  - Personalized recommendations
  - Quick start buttons
  - Visual previews
  - Category filtering

### **UpcomingCrawlsSection.tsx** (6.8KB, 234 lines)
- **Purpose**: Show upcoming and recent crawl activities
- **Features**:
  - Scheduled crawls
  - Recent completions
  - Progress tracking
  - Social interactions
  - Performance metrics
  - Quick access to details

## **Custom Hooks**

### **hooks/useHomeData.ts** (8.7KB, 275 lines)
- **Purpose**: Data fetching and management for home screen
- **Features**:
  - User profile data loading
  - Featured crawls fetching
  - Recent activity aggregation
  - Achievement tracking
  - Real-time data updates
  - Caching and optimization

### **hooks/useCrawlActions.ts** (5.8KB, 175 lines)
- **Purpose**: Crawl action handlers and business logic
- **Features**:
  - Quick start crawl functionality
  - Bookmark and favorite actions
  - Social sharing
  - Progress tracking
  - Achievement unlocking
  - Error handling

## **API Integration**

### **Data Sources**
- **Supabase**: Primary data source
  - User profile and preferences
  - Crawl definitions and metadata
  - User progress and history
  - Social interactions
  - Achievement data

### **External Services**
- **Clerk**: User authentication and profile
  - User session information
  - Profile data management
  - Authentication status
- **Image Storage**: User photos and avatars
  - Profile picture management
  - Achievement badge images
  - Crawl preview images

### **Required APIs**
```typescript
// Database Operations
import { supabase } from '@/utils/database/client';
import { profileOperations } from '@/utils/database/profileOperations';
import { crawlDefinitionOperations } from '@/utils/database/crawlDefinitionOperations';

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
  - Active crawl information
  - Progress tracking
  - Recent activities

### **Local State**
- **Screen State**: Dashboard data and UI state
- **Loading States**: Data fetching status
- **Error States**: Error handling and recovery
- **Cache State**: Optimized data caching

## **Navigation Flow**

### **Home Navigation**
```
HomeScreen → Featured Crawls → Crawl Detail
     ↓              ↓              ↓
User Profile ← Quick Actions ← Recent Activity
```

### **Navigation Dependencies**
- **AppNavigator**: Main navigation container
- **Tab Navigation**: Bottom tab navigation
- **Stack Navigation**: Screen transitions
- **Modal Navigation**: Overlay screens

## **User Experience**

### **Design Patterns**
- **Dashboard Layout**: Information hierarchy and organization
- **Quick Actions**: Easy access to common tasks
- **Progressive Loading**: Content loaded progressively
- **Personalization**: User-specific content and recommendations

### **Performance Features**
- **Lazy Loading**: Content loaded on demand
- **Caching**: Data and image caching
- **Optimization**: Efficient data fetching
- **Background Updates**: Non-blocking data synchronization

## **Integration Points**

### **With Other Components**
- **Context Providers**: AuthContext and CrawlContext
- **UI Components**: Reusable dashboard components
- **Navigation**: Screen routing and transitions
- **Error Handling**: Error boundaries and recovery

### **With External Services**
- **Database**: Real-time data synchronization
- **Authentication**: User session management
- **Image Services**: Profile and content images
- **Social Features**: Sharing and interactions

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

### **Home-Specific Errors**
- **Data Loading Errors**: Graceful fallbacks for missing data
- **Network Errors**: Offline mode with cached content
- **Authentication Errors**: Session management and recovery
- **Image Loading Errors**: Placeholder and retry logic

### **Recovery Strategies**
- **Offline Mode**: Limited functionality with cached data
- **Data Recovery**: Automatic retry for failed requests
- **User Feedback**: Clear error messages and solutions
- **Fallback Content**: Default content when data unavailable

## **Performance Considerations**

### **Optimization Strategies**
- **Data Fetching**: Efficient API calls and caching
- **Image Optimization**: Lazy loading and compression
- **Component Rendering**: Memoization and optimization
- **Memory Management**: Proper cleanup and resource management

### **Loading States**
- **Skeleton Screens**: Placeholder content during loading
- **Progressive Loading**: Content loaded in priority order
- **Background Updates**: Non-blocking data synchronization
- **Error Recovery**: Graceful handling of loading failures

## **Testing Strategy**

### **Test Coverage**
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Load and stress testing

### **Test Scenarios**
- **Dashboard Loading**: Initial load and data fetching
- **User Interactions**: Quick actions and navigation
- **Data Updates**: Real-time updates and synchronization
- **Error Handling**: Various error scenario handling
- **Performance**: Large data set handling

## **Development Guidelines**

### **Adding New Home Features**
1. **Define Requirements**: Feature specification and user stories
2. **Update Types**: Add necessary TypeScript interfaces
3. **Implement UI**: Create or modify home components
4. **Add API Integration**: Connect to required services
5. **Update Navigation**: Modify routing as needed
6. **Test Thoroughly**: Validate all scenarios and edge cases

### **Code Standards**
- **TypeScript**: Strict type checking for all components
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized for mobile devices
- **Accessibility**: WCAG compliance for all UI elements

## **Dependencies**

### **External Libraries**
- **@clerk/clerk-expo**: Authentication and user management
- **@supabase/supabase-js**: Database operations
- **react-native**: Core React Native components
- **expo**: Expo platform features

### **Internal Dependencies**
- **AuthContext**: Authentication state management
- **CrawlContext**: Crawl state management
- **UI Components**: Reusable dashboard components
- **Database Utils**: Database operation helpers
- **Navigation**: Screen routing and transitions

---

**Last Updated**: Version 1.0.0
**Maintainer**: Home Team 
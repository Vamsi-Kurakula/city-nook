# 🗺️ Crawl Screens

## **Overview**

The `crawl/` directory contains all crawl-related screens and components. These screens handle the complete crawl lifecycle from discovery and selection to execution, monitoring, and completion.

## **Directory Contents**

```
crawl/
├── CrawlLibrary.tsx              # Main crawl discovery and selection
├── CrawlLibraryFilters.tsx       # Filter and search functionality
├── CrawlDetailScreen.tsx         # Detailed crawl information
├── CrawlSessionScreen.tsx        # Active crawl execution
├── CrawlStartStopScreen.tsx      # Crawl start/stop controls
├── CrawlMapScreen.tsx            # Map view during crawl
├── CrawlStatsScreen.tsx          # Real-time crawl statistics
├── CrawlRecsScreen.tsx           # Crawl recommendations
├── CrawlHistoryScreen.tsx        # Past crawl history
├── CrawlHistoryDetailScreen.tsx  # Detailed history view
├── CrawlCompletionScreen.tsx     # Crawl completion summary
└── index.ts                      # Export definitions
```

## **Components**

### **CrawlLibrary.tsx** (12KB, 335 lines)
- **Purpose**: Main interface for discovering and selecting crawls
- **Features**:
  - Grid/list view of available crawls
  - Search and filtering capabilities
  - Featured and trending crawls
  - Quick start functionality
  - Favorites and bookmarks

### **CrawlLibraryFilters.tsx** (3.6KB, 110 lines)
- **Purpose**: Advanced filtering and search for crawls
- **Features**:
  - Category filtering
  - Difficulty level selection
  - Duration and distance filters
  - Price range filtering
  - Location-based filtering

### **CrawlDetailScreen.tsx** (13KB, 351 lines)
- **Purpose**: Detailed information about a specific crawl
- **Features**:
  - Complete crawl description
  - Stop-by-stop preview
  - User reviews and ratings
  - Difficulty and requirements
  - Start crawl functionality

### **CrawlSessionScreen.tsx** (13KB, 365 lines)
- **Purpose**: Active crawl execution interface
- **Features**:
  - Real-time progress tracking
  - Stop navigation and completion
  - Photo and answer submission
  - Progress indicators
  - Emergency stop functionality

### **CrawlStartStopScreen.tsx** (8.3KB, 272 lines)
- **Purpose**: Crawl start/stop controls and confirmation
- **Features**:
  - Pre-crawl checklist
  - Safety information
  - Start confirmation
  - Emergency stop options
  - Progress saving

### **CrawlMapScreen.tsx** (4.5KB, 127 lines)
- **Purpose**: Map view during active crawl
- **Features**:
  - Real-time location tracking
  - Stop markers and directions
  - Route visualization
  - Location services integration
  - Offline map support

### **CrawlStatsScreen.tsx** (5.4KB, 171 lines)
- **Purpose**: Real-time crawl statistics and metrics
- **Features**:
  - Progress percentage
  - Time elapsed/remaining
  - Distance covered
  - Stops completed
  - Performance metrics

### **CrawlRecsScreen.tsx** (2.6KB, 95 lines)
- **Purpose**: Personalized crawl recommendations
- **Features**:
  - AI-powered recommendations
  - User preference matching
  - Trending crawls
  - Friend recommendations
  - Seasonal suggestions

### **CrawlHistoryScreen.tsx** (7.2KB, 243 lines)
- **Purpose**: Historical crawl data and achievements
- **Features**:
  - Completed crawl list
  - Achievement tracking
  - Performance statistics
  - Photo gallery
  - Social sharing

### **CrawlHistoryDetailScreen.tsx** (7.5KB, 263 lines)
- **Purpose**: Detailed view of completed crawls
- **Features**:
  - Complete crawl replay
  - Photo gallery
  - Performance analysis
  - Social interactions
  - Replay functionality

### **CrawlCompletionScreen.tsx** (5.8KB, 174 lines)
- **Purpose**: Crawl completion summary and celebration
- **Features**:
  - Completion statistics
  - Achievement unlocks
  - Photo gallery
  - Social sharing
  - Next crawl suggestions

## **API Integration**

### **Database Operations**
- **Supabase**: Primary data source
  - Crawl definitions and metadata
  - User progress and history
  - Photos and submissions
  - Social interactions
  - Achievement tracking

### **External Services**
- **Google Maps**: Location and navigation
  - Real-time location tracking
  - Route calculation
  - Geocoding and reverse geocoding
  - Offline map data
- **Image Storage**: Photo management
  - Photo upload and storage
  - Image optimization
  - Gallery management

### **Required APIs**
```typescript
// Database Operations
import { supabase } from '@/utils/database/client';
import { crawlDefinitionOperations } from '@/utils/database/crawlDefinitionOperations';
import { progressOperations } from '@/utils/database/progressOperations';

// Location Services
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Image Handling
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
```

## **State Management**

### **Crawl Context**
- **CrawlContext**: Global crawl state management
  - Active crawl information
  - Progress tracking
  - Stop completion status
  - Photo submissions
  - Real-time updates

### **Local State**
- **Screen State**: Individual screen data and UI state
- **Form State**: User input and validation
- **Loading States**: API call status and progress
- **Error States**: Error handling and recovery

## **Navigation Flow**

### **Crawl Lifecycle**
```
CrawlLibrary → CrawlDetail → CrawlStartStop → CrawlSession
     ↓              ↓              ↓              ↓
CrawlHistory ← CrawlCompletion ← CrawlStats ← CrawlMap
```

### **Navigation Dependencies**
- **AppNavigator**: Main navigation container
- **Tab Navigation**: Bottom tab navigation
- **Stack Navigation**: Screen transitions
- **Modal Navigation**: Overlay screens

## **User Experience**

### **Design Patterns**
- **Consistent UI**: Unified design language across screens
- **Progressive Disclosure**: Information revealed as needed
- **Feedback Systems**: Clear progress and status indicators
- **Error Recovery**: Graceful error handling and recovery

### **Performance Features**
- **Lazy Loading**: Content loaded on demand
- **Caching**: Offline data and image caching
- **Optimization**: Image compression and optimization
- **Background Processing**: Non-blocking operations

## **Integration Points**

### **With Other Components**
- **Context Providers**: CrawlContext for state management
- **UI Components**: Reusable crawl-specific components
- **Navigation**: Screen routing and transitions
- **Error Handling**: Error boundaries and recovery

### **With External Services**
- **Database**: Real-time data synchronization
- **Location Services**: GPS and location tracking
- **Image Services**: Photo upload and storage
- **Social Features**: Sharing and interactions

## **Error Handling**

### **Crawl-Specific Errors**
- **Location Errors**: GPS and location service failures
- **Network Errors**: Offline handling and retry logic
- **Photo Errors**: Upload failures and storage issues
- **Progress Errors**: Data synchronization problems

### **Recovery Strategies**
- **Offline Mode**: Limited functionality without network
- **Data Recovery**: Automatic progress saving
- **Retry Logic**: Automatic retry for failed operations
- **User Feedback**: Clear error messages and solutions

## **Performance Considerations**

### **Optimization Strategies**
- **Image Optimization**: Compression and resizing
- **Lazy Loading**: Content loaded progressively
- **Caching**: Offline data and image storage
- **Background Sync**: Non-blocking data operations

### **Memory Management**
- **Image Cleanup**: Proper image memory management
- **Component Unmounting**: Cleanup on screen changes
- **Event Listeners**: Proper listener cleanup
- **Large Data Sets**: Efficient data handling

## **Testing Strategy**

### **Test Coverage**
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Screen interaction testing
- **E2E Tests**: Complete crawl flow testing
- **Performance Tests**: Load and stress testing

### **Test Scenarios**
- **Crawl Discovery**: Library browsing and filtering
- **Crawl Execution**: Start to completion flow
- **Offline Functionality**: Network interruption handling
- **Error Recovery**: Various error scenario handling
- **Performance**: Large data set handling

## **Development Guidelines**

### **Adding New Crawl Features**
1. **Define Requirements**: Feature specification and user stories
2. **Update Types**: Add necessary TypeScript interfaces
3. **Implement UI**: Create or modify crawl screens
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
- **@supabase/supabase-js**: Database operations
- **expo-location**: Location services
- **expo-image-picker**: Image selection
- **react-native-maps**: Map display
- **react-native-google-places-autocomplete**: Location search

### **Internal Dependencies**
- **CrawlContext**: Crawl state management
- **UI Components**: Reusable crawl components
- **Database Utils**: Database operation helpers
- **Navigation**: Screen routing and transitions

---

**Last Updated**: Version 1.0.0
**Maintainer**: Crawl Team 
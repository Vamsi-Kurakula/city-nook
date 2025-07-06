# City Crawler - Refactored Codebase

## 🏗️ **New Project Structure**

The codebase has been completely refactored for better maintainability, scalability, and developer experience.

### **📁 Core Structure**

```
city_crawler/
├── components/
│   ├── navigation/           # Navigation components
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── screens/              # Screen components
│   │   ├── home/             # Home screen and related components
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── HomeHeader.tsx
│   │   │   ├── UpcomingCrawlsSection.tsx
│   │   │   ├── FeaturedCrawlsSection.tsx
│   │   │   └── hooks/        # Home screen custom hooks
│   │   │       ├── useHomeData.ts
│   │   │       └── useCrawlActions.ts
│   │   ├── CrawlDetailScreen.tsx
│   │   ├── CrawlSessionScreen.tsx
│   │   ├── CrawlLibrary.tsx
│   │   ├── PublicCrawls.tsx
│   │   ├── UserProfile.tsx
│   │   └── SignInScreen.tsx
│   ├── ui/                   # Reusable UI components
│   │   ├── stops/            # Stop type components
│   │   │   ├── StopComponent.tsx
│   │   │   ├── RiddleStop.tsx
│   │   │   ├── LocationStop.tsx
│   │   │   ├── PhotoStop.tsx
│   │   │   ├── ButtonStop.tsx
│   │   │   └── index.ts
│   │   ├── CrawlCard.tsx
│   │   ├── CrawlList.tsx
│   │   └── CrawlMap.tsx
│   ├── context/              # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── CrawlContext.tsx
│   ├── error/                # Error handling components
│   │   └── ErrorBoundary.tsx
│   └── auto-generated/       # Auto-generated utilities
│       ├── crawlAssetLoader.ts
│       └── ImageLoader.ts
├── utils/                    # Utility functions
│   ├── database/             # Database operations
│   │   ├── client.ts         # Supabase client
│   │   ├── types.ts          # Database types
│   │   ├── progressOperations.ts
│   │   ├── historyOperations.ts
│   │   ├── statsOperations.ts
│   │   └── index.ts
│   ├── answerValidation.ts
│   ├── clerk.ts
│   ├── config.ts
│   ├── coordinateExtractor.ts
│   ├── crawlStatus.ts
│   ├── featuredCrawlLoader.ts
│   └── publicCrawlLoader.ts
├── types/                    # TypeScript type definitions
│   ├── crawl.ts
│   ├── env.d.ts
│   └── navigation.ts
├── assets/                   # Static assets
│   ├── crawl-library/        # Library crawl assets
│   └── public-crawls/        # Public crawl assets
├── database/                 # Database schema and scripts
│   ├── schema.sql
│   └── deleteDatabase.sql
└── scripts/                  # Build and utility scripts
    ├── checkDatabaseSchema.js
    ├── generateCrawlAssetMap.js
    ├── generateImageMap.js
    └── runMigration.js
```

## 🔄 **Key Refactoring Changes**

### **1. HomeScreen Refactoring (923 → ~200 lines)**
- **Extracted Components:**
  - `HomeHeader.tsx` - Header with user profile
  - `UpcomingCrawlsSection.tsx` - Public crawls section
  - `FeaturedCrawlsSection.tsx` - Featured crawls section
- **Custom Hooks:**
  - `useHomeData.ts` - Data loading and state management
  - `useCrawlActions.ts` - Event handlers and navigation

### **2. StopComponents Refactoring (545 → ~100 lines each)**
- **Modular Stop Types:**
  - `RiddleStop.tsx` - Riddle-based stops
  - `LocationStop.tsx` - Location-based stops
  - `PhotoStop.tsx` - Photo-based stops
  - `ButtonStop.tsx` - Button-based stops
- **Orchestrator:**
  - `StopComponent.tsx` - Main component that routes to appropriate stop type

### **3. Database Operations Refactoring**
- **Organized by Domain:**
  - `client.ts` - Supabase client configuration
  - `types.ts` - Database type definitions
  - `progressOperations.ts` - Crawl progress operations
  - `historyOperations.ts` - Crawl history operations
  - `statsOperations.ts` - Statistics operations

### **4. Navigation Structure**
- **Separated Concerns:**
  - `AuthNavigator.tsx` - Handles authentication flow
  - `AppNavigator.tsx` - Main app navigation

## 🎯 **Benefits of Refactoring**

### **Maintainability**
- **Smaller Files:** Each component has a single responsibility
- **Clear Separation:** UI, logic, and data operations are separated
- **Reusable Components:** Stop types can be easily extended

### **Developer Experience**
- **Better Organization:** Related code is grouped together
- **Easier Testing:** Smaller components are easier to test
- **Type Safety:** Improved TypeScript organization

### **Performance**
- **Lazy Loading:** Components can be loaded on demand
- **Optimized Re-renders:** Smaller components reduce unnecessary re-renders
- **Better Caching:** Asset loading is more efficient

### **Scalability**
- **Easy Extension:** New stop types can be added easily
- **Modular Architecture:** Components can be developed independently
- **Clear Dependencies:** Import/export structure is well-defined

## 🚀 **Usage Examples**

### **Adding a New Stop Type**
```typescript
// 1. Create new stop component
// components/ui/stops/NewStopType.tsx

// 2. Add to StopComponent.tsx
case 'new_type':
  return <NewStopType {...props} />;

// 3. Export from index.ts
export { default as NewStopType } from './NewStopType';
```

### **Using Database Operations**
```typescript
// Before: import { supabase } from '../../utils/supabase';
// After: import { saveCrawlProgress } from '../../utils/database';

import { saveCrawlProgress, getCrawlStats } from '../../utils/database';
```

### **Using Custom Hooks**
```typescript
// Before: All logic in component
// After: Clean separation of concerns

import { useHomeData } from './hooks/useHomeData';
import { useCrawlActions } from './hooks/useCrawlActions';

const { featuredCrawls, loading } = useHomeData(userId, isLoading);
const { handleCrawlPress } = useCrawlActions();
```

## 📋 **Migration Checklist**

- [x] Break up large screen files
- [x] Extract reusable components
- [x] Create custom hooks for logic
- [x] Organize database operations
- [x] Update all imports
- [x] Create index files for clean exports
- [x] Update navigation structure
- [x] Document new structure

## 🔧 **Next Steps**

1. **Testing:** Add unit tests for new components
2. **Performance:** Implement React.memo for optimized re-renders
3. **Accessibility:** Add accessibility features to components
4. **Internationalization:** Prepare for multi-language support
5. **Error Boundaries:** Add error boundaries for each major section

---

**The refactored codebase is now more maintainable, scalable, and developer-friendly! 🎉** 
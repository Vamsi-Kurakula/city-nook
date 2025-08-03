# City Crawler

A React Native app for creating and participating in interactive city crawls with various stop types including riddles, locations, photos, and buttons.

## 🚀 Quick Start

### Environment Setup

1. Copy `env.template` to `.env`:
   ```bash
   cp env.template .env
   ```

2. Fill in your API keys in the `.env` file:
   ```
   CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

3. **Alternative**: You can also directly edit `utils/config.ts` and uncomment the development section to hardcode your values.

### Authentication Setup (Clerk)

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application and choose React Native
3. Enable Google OAuth in Social Connections:
   - Go to your Clerk dashboard
   - Navigate to User & Authentication > Social Connections
   - Enable Google OAuth
   - Add your Google OAuth credentials (Client ID and Client Secret)
4. Copy your publishable key from API Keys section
5. Add the key to your `.env` file or `utils/config.ts`

### Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Copy your project URL and anon key from Settings > API
4. Add the credentials to your `.env` file or `utils/config.ts`
5. Run the SQL schema in Supabase SQL Editor:
   - Open your Supabase dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Execute the SQL commands

### Install and Run

```bash
npm install
npm start
```

## 🚀 Production Deployment

### Environment Variables for EAS Builds

For production builds (App Store/Play Store), you need to configure environment variables in your Expo project:

1. **Set up environment variables in Expo:**
   ```bash
   # Go to your Expo project dashboard
   # Navigate to Settings > Environment Variables
   # Add the following variables:
   CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_production_anon_key
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

2. **Verify your configuration:**
   - The app now includes environment checking on startup
   - Check the console logs when running the app
   - Look for ✅ or ❌ indicators for each environment variable

3. **Build for production:**
   ```bash
   # For iOS App Store
   eas build --platform ios --profile production
   
   # For Android Play Store
   eas build --platform android --profile production
   ```

### Troubleshooting Production Issues

If your app works locally but not in production:

1. **Check environment variables:**
   - Ensure all required variables are set in Expo dashboard
   - Verify the values are correct (no typos)
   - Make sure you're using production keys, not development keys

2. **Verify database connection:**
   - Check that your Supabase project is active
   - Ensure RLS policies are properly configured
   - Verify your database schema is deployed

3. **Check authentication:**
   - Ensure Clerk is configured for production
   - Verify your Clerk publishable key is for production environment

4. **Debug with environment checker:**
   - The app now logs environment configuration on startup
   - Look for the "🔍 Checking environment configuration..." message
   - Check for any ❌ indicators in the console

### Image Storage Setup

For images to work in production:

1. **Set up Supabase Storage:**
   - Create a storage bucket in your Supabase project
   - Configure public access policies for hero images
   - Upload your images and get the public URLs

2. **Update database records:**
   - Ensure `hero_image_url` fields in `crawl_definitions` table point to valid Supabase Storage URLs
   - Format: `https://your-project.supabase.co/storage/v1/object/public/bucket-name/image.jpg`

## 🏗️ Project Structure

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
│   │   ├── CrawlContext.tsx
│   │   └── ThemeContext.tsx
│   ├── error/                # Error handling components
│   │   └── ErrorBoundary.tsx
│   └── auto-generated/       # Auto-generated utilities (legacy)
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
│   ├── config.ts             # Environment and feature flags
│   ├── coordinateExtractor.ts
│   ├── crawlStatus.ts
│   ├── featuredCrawlLoader.ts

│   └── theme.ts              # Theme system
├── types/                    # TypeScript type definitions
│   ├── crawl.ts
│   ├── env.d.ts
│   └── navigation.ts
├── assets/                   # Static assets (app icons, splash screens)
├── database/                 # Database schema and scripts
│   ├── schema.sql
│   └── deleteDatabase.sql
├── assets-source/            # Source crawl data and migration tools
│   ├── README.md
│   ├── migrateCrawlsFromFolders.js
│   └── [crawl folders]/
```

## 🎨 Features

### **Theme System**
- **Light/Dark Mode**: Automatic theme switching with consistent branding
- **Color Consistency**: All components follow the theme system
- **Accessibility**: Proper contrast ratios in both themes

### **Crawl Progress Tracking**
- **Real-time Progress**: Track current stop and completed stops
- **Database Persistence**: Progress is saved to Supabase
- **Home Screen Integration**: "Continue Crawling" section shows active crawls
- **Single Crawl Enforcement**: Users can only have one active crawl at a time

### **Stop Types**
- **Riddle Stops**: Answer questions to proceed
- **Location Stops**: Visit specific locations
- **Photo Stops**: Take photos to complete challenges
- **Button Stops**: Simple button interactions

### **Authentication**
- **Google OAuth**: Sign in with Google accounts
- **Session Management**: Automatic session handling
- **User Profiles**: User information and preferences

## 🔧 Feature Flags

The app includes a feature flag system for controlling experimental features and debugging:

```typescript
// utils/config.ts
export const FEATURE_FLAGS = {
  // Debug and Development Features
  SHOW_DEBUG_INFO: false, // Set to true to show debug information on home screen
  ENABLE_VERBOSE_LOGGING: false, // Set to true for detailed console logging
  
  // Experimental Features
  ENABLE_NEW_UI: false, // Set to true to enable new UI components
  ENABLE_ANALYTICS: false, // Set to true to enable analytics tracking
  
  // Performance Features
  ENABLE_CACHE: true, // Set to false to disable caching
  ENABLE_LAZY_LOADING: true, // Set to false to disable lazy loading
} as const;
```

### Using Feature Flags

```typescript
import { isFeatureEnabled } from '../../utils/config';

// Check if a feature is enabled
if (isFeatureEnabled('SHOW_DEBUG_INFO')) {
  // Show debug information
}
```

## 🔄 Key Refactoring Benefits

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

## 🚀 Usage Examples

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

## 🔒 Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already added to `.gitignore`
- Keep your API keys secure and rotate them regularly
- For development, you can hardcode values in `utils/config.ts` (but don't commit them)

## 📋 Migration Checklist

- [x] Break up large screen files
- [x] Extract reusable components
- [x] Create custom hooks for logic
- [x] Organize database operations
- [x] Update all imports
- [x] Create index files for clean exports
- [x] Update navigation structure
- [x] Document new structure
- [x] Implement theme system
- [x] Add feature flag system
- [x] Improve crawl progress tracking

## 🔧 Next Steps

1. **Testing:** Add unit tests for new components
2. **Performance:** Implement React.memo for optimized re-renders
3. **Accessibility:** Add accessibility features to components
4. **Internationalization:** Prepare for multi-language support
5. **Error Boundaries:** Add error boundaries for each major section

---

**The refactored codebase is now more maintainable, scalable, and developer-friendly! 🎉** 
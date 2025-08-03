import Constants from 'expo-constants';

// Environment Configuration with EXPO_PUBLIC_ prefix
// Using static references as recommended by Expo documentation
// This ensures proper inlining during the build process

// Client-side environment variables (accessible in app code)
// Using static process.env references for proper inlining
export const CLERK_PUBLISHABLE_KEY_CONFIG = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
export const SUPABASE_URL_CONFIG = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY_CONFIG = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const GOOGLE_MAPS_API_KEY_CONFIG = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Debug logging for environment variables
const logEnvironmentVariables = () => {
  console.log('🔍 Environment Variable Debug:');
  console.log('CLERK_PUBLISHABLE_KEY_CONFIG:', CLERK_PUBLISHABLE_KEY_CONFIG ? CLERK_PUBLISHABLE_KEY_CONFIG.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('SUPABASE_URL_CONFIG:', SUPABASE_URL_CONFIG ? SUPABASE_URL_CONFIG.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('SUPABASE_ANON_KEY_CONFIG:', SUPABASE_ANON_KEY_CONFIG ? SUPABASE_ANON_KEY_CONFIG.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('GOOGLE_MAPS_API_KEY_CONFIG:', GOOGLE_MAPS_API_KEY_CONFIG ? GOOGLE_MAPS_API_KEY_CONFIG.substring(0, 10) + '...' : 'NOT FOUND');
  
  // Log all available EXPO_PUBLIC_ variables
  const publicVars = Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC_'));
  console.log('Available EXPO_PUBLIC_ variables:', publicVars);
  
  // Log Expo Constants extra config
  console.log('Expo Constants extra keys:', Object.keys(Constants.expoConfig?.extra || {}));
};

// Run debug logging
logEnvironmentVariables();

// Server-side environment variables (for build scripts, migrations, etc.)
export const SUPABASE_SERVICE_KEY_CONFIG = process.env.SUPABASE_SERVICE_KEY;

// Validate required environment variables
const validateEnvironment = () => {
  const missingVars = [];
  
  if (!CLERK_PUBLISHABLE_KEY_CONFIG) {
    missingVars.push('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  
  if (!SUPABASE_URL_CONFIG) {
    missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  }
  
  if (!SUPABASE_ANON_KEY_CONFIG) {
    missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please ensure these are set in your .env file or Expo project environment variables.');
    
    // In production, log the error but don't crash the app
    if (!__DEV__) {
      console.error('Production build missing critical environment variables. App may not function properly.');
      // Don't throw an error - let the app try to start
    }
  }
};

// Run validation
validateEnvironment();

// Environment detection
export const isProduction = __DEV__ === false;
export const isDevelopment = __DEV__ === true;

// Security Configuration
export const SECURITY_CONFIG = {
  // Rate limiting settings
  MAX_API_CALLS_PER_MINUTE: 60,
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Input validation settings
  MAX_ANSWER_LENGTH: 500,
  MAX_USERNAME_LENGTH: 50,
  
  // Session settings
  SESSION_TIMEOUT_MINUTES: 60 * 24 * 7, // 7 days
  
  // Data retention settings
  DATA_RETENTION_DAYS: 365, // 1 year
  
  // Feature flags for security
  ENABLE_RATE_LIMITING: true,
  ENABLE_INPUT_VALIDATION: true,
  ENABLE_SECURE_STORAGE: true,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  // Debug and Development Features
  SHOW_DEBUG_INFO: isDevelopment, // Only show debug info in development
  ENABLE_VERBOSE_LOGGING: isDevelopment, // Only verbose logging in development
  
  // Experimental Features
  ENABLE_NEW_UI: false, // Set to true to enable new UI components
  ENABLE_ANALYTICS: isProduction, // Only enable analytics in production
  
  // Performance Features
  ENABLE_CACHE: true, // Set to false to disable caching
  ENABLE_LAZY_LOADING: true, // Set to false to disable lazy loading
  
  // Security Features
  ENABLE_CERTIFICATE_PINNING: isProduction, // Only in production
  ENABLE_NETWORK_SECURITY: isProduction, // Only in production
} as const;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

// Production API endpoints (if you have a backend)
export const API_ENDPOINTS = {
  BASE_URL: isProduction 
    ? 'https://api.citycrawler.app' 
    : 'http://localhost:3000',
  AUTH_ENDPOINT: '/auth',
  USER_ENDPOINT: '/user',
  CRAWL_ENDPOINT: '/crawl',
} as const;

 
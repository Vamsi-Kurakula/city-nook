import { CLERK_PUBLISHABLE_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Environment Configuration
export const CLERK_PUBLISHABLE_KEY_CONFIG = CLERK_PUBLISHABLE_KEY || '';
export const SUPABASE_URL_CONFIG = SUPABASE_URL || '';
export const SUPABASE_ANON_KEY_CONFIG = SUPABASE_ANON_KEY || '';

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

// Development Configuration (uncomment and modify for local development)
/*
export const CLERK_PUBLISHABLE_KEY = 'pk_test_your_actual_key_here';
export const SUPABASE_URL = 'https://your-project-id.supabase.co';
export const SUPABASE_ANON_KEY = 'your_actual_anon_key_here';
*/ 
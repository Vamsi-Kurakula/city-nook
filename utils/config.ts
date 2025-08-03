import Constants from 'expo-constants';

// Environment Configuration with better error handling
// Use Expo environment variables for builds and development
const getEnvVar = (expoKey: string): string => {
  // Try to get from Expo environment variables first
  const expoVar = Constants.expoConfig?.extra?.[expoKey];
  if (expoVar) {
    return expoVar;
  }
  
  // For local development, we'll need to handle this differently
  // since process.env doesn't work in React Native
  if (__DEV__) {
    console.warn(`Environment variable ${expoKey} not found in Expo config. Make sure it's set in your Expo dashboard or app.json.`);
  }
  
  return '';
};

export const CLERK_PUBLISHABLE_KEY_CONFIG = getEnvVar('clerkPublishableKey');
export const SUPABASE_URL_CONFIG = getEnvVar('supabaseUrl');
export const SUPABASE_ANON_KEY_CONFIG = getEnvVar('supabaseAnonKey');
export const GOOGLE_MAPS_API_KEY_CONFIG = getEnvVar('googleMapsApiKey');



// Validate required environment variables
const validateEnvironment = () => {
  const missingVars = [];
  
  if (!CLERK_PUBLISHABLE_KEY_CONFIG) {
    missingVars.push('CLERK_PUBLISHABLE_KEY');
  }
  
  if (!SUPABASE_URL_CONFIG) {
    missingVars.push('SUPABASE_URL');
  }
  
  if (!SUPABASE_ANON_KEY_CONFIG) {
    missingVars.push('SUPABASE_ANON_KEY');
  }
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please create a .env file with the required API keys. See env.template for reference.');
    
    // In production, we might want to show a user-friendly error
    if (!__DEV__) {
      // Instead of throwing an error, we'll log it and continue
      // This prevents the app from crashing immediately
      console.error('Production build missing environment variables, but continuing...');
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

 
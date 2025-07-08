// Environment Configuration
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Feature Flags
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

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

// Development Configuration (uncomment and modify for local development)
/*
export const CLERK_PUBLISHABLE_KEY = 'pk_test_your_actual_key_here';
export const SUPABASE_URL = 'https://your-project-id.supabase.co';
export const SUPABASE_ANON_KEY = 'your_actual_anon_key_here';
*/ 
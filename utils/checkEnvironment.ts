import { CLERK_PUBLISHABLE_KEY_CONFIG, SUPABASE_URL_CONFIG, SUPABASE_ANON_KEY_CONFIG, GOOGLE_MAPS_API_KEY_CONFIG } from './config';

/**
 * Utility to check if all required environment variables are properly configured
 * This can be called during app startup to verify configuration
 */
export const checkEnvironmentConfiguration = () => {
  console.log('🔍 Checking environment configuration...');
  
  const checks = [
    {
      name: 'CLERK_PUBLISHABLE_KEY',
      value: CLERK_PUBLISHABLE_KEY_CONFIG,
      isValid: (value: string) => value && value.startsWith('pk_'),
      required: true
    },
    {
      name: 'SUPABASE_URL',
      value: SUPABASE_URL_CONFIG,
      isValid: (value: string) => value && value.includes('supabase.co'),
      required: true
    },
    {
      name: 'SUPABASE_ANON_KEY',
      value: SUPABASE_ANON_KEY_CONFIG,
      isValid: (value: string) => value && value.startsWith('eyJ'),
      required: true
    },
    {
      name: 'GOOGLE_MAPS_API_KEY',
      value: GOOGLE_MAPS_API_KEY_CONFIG,
      isValid: (value: string) => value && value.length > 10,
      required: false
    }
  ];

  let allValid = true;
  const results: { name: string; status: '✅' | '❌' | '⚠️'; message: string }[] = [];

  checks.forEach(check => {
    if (!check.value) {
      if (check.required) {
        results.push({ name: check.name, status: '❌', message: 'Missing required environment variable' });
        allValid = false;
      } else {
        results.push({ name: check.name, status: '⚠️', message: 'Missing optional environment variable' });
      }
    } else if (!check.isValid(check.value)) {
      results.push({ name: check.name, status: '❌', message: 'Invalid format' });
      allValid = false;
    } else {
      results.push({ name: check.name, status: '✅', message: 'Valid' });
    }
  });

  // Log results
  console.log('📋 Environment Configuration Results:');
  results.forEach(result => {
    console.log(`${result.status} ${result.name}: ${result.message}`);
  });

  if (allValid) {
    console.log('🎉 All required environment variables are properly configured!');
  } else {
    console.log('🚨 Some environment variables are missing or invalid!');
    if (!__DEV__) {
      console.log('⚠️  This is a production build - the app may not function properly.');
    }
  }

  return { allValid, results };
};

/**
 * Get a summary of environment configuration for debugging
 */
export const getEnvironmentSummary = () => {
  return {
    isDevelopment: __DEV__,
    isProduction: !__DEV__,
    clerkKey: CLERK_PUBLISHABLE_KEY_CONFIG ? '✅ Set' : '❌ Missing',
    supabaseUrl: SUPABASE_URL_CONFIG ? '✅ Set' : '❌ Missing',
    supabaseKey: SUPABASE_ANON_KEY_CONFIG ? '✅ Set' : '❌ Missing',
    googleMapsKey: GOOGLE_MAPS_API_KEY_CONFIG ? '✅ Set' : '❌ Missing',
  };
}; 
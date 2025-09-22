// Environment configuration
export const ENV = {
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  
  // Supabase Database
  // Note: Supabase now uses new API key format (sb_publishable_ and sb_secret_ prefixes)
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, // Should contain sb_publishable_ key
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY, // Should contain sb_secret_ key
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
} as const;

// Validate required environment variables
export function validateEnvironment() {
  const required = [
    'CLERK_PUBLISHABLE_KEY',
    'SUPABASE_URL', 
    'SUPABASE_ANON_KEY'
  ];

  for (const key of required) {
    if (!ENV[key as keyof typeof ENV]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // Validate Supabase API key format
  if (ENV.SUPABASE_ANON_KEY && !ENV.SUPABASE_ANON_KEY.startsWith('sb_publishable_')) {
    console.warn('⚠️  Supabase ANON key should use new format (sb_publishable_ prefix). Update your API key from Supabase dashboard.');
  }

  if (ENV.SUPABASE_SERVICE_KEY && !ENV.SUPABASE_SERVICE_KEY.startsWith('sb_secret_')) {
    console.warn('⚠️  Supabase SERVICE key should use new format (sb_secret_ prefix). Update your API key from Supabase dashboard.');
  }

  // Optional warnings
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found - maps may not work properly');
  }

  console.log('✅ Environment variables validated successfully');
}

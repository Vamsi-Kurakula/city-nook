// Environment configuration
export const ENV = {
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  
  // Supabase Database
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
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

  // Optional warnings
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found - maps may not work properly');
  }

  console.log('✅ Environment variables validated successfully');
}

// Environment configuration
// This file now properly reads from the .env file using react-native-dotenv

import { CLERK_PUBLISHABLE_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const config = {
  CLERK_PUBLISHABLE_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
};

// Fallback for development (uncomment if you want to hardcode values)
/*
export const config = {
  CLERK_PUBLISHABLE_KEY: 'pk_test_your_actual_clerk_key_here',
  SUPABASE_URL: 'https://your-actual-project.supabase.co',
  SUPABASE_ANON_KEY: 'your_actual_supabase_anon_key_here',
};
*/ 
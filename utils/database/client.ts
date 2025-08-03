import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL_CONFIG, SUPABASE_ANON_KEY_CONFIG } from '../config';

// Check if environment variables are available
if (!SUPABASE_URL_CONFIG || !SUPABASE_ANON_KEY_CONFIG) {
  console.error('❌ CRITICAL: Supabase environment variables are not configured.');
  console.error('SUPABASE_URL:', SUPABASE_URL_CONFIG ? '✅ SET' : '❌ NOT SET');
  console.error('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY_CONFIG ? '✅ SET' : '❌ NOT SET');
  
  if (!__DEV__) {
    console.error('🚨 Production build detected - this will cause database connection failures!');
  }
}

// Validate Supabase URL format
const isValidSupabaseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co');
  } catch {
    return false;
  }
};

// Validate Supabase key format
const isValidSupabaseKey = (key: string) => {
  return key && key.length > 20 && key.startsWith('eyJ');
};

// Use actual environment variables or throw error in production
const supabaseUrl = SUPABASE_URL_CONFIG;
const supabaseKey = SUPABASE_ANON_KEY_CONFIG;

if (!supabaseUrl || !supabaseKey) {
  const errorMsg = 'Supabase environment variables are missing. Please configure them in your Expo project.';
  console.error('❌', errorMsg);
  
  if (!__DEV__) {
    // In production, we should fail fast
    throw new Error(errorMsg);
  }
}

if (!isValidSupabaseUrl(supabaseUrl)) {
  const errorMsg = `Invalid Supabase URL format: ${supabaseUrl}`;
  console.error('❌', errorMsg);
  
  if (!__DEV__) {
    throw new Error(errorMsg);
  }
}

if (!isValidSupabaseKey(supabaseKey)) {
  const errorMsg = 'Invalid Supabase key format';
  console.error('❌', errorMsg);
  
  if (!__DEV__) {
    throw new Error(errorMsg);
  }
}

// Base Supabase client (without auth)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Function to get Supabase client with Clerk authentication
export const getSupabaseClient = (token: string | undefined) => {
  if (token) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  }
  return supabase;
};

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error);
  } else {
    console.log('✅ Supabase connection test successful');
  }
}).catch(err => {
  console.error('❌ Supabase connection test error:', err);
}); 
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL_CONFIG, SUPABASE_ANON_KEY_CONFIG } from '../config';

// Check if environment variables are available
if (!SUPABASE_URL_CONFIG || !SUPABASE_ANON_KEY_CONFIG) {
  console.warn('Supabase environment variables are not configured. Database functionality will be limited.');
  console.warn('SUPABASE_URL:', SUPABASE_URL_CONFIG ? 'SET' : 'NOT SET');
  console.warn('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY_CONFIG ? 'SET' : 'NOT SET');
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

const supabaseUrl = SUPABASE_URL_CONFIG || 'https://placeholder.supabase.co';
const supabaseKey = SUPABASE_ANON_KEY_CONFIG || 'placeholder_key';

if (!isValidSupabaseUrl(supabaseUrl)) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
}

if (!isValidSupabaseKey(supabaseKey)) {
  console.error('Invalid Supabase key format');
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
    console.error('Supabase connection test failed:', error);
  } else {

  }
}).catch(err => {
  console.error('Supabase connection test error:', err);
}); 
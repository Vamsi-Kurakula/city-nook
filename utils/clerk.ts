import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';
import { CLERK_PUBLISHABLE_KEY_CONFIG as CLERK_PUBLISHABLE_KEY } from './config';

// Validate Clerk publishable key
const isValidClerkKey = (key: string) => {
  return key && key.length > 20 && (key.startsWith('pk_test_') || key.startsWith('pk_live_'));
};

if (!isValidClerkKey(CLERK_PUBLISHABLE_KEY)) {
  console.error('❌ CRITICAL: Invalid or missing Clerk publishable key');
  console.error('Key provided:', CLERK_PUBLISHABLE_KEY ? 'Yes but invalid format' : 'No key provided');
  console.error('Clerk key should start with pk_test_ or pk_live_');
  
  if (!__DEV__) {
    console.error('🚨 Production build detected - authentication will fail!');
  }
}

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('❌ Error getting token from secure store:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('❌ Error saving token to secure store:', err);
      return;
    }
  },
};

export { ClerkProvider, tokenCache }; 
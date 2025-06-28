import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';
import { config } from './config';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export { ClerkProvider, tokenCache };
export const CLERK_PUBLISHABLE_KEY = config.CLERK_PUBLISHABLE_KEY; 
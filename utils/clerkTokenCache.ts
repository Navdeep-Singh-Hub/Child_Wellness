import type { TokenCache } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const CLERK_TOKEN_KEY = 'clerk_token_cache';

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      const json = await SecureStore.getItemAsync(`${CLERK_TOKEN_KEY}:${key}`);
      if (!json) return null;
      const parsed = JSON.parse(json) as { token: string; expiresAt: number } | null;
      if (!parsed) return null;
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        await SecureStore.deleteItemAsync(`${CLERK_TOKEN_KEY}:${key}`);
        return null;
      }
      return parsed.token;
    } catch {
      return null;
    }
  },
  async saveToken(key: string, token: string, expiresInSeconds?: number) {
    try {
      const expiresAt = expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : 0;
      const payload = JSON.stringify({ token, expiresAt });
      await SecureStore.setItemAsync(`${CLERK_TOKEN_KEY}:${key}`, payload, {
        keychainService: `${CLERK_TOKEN_KEY}:service`,
      });
    } catch {
      // ignore
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(`${CLERK_TOKEN_KEY}:${key}`);
    } catch {
      // ignore
    }
  },
};

export default tokenCache;



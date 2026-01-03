/**
 * Profile Completion Cache
 * Caches profile completion status to avoid unnecessary API calls
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PROFILE_CACHE_KEY = 'profile_completion_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface ProfileCache {
  isComplete: boolean;
  timestamp: number;
  firstName?: string;
  dob?: string;
  phoneNumber?: string;
}

/**
 * Get cached profile completion status
 */
export async function getCachedProfileStatus(): Promise<ProfileCache | null> {
  try {
    if (Platform.OS === 'web') {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!cached) return null;
      const data: ProfileCache = JSON.parse(cached);
      // Check if cache is still valid (not expired)
      if (Date.now() - data.timestamp < CACHE_DURATION_MS) {
        return data;
      }
      // Cache expired, remove it
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    } else {
      const cached = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      if (!cached) return null;
      const data: ProfileCache = JSON.parse(cached);
      // Check if cache is still valid
      if (Date.now() - data.timestamp < CACHE_DURATION_MS) {
        return data;
      }
      // Cache expired, remove it
      await SecureStore.deleteItemAsync(PROFILE_CACHE_KEY);
      return null;
    }
  } catch (error) {
    console.warn('Error reading profile cache:', error);
    return null;
  }
}

/**
 * Cache profile completion status
 */
export async function setCachedProfileStatus(
  isComplete: boolean,
  profile?: { firstName?: string; dob?: string; phoneNumber?: string }
): Promise<void> {
  try {
    const cache: ProfileCache = {
      isComplete,
      timestamp: Date.now(),
      firstName: profile?.firstName,
      dob: profile?.dob,
      phoneNumber: profile?.phoneNumber,
    };

    if (Platform.OS === 'web') {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
    } else {
      await SecureStore.setItemAsync(PROFILE_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.warn('Error setting profile cache:', error);
  }
}

/**
 * Clear profile cache (call when profile is updated)
 */
export async function clearProfileCache(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    } else {
      await SecureStore.deleteItemAsync(PROFILE_CACHE_KEY);
    }
  } catch (error) {
    console.warn('Error clearing profile cache:', error);
  }
}

/**
 * Check if profile is complete based on cached or provided data
 */
export function isProfileComplete(profile: {
  firstName?: string;
  dob?: string | null;
  phoneNumber?: string;
}): boolean {
  const hasMinPhone = (p: string | undefined) =>
    String(p || '').replace(/\D/g, '').length >= 10;
  return !!(profile.firstName && profile.dob && hasMinPhone(profile.phoneNumber));
}


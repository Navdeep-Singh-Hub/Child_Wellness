import { Platform } from 'react-native';

const FALLBACK_BASE = Platform.select({
  ios: 'http://192.168.1.3:4000',     // Physical iOS device
  android: 'http://192.168.1.3:4000', // Physical Android device
  default: 'http://localhost:4000', // Default to localhost for web
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || FALLBACK_BASE!;

// Debug log to verify API URL
console.log('API_BASE_URL =', process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_BASE);
console.log('Platform.OS =', Platform.OS);
console.log('FALLBACK_BASE =', FALLBACK_BASE);

// For physical devices, set EXPO_PUBLIC_API_BASE_URL to your laptop's IP address:
// EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:4000

let tokenProvider: null | (() => Promise<string | undefined>) = null;

export function setTokenProvider(provider: () => Promise<string | undefined>) {
  tokenProvider = provider;
}

// Test network connectivity
export async function testNetworkConnectivity() {
  try {
    console.log('🔍 Testing network connectivity to:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/test`, {
      method: 'GET',
      timeout: 5000,
    });
    console.log('✅ Network test response:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Network test failed:', error);
    return false;
  }
}

export async function authHeaders(opts?: { multipart?: boolean }) {
  const token = tokenProvider ? await tokenProvider().catch(() => undefined) : undefined;
  const headers: Record<string, string> = {};
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  // ONLY set JSON for non-multipart calls
  if (!opts?.multipart) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  }
  
  return headers;
}

export async function fetchMyStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/me/stats`, {
      headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    throw new Error(`Failed to load stats from ${API_BASE_URL} (${e?.message || 'network error'})`);
  }
}

export async function recordGame(pointsEarned: number) {
  try {
    console.log(`Attempting to POST to: ${API_BASE_URL}/api/games/record`);
    const headers = await authHeaders();
    console.log('Auth headers:', headers);
    
    const res = await fetch(`${API_BASE_URL}/api/games/record`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ xp: pointsEarned, coins: 1 }),
    });
    
    console.log('Response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.log('Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    return await res.json();
  } catch (e: any) {
    console.error('recordGame error:', e);
    throw new Error(`Failed to record game to ${API_BASE_URL} (${e?.message || 'network error'})`);
  }
}

export async function startTapRound() {
  const res = await fetch(`${API_BASE_URL}/api/tap/start`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${text}`);
  return JSON.parse(text) as { roundId: string; targetSeconds: number };
}

export async function finishTapRound(roundId: string) {
  const res = await fetch(`${API_BASE_URL}/api/tap/finish`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ roundId }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${text}`);
  return JSON.parse(text) as {
    pointsAwarded: number;
    deltaMs: number;
    targetSeconds: number;
    stats: { points: number; streakDays: number; totalGamesPlayed: number };
  };
}

export async function ensureUser() {
  try {
    console.log(`Attempting to POST to: ${API_BASE_URL}/api/users/ensure`);
    const headers = await authHeaders();
    console.log('Auth headers:', headers);
    
    const res = await fetch(`${API_BASE_URL}/api/users/ensure`, {
      method: 'POST',
      headers,
    });
    
    console.log('Response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.log('Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    return await res.json();
  } catch (e: any) {
    console.error('ensureUser error:', e);
    throw new Error(`Failed to ensure user at ${API_BASE_URL} (${e?.message || 'network error'})`);
  }
}

export type Profile = { firstName: string; lastName?: string; email: string; dob: string | null; gender: string | null };

export async function getMyProfile(): Promise<Profile> {
  const res = await fetch(`${API_BASE_URL}/api/me/profile`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const p = await res.json();
  return { 
    firstName: p.firstName || '', 
    lastName: p.lastName || '', 
    email: p.email || '', 
    dob: p.dob ? new Date(p.dob).toISOString().slice(0,10) : null,
    gender: p.gender || null
  };
}

export async function updateMyProfile(data: { firstName: string; lastName?: string; dob?: string; gender?: string }) {
  try {
    console.log('updateMyProfile called with data:', data);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    const headers = await authHeaders();
    console.log('Auth headers:', headers);
    
    const url = `${API_BASE_URL}/api/me/profile`;
    console.log('Making POST request to:', url);
    
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const result = await res.json();
    console.log('Response data:', result);
    return result;
  } catch (e: any) {
    console.error('updateMyProfile error:', e);
    throw e;
  }
}

// Helper function for authenticated requests
async function authedFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await authHeaders();
  
  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
  
  return res.json();
}

// Favorites API
export async function getFavorites(): Promise<{ favorites: string[] }> {
  return authedFetch('/api/me/favorites', { method: 'GET' });
}

export async function toggleFavorite(tileId: string): Promise<{ isFavorite: boolean; favorites: string[] }> {
  return authedFetch('/api/me/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ tileId }),
  });
}

// Custom Tiles API
export type CustomTile = { id: string; label: string; emoji?: string; imageUrl?: string };

export async function getCustomTiles(): Promise<{ tiles: CustomTile[] }> {
  return authedFetch('/api/me/custom-tiles', { method: 'GET' });
}

export async function addCustomTile(tile: CustomTile): Promise<{ tile: CustomTile }> {
  return authedFetch('/api/me/custom-tiles', {
    method: 'POST',
    body: JSON.stringify(tile),
  });
}

export async function deleteCustomTile(id: string): Promise<{ ok: true }> {
  return authedFetch(`/api/me/custom-tiles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}



import { Platform } from 'react-native';

const FALLBACK_BASE = Platform.select({
  ios: 'http://localhost:4000',    // iOS simulator
  android: 'http://192.168.113.220:4000', // Android device - your actual LAN IP
  default: 'http://192.168.113.220:4000', // Default to your actual LAN IP
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || FALLBACK_BASE!;

// Debug log to verify API URL
console.log('API_BASE_URL =', process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_BASE);

let tokenProvider: null | (() => Promise<string | undefined>) = null;

export function setTokenProvider(provider: () => Promise<string | undefined>) {
  tokenProvider = provider;
}

export async function authHeaders() {
  const token = tokenProvider ? await tokenProvider().catch(() => undefined) : undefined;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // For testing without auth, we'll just return basic headers
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



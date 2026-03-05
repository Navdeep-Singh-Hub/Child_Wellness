/**
 * Admin Analytics API client.
 * All requests require admin auth (x-auth0-id must be in backend ADMIN_AUTH0_IDS).
 */

import { API_BASE_URL } from './api';
import { authHeaders } from './api';

const ADMIN_PREFIX = `${API_BASE_URL}/api/admin/analytics`;

/** Returns { isAdmin: true } if current user is in ADMIN_AUTH0_IDS, else { isAdmin: false }. */
export async function getAdminCheck(auth0IdOverride?: string): Promise<{ isAdmin: boolean }> {
  const headers = await authHeaders();
  if (auth0IdOverride) headers['x-auth0-id'] = auth0IdOverride;
  const res = await fetch(`${ADMIN_PREFIX}/check`, { headers });
  if (res.ok) return { isAdmin: true };
  return { isAdmin: false };
}

async function adminFetch(path: string, params?: Record<string, string>) {
  const url = params
    ? `${ADMIN_PREFIX}${path}?${new URLSearchParams(params)}`
    : `${ADMIN_PREFIX}${path}`;
  const res = await fetch(url, { headers: await authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Admin API ${res.status}`);
  }
  return res.json();
}

async function adminPatch(path: string, body: object) {
  const headers = await authHeaders();
  const res = await fetch(`${ADMIN_PREFIX}${path}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Admin API ${res.status}`);
  }
  return res.json();
}

export async function getAdminOverview() {
  return adminFetch('/overview');
}

export async function getAdminUsers(params?: { page?: string; limit?: string; search?: string }) {
  const q: Record<string, string> = {};
  if (params?.page) q.page = params.page;
  if (params?.limit) q.limit = params.limit;
  if (params?.search) q.search = params.search;
  return adminFetch('/users', Object.keys(q).length ? q : undefined);
}

export async function getAdminUserJourney(userId: string) {
  return adminFetch(`/users/${userId}/journey`);
}

export async function updateAdminUserProfile(
  userId: string,
  data: { firstName?: string; lastName?: string; dob?: string; gender?: string; phoneCountryCode?: string; phoneNumber?: string }
) {
  return adminPatch(`/users/${encodeURIComponent(userId)}/profile`, data);
}

export async function getAdminTimeTracking(params?: { range?: string; userId?: string }) {
  const q: Record<string, string> = {};
  if (params?.range) q.range = params.range;
  if (params?.userId) q.userId = params.userId;
  return adminFetch('/time', Object.keys(q).length ? q : undefined);
}

export async function getAdminGamePerformance(params?: { range?: string; userId?: string }) {
  const q: Record<string, string> = {};
  if (params?.range) q.range = params.range;
  if (params?.userId) q.userId = params.userId;
  return adminFetch('/games', Object.keys(q).length ? q : undefined);
}

export async function getAdminTherapyProgress(params?: { userId?: string }) {
  const q: Record<string, string> = {};
  if (params?.userId) q.userId = params.userId;
  return adminFetch('/therapy-progress', Object.keys(q).length ? q : undefined);
}

export async function getAdminReports(params?: { range?: string; userId?: string; therapy?: string }) {
  const q: Record<string, string> = {};
  if (params?.range) q.range = params.range;
  if (params?.userId) q.userId = params.userId;
  if (params?.therapy) q.therapy = params.therapy;
  return adminFetch('/reports', Object.keys(q).length ? q : undefined);
}

export async function getAdminInsights(params?: { range?: string; userId?: string }) {
  const q: Record<string, string> = {};
  if (params?.range) q.range = params.range;
  if (params?.userId) q.userId = params.userId;
  return adminFetch('/insights', Object.keys(q).length ? q : undefined);
}

export async function clearAdminCache() {
  const res = await fetch(`${ADMIN_PREFIX}/cache/clear`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear cache');
  return res.json();
}

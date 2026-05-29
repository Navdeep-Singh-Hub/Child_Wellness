import type { LipAnalyticsRecord, LipGameId } from './types';

const KEY = '@lip_closure_analytics';
const memory = new Map<string, LipAnalyticsRecord>();

function read(gameId: LipGameId): LipAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    averageHoldTime: 0,
    successfulClosures: 0,
    attemptCount: 0,
    fatigueSignals: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipGameId, data: LipAnalyticsRecord) {
  const k = `${KEY}:${gameId}`;
  memory.set(k, data);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(k, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }
}

export async function loadLipAnalytics(gameId: LipGameId): Promise<LipAnalyticsRecord> {
  return read(gameId);
}

export async function saveLipAnalytics(gameId: LipGameId, patch: Partial<LipAnalyticsRecord>) {
  const prev = read(gameId);
  const successes = patch.successfulClosures ?? prev.successfulClosures;
  let averageHoldTime = prev.averageHoldTime;
  if (patch.averageHoldTime != null && successes > 0) {
    averageHoldTime =
      (prev.averageHoldTime * Math.max(0, prev.successfulClosures) + patch.averageHoldTime) /
      Math.max(1, successes);
  }
  const next: LipAnalyticsRecord = {
    ...prev,
    ...patch,
    averageHoldTime,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

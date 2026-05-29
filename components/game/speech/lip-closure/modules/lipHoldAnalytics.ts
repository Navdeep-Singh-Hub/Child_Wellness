import type { LipHoldAnalyticsRecord, LipHoldGameId } from './lipHoldTypes';

const KEY = '@lip_hold_analytics';
const memory = new Map<string, LipHoldAnalyticsRecord>();

function read(gameId: LipHoldGameId): LipHoldAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipHoldAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    averageStability: 0,
    holdDuration: 0,
    microBreaks: 0,
    attemptCount: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipHoldGameId, data: LipHoldAnalyticsRecord) {
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

export async function saveLipHoldAnalytics(
  gameId: LipHoldGameId,
  patch: Partial<LipHoldAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let averageStability = prev.averageStability;
  if (patch.averageStability != null && attempts > 0) {
    averageStability =
      (prev.averageStability * Math.max(0, prev.attemptCount - 1) + patch.averageStability) /
      Math.max(1, attempts);
  }
  const next: LipHoldAnalyticsRecord = {
    ...prev,
    ...patch,
    averageStability,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

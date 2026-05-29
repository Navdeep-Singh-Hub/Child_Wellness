import type { LipSpreadAnalyticsRecord, LipSpreadGameId } from './lipSpreadTypes';

const KEY = '@lip_spread_analytics';
const memory = new Map<string, LipSpreadAnalyticsRecord>();

function read(gameId: LipSpreadGameId): LipSpreadAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipSpreadAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    averageSpread: 0,
    holdDuration: 0,
    attemptCount: 0,
    microBreaks: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipSpreadGameId, data: LipSpreadAnalyticsRecord) {
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

export async function saveLipSpreadAnalytics(
  gameId: LipSpreadGameId,
  patch: Partial<LipSpreadAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let averageSpread = prev.averageSpread;
  if (patch.averageSpread != null && attempts > 0) {
    averageSpread =
      (prev.averageSpread * Math.max(0, prev.attemptCount - 1) + patch.averageSpread) /
      Math.max(1, attempts);
  }
  const next: LipSpreadAnalyticsRecord = {
    ...prev,
    ...patch,
    averageSpread,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

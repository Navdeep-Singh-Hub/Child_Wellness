import type { LipRoundAnalyticsRecord, LipRoundGameId } from './lipRoundTypes';

const KEY = '@lip_round_analytics';
const memory = new Map<string, LipRoundAnalyticsRecord>();

function read(gameId: LipRoundGameId): LipRoundAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipRoundAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    averageRoundness: 0,
    holdDuration: 0,
    attemptCount: 0,
    microBreaks: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipRoundGameId, data: LipRoundAnalyticsRecord) {
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

export async function saveLipRoundAnalytics(
  gameId: LipRoundGameId,
  patch: Partial<LipRoundAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let averageRoundness = prev.averageRoundness;
  if (patch.averageRoundness != null && attempts > 0) {
    averageRoundness =
      (prev.averageRoundness * Math.max(0, prev.attemptCount - 1) + patch.averageRoundness) /
      Math.max(1, attempts);
  }
  const next: LipRoundAnalyticsRecord = {
    ...prev,
    ...patch,
    averageRoundness,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

import type { LipCoordinationAnalyticsRecord, LipCoordinationGameId } from './lipCoordinationTypes';

const KEY = '@lip_coordination_analytics';
const memory = new Map<string, LipCoordinationAnalyticsRecord>();

function read(gameId: LipCoordinationGameId): LipCoordinationAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipCoordinationAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    coordinationScore: 0,
    timingAccuracy: 0,
    sequenceCompletionRate: 0,
    attemptCount: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipCoordinationGameId, data: LipCoordinationAnalyticsRecord) {
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

export async function saveLipCoordinationAnalytics(
  gameId: LipCoordinationGameId,
  patch: Partial<LipCoordinationAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let coordinationScore = prev.coordinationScore;
  if (patch.coordinationScore != null && attempts > 0) {
    coordinationScore =
      (prev.coordinationScore * Math.max(0, prev.attemptCount - 1) + patch.coordinationScore) /
      Math.max(1, attempts);
  }
  const next: LipCoordinationAnalyticsRecord = {
    ...prev,
    ...patch,
    coordinationScore,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

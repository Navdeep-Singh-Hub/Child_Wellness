import type {
  FunctionalSequenceAnalyticsRecord,
  FunctionalSequenceGameId,
} from './functionalSequenceTypes';

const KEY = '@lip_functional_sequence_analytics';
const memory = new Map<string, FunctionalSequenceAnalyticsRecord>();

function read(gameId: FunctionalSequenceGameId): FunctionalSequenceAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as FunctionalSequenceAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    sequenceCompletionRate: 0,
    transitionSmoothness: 0,
    attemptCount: 0,
    fatigueIndicators: 0,
    holdPerformance: 0,
    coordinationScore: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: FunctionalSequenceGameId, data: FunctionalSequenceAnalyticsRecord) {
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

export async function saveFunctionalSequenceAnalytics(
  gameId: FunctionalSequenceGameId,
  patch: Partial<FunctionalSequenceAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let coordinationScore = prev.coordinationScore;
  if (patch.coordinationScore != null && attempts > 0) {
    coordinationScore =
      (prev.coordinationScore * Math.max(0, prev.attemptCount - 1) + patch.coordinationScore) /
      Math.max(1, attempts);
  }
  const next: FunctionalSequenceAnalyticsRecord = {
    ...prev,
    ...patch,
    coordinationScore,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

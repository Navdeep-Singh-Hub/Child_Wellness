import type { LipTransitionAnalyticsRecord, LipTransitionGameId } from './lipTransitionTypes';

const KEY = '@lip_transition_analytics';
const memory = new Map<string, LipTransitionAnalyticsRecord>();

function read(gameId: LipTransitionGameId): LipTransitionAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipTransitionAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    transitionSuccessRate: 0,
    averageTransitionSpeed: 0,
    attemptCount: 0,
    microBreaks: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipTransitionGameId, data: LipTransitionAnalyticsRecord) {
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

export async function saveLipTransitionAnalytics(
  gameId: LipTransitionGameId,
  patch: Partial<LipTransitionAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let transitionSuccessRate = prev.transitionSuccessRate;
  if (patch.transitionSuccessRate != null && attempts > 0) {
    transitionSuccessRate =
      (prev.transitionSuccessRate * Math.max(0, prev.attemptCount - 1) + patch.transitionSuccessRate) /
      Math.max(1, attempts);
  }
  const next: LipTransitionAnalyticsRecord = {
    ...prev,
    ...patch,
    transitionSuccessRate,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

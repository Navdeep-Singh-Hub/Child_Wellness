import type { BilabialPrepAnalyticsRecord, BilabialPrepGameId } from './lipBilabialTypes';

const KEY = '@lip_bilabial_analytics';
const memory = new Map<string, BilabialPrepAnalyticsRecord>();

function read(gameId: BilabialPrepGameId): BilabialPrepAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as BilabialPrepAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    bilabialAttempts: 0,
    successfulEvents: 0,
    averageTiming: 0,
    microBreaks: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: BilabialPrepGameId, data: BilabialPrepAnalyticsRecord) {
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

export async function saveBilabialPrepAnalytics(
  gameId: BilabialPrepGameId,
  patch: Partial<BilabialPrepAnalyticsRecord>,
) {
  const prev = read(gameId);
  const successes = patch.successfulEvents ?? prev.successfulEvents;
  let averageTiming = prev.averageTiming;
  if (patch.averageTiming != null && successes > 0) {
    averageTiming =
      (prev.averageTiming * Math.max(0, prev.successfulEvents - 1) + patch.averageTiming) /
      Math.max(1, successes);
  }
  const next: BilabialPrepAnalyticsRecord = {
    ...prev,
    ...patch,
    averageTiming,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

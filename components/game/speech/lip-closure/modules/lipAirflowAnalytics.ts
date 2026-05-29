import type { LipAirflowAnalyticsRecord, LipAirflowGameId } from './lipAirflowTypes';

const KEY = '@lip_airflow_analytics';
const memory = new Map<string, LipAirflowAnalyticsRecord>();

function read(gameId: LipAirflowGameId): LipAirflowAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipAirflowAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    airflowDuration: 0,
    averageAirflowStrength: 0,
    stabilityScore: 0,
    attemptCount: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipAirflowGameId, data: LipAirflowAnalyticsRecord) {
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

export async function saveLipAirflowAnalytics(
  gameId: LipAirflowGameId,
  patch: Partial<LipAirflowAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let averageAirflowStrength = prev.averageAirflowStrength;
  if (patch.averageAirflowStrength != null && attempts > 0) {
    averageAirflowStrength =
      (prev.averageAirflowStrength * Math.max(0, prev.attemptCount - 1) + patch.averageAirflowStrength) /
      Math.max(1, attempts);
  }
  const next: LipAirflowAnalyticsRecord = {
    ...prev,
    ...patch,
    averageAirflowStrength,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

import type { LipResistanceAnalyticsRecord, LipResistanceGameId } from './lipResistanceTypes';

const KEY = '@lip_resistance_analytics';
const memory = new Map<string, LipResistanceAnalyticsRecord>();

function read(gameId: LipResistanceGameId): LipResistanceAnalyticsRecord {
  const k = `${KEY}:${gameId}`;
  if (memory.has(k)) return memory.get(k)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as LipResistanceAnalyticsRecord;
    } catch {
      /* ignore */
    }
  }
  return {
    averageHoldTime: 0,
    stabilityScore: 0,
    attemptCount: 0,
    microBreaks: 0,
    fatigueIndicators: 0,
    lastUpdated: Date.now(),
  };
}

function write(gameId: LipResistanceGameId, data: LipResistanceAnalyticsRecord) {
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

export async function saveLipResistanceAnalytics(
  gameId: LipResistanceGameId,
  patch: Partial<LipResistanceAnalyticsRecord>,
) {
  const prev = read(gameId);
  const attempts = patch.attemptCount ?? prev.attemptCount;
  let averageHoldTime = prev.averageHoldTime;
  if (patch.averageHoldTime != null && attempts > 0) {
    averageHoldTime =
      (prev.averageHoldTime * Math.max(0, prev.attemptCount - 1) + patch.averageHoldTime) /
      Math.max(1, attempts);
  }
  let stabilityScore = prev.stabilityScore;
  if (patch.stabilityScore != null && attempts > 0) {
    stabilityScore =
      (prev.stabilityScore * Math.max(0, prev.attemptCount - 1) + patch.stabilityScore) /
      Math.max(1, attempts);
  }
  const next: LipResistanceAnalyticsRecord = {
    ...prev,
    ...patch,
    averageHoldTime,
    stabilityScore,
    lastUpdated: Date.now(),
  };
  write(gameId, next);
  return next;
}

/**
 * Helpers for OT Level 3 Session 6 jump / double-tap games.
 */

import type { DifficultyTier } from '@/components/game/occupational/level3/session6/session6Pacing';
import { jumpNumberWeightTwo } from '@/components/game/occupational/level3/session6/session6Pacing';

export type TapGrade = 'perfect' | 'good' | 'miss';

export const rhythmMatches = (
  taps: number[],
  expectedMs: number,
  toleranceMs: number,
  beatCount = 2,
) => {
  if (taps.length !== beatCount) return false;
  for (let i = 1; i < taps.length; i += 1) {
    const interval = taps[i]! - taps[i - 1]!;
    if (Math.abs(interval - expectedMs) > toleranceMs) return false;
  }
  return true;
};

export const scoreDoubleTap = (intervalMs: number, maxMs: number): { ok: boolean; score: number } => {
  if (intervalMs > maxMs) return { ok: false, score: 0 };
  const ratio = intervalMs / maxMs;
  if (ratio <= 0.55) return { ok: true, score: 100 };
  if (ratio <= 0.75) return { ok: true, score: 85 };
  return { ok: true, score: 70 };
};

export const randomJumpNumber = (tier: DifficultyTier = 2) => {
  const weightTwo = jumpNumberWeightTwo(tier);
  if (Math.random() < weightTwo) return 2;
  return Math.random() < 0.5 ? 1 : 3;
};

export const tapGradeFromScore = (score: number): TapGrade => {
  if (score >= 95) return 'perfect';
  if (score >= 75) return 'good';
  return 'miss';
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

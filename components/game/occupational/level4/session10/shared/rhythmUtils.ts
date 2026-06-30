/**
 * Helpers for OT Level 4 Session 10 rhythm games.
 */

export { useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';

export type ClapStep = 'left' | 'right';
export type ShoulderStep = 'right-to-left' | 'left-to-right';
export type MusicStep = 'left-hand' | 'right-hand' | 'both-hands';
export type SideStep = 'left' | 'right';
export type RhythmStep = ClapStep | ShoulderStep | MusicStep | SideStep;

export type UserBeat<T extends string = string> = { time: number; step: T };

export const validateSteps = <T extends string>(
  expected: readonly T[],
  actual: UserBeat<T>[],
): boolean => {
  if (actual.length !== expected.length) return false;
  return actual.every((beat, i) => beat.step === expected[i]);
};

/** Interval-based timing — forgiving first-beat delay (matches Level 3 rhythm games). */
export const validatePatternTiming = (
  actual: UserBeat<string>[],
  beatMs: number,
  toleranceMs: number,
): boolean => {
  if (actual.length <= 1) return true;
  for (let i = 1; i < actual.length; i++) {
    const interval = actual[i].time - actual[i - 1].time;
    if (Math.abs(interval - beatMs) > toleranceMs) return false;
  }
  return true;
};

export const validatePattern = <T extends string>(
  expected: readonly T[],
  actual: UserBeat<T>[],
  beatMs: number,
  toleranceMs: number,
): boolean => validateSteps(expected, actual) && validatePatternTiming(actual, beatMs, toleranceMs);

export const speedBeatMs = (round: number, initial: number, min: number, decrease: number) =>
  Math.max(min, initial - (round - 1) * decrease);

export const speedToleranceMs = (beatMs: number, pct: number) => beatMs * pct;

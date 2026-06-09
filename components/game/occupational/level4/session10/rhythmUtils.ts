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

export const validatePattern = <T extends string>(
  expected: readonly T[],
  actual: UserBeat<T>[],
  beatMs: number,
  toleranceMs: number,
): boolean => {
  if (actual.length !== expected.length) return false;
  for (let i = 0; i < expected.length; i++) {
    const expectedTime = i * beatMs;
    if (Math.abs(actual[i].time - expectedTime) > toleranceMs) return false;
    if (actual[i].step !== expected[i]) return false;
  }
  return true;
};

export const speedBeatMs = (round: number, initial: number, min: number, decrease: number) =>
  Math.max(min, initial - (round - 1) * decrease);

export const speedToleranceMs = (beatMs: number, pct: number) => beatMs * pct;

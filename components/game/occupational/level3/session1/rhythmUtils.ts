/**
 * Rhythm helpers for OT Level 3 Session 1 — Musical Jungle Adventure.
 */
import { playSound } from '@/utils/soundPlayer';
import { SESSION1_PACING as P } from '@/components/game/occupational/level3/session1/session1Pacing';

export type Instrument = 'drum' | 'bell' | 'clap';
export type VolumeKind = 'loud' | 'soft';
export type TimingGrade = 'perfect' | 'good' | 'miss';

export const INSTRUMENTS: Instrument[] = ['drum', 'bell', 'clap'];

export const bpmToInterval = (bpm: number) => (60 / bpm) * 1000;

export const bpmForRound = (round: number): number => {
  const levels = P.beatMatchBpmLevels;
  return levels[Math.min(round - 1, levels.length - 1)] ?? 120;
};

export const gradeTiming = (deltaMs: number): TimingGrade => {
  const abs = Math.abs(deltaMs);
  if (abs <= P.timingPerfectMs) return 'perfect';
  if (abs <= P.timingGoodMs) return 'good';
  return 'miss';
};

export const playInstrument = (inst: Instrument, volume = 0.8) => {
  playSound(inst as 'drum' | 'bell' | 'clap', volume, 1.0).catch(() => {});
};

export const randomInstrument = (): Instrument =>
  INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)]!;

export const randomVolumePattern = (len: number): VolumeKind[] =>
  Array.from({ length: len }, () => (Math.random() > 0.5 ? 'loud' : 'soft'));

/** Build echo pattern of N beats (unit = 1 beat spacing). */
export const buildEchoPattern = (beatCount: number): number[] =>
  Array.from({ length: beatCount }, () => 1);

export const patternMatches = (
  taps: number[],
  pattern: number[],
  baseMs: number,
  toleranceRatio: number,
): boolean => {
  if (taps.length !== pattern.length) return false;
  for (let i = 1; i < taps.length; i++) {
    const expected = pattern[i - 1]! * baseMs;
    const actual = taps[i]! - taps[i - 1]!;
    if (Math.abs(actual - expected) > baseMs * toleranceRatio) return false;
  }
  return true;
};

export const lerp = (min: number, max: number, t: number) => min + (max - min) * t;

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

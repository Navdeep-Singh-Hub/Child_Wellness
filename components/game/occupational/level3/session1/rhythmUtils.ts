/**
 * Rhythm helpers for OT Level 3 Session 1 drum games.
 */
import { playSound } from '@/utils/soundPlayer';

export type Instrument = 'drum' | 'bell' | 'clap';
export type VolumeKind = 'loud' | 'soft';

export const INSTRUMENTS: Instrument[] = ['drum', 'bell', 'clap'];

export const BEAT_PATTERNS: number[][] = [
  [1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 0.5, 1, 0.5, 1],
  [1, 1, 0.5, 1, 1],
  [1, 0.5, 1, 1, 0.5, 1],
];

export const bpmToInterval = (bpm: number) => (60 / bpm) * 1000;

export const bpmForRound = (round: number, total: number, initial: number, final: number) =>
  initial + ((final - initial) * (round - 1)) / Math.max(1, total - 1);

export const playInstrument = (inst: Instrument, volume = 0.8) => {
  playSound(inst, volume, 1.0).catch(() => {});
};

export const randomInstrument = (): Instrument =>
  INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)]!;

export const randomVolumePattern = (len: number): VolumeKind[] =>
  Array.from({ length: len }, () => (Math.random() > 0.5 ? 'loud' : 'soft'));

export const patternMatches = (taps: number[], pattern: number[], baseMs: number, toleranceRatio: number) => {
  if (taps.length !== pattern.length) return false;
  for (let i = 1; i < taps.length; i++) {
    const expected = pattern[i - 1]! * baseMs;
    const actual = taps[i]! - taps[i - 1]!;
    if (Math.abs(actual - expected) > baseMs * toleranceRatio) return false;
  }
  return true;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

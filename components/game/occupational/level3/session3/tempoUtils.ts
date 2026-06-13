/**
 * Tempo & rhythm helpers for OT Level 3 Session 3.
 */
import { playSound } from '@/utils/soundPlayer';
import {
  SESSION3_PACING,
  bpmToInterval,
  type MusicTempo,
  type PaceLevel,
  type TrafficLight,
} from '@/components/game/occupational/level3/session3/session3Pacing';

export type TempoGrade = 'perfect' | 'good' | 'miss' | 'early' | 'late';
export type SpeedKind = 'fast' | 'slow';

export { bpmToInterval, bpmForRound } from '@/components/game/occupational/level3/session3/session3Pacing';

export const gradeTapTiming = (deltaMs: number): TempoGrade => {
  const abs = Math.abs(deltaMs);
  if (deltaMs < -SESSION3_PACING.timingPerfectMs) return 'early';
  if (abs <= SESSION3_PACING.timingPerfectMs) return 'perfect';
  if (abs <= SESSION3_PACING.timingGoodMs) return 'good';
  if (deltaMs > SESSION3_PACING.timingLateMs) return 'late';
  return 'miss';
};

export const playDrumBeat = (volume = 0.8) => {
  playSound('drum', volume, 1.0).catch(() => {});
};

export const randomSpeed = (): SpeedKind => (Math.random() > 0.5 ? 'fast' : 'slow');

export const paceDuration = (pace: PaceLevel) => SESSION3_PACING.paceDurations[pace];

export const paceLabel = (pace: PaceLevel) => {
  const map: Record<PaceLevel, string> = {
    verySlow: 'Very Slow',
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
    veryFast: 'Very Fast',
  };
  return map[pace];
};

export const trafficLabel = (light: TrafficLight) => {
  if (light === 'green') return 'GO FAST!';
  if (light === 'yellow') return 'GO SLOW!';
  return 'STOP!';
};

export const musicTempoLabel = (tempo: MusicTempo) => {
  if (tempo === 'slow') return 'Slow music';
  if (tempo === 'medium') return 'Medium tempo';
  return 'Fast music!';
};

export const swipeMatchesMusic = (
  swipeMs: number,
  distance: number,
  tempo: MusicTempo,
): boolean => {
  if (distance < SESSION3_PACING.minSwipeDistance) return false;
  const range = SESSION3_PACING.musicTempoSwipe[tempo];
  return swipeMs >= range.minMs && swipeMs <= range.maxMs;
};

export const swipeMatchesTraffic = (
  swipeMs: number,
  distance: number,
  light: TrafficLight,
): boolean => {
  if (distance < SESSION3_PACING.minSwipeDistance) return false;
  if (light === 'red') return false;
  if (light === 'green') return swipeMs <= SESSION3_PACING.trafficGreenFastMs;
  return swipeMs >= SESSION3_PACING.trafficYellowSlowMinMs;
};

export const dragPaceMatches = (elapsedMs: number, targetMs: number, tolerance: number) =>
  Math.abs(elapsedMs - targetMs) <= tolerance;

export const tapIntervalTooFast = (intervalMs: number, bpm: number) =>
  intervalMs < bpmToInterval(bpm) * 0.65;

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

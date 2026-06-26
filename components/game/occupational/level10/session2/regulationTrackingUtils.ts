/**
 * Regulation-through-movement scoring for OT Level 10 Session 2.
 */
import type { SensoryBodySample } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { movementSmoothness } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export function breathBodySignal(sample: SensoryBodySample): number | null {
  const wrists = [sample.leftWrist, sample.rightWrist].filter((p): p is Point => Boolean(p));
  if (wrists.length > 0) {
    return wrists.reduce((sum, p) => sum + p.y, 0) / wrists.length;
  }
  if (sample.nose) return sample.nose.y;
  if (sample.shoulderMid) return sample.shoulderMid.y;
  return null;
}

/** Positive delta means body moved upward on screen. */
export function breathVerticalDelta(baselineY: number, currentY: number): number {
  return baselineY - currentY;
}

export function breathSyncScore(
  phase: BreathPhase,
  phaseProgress: number,
  baselineY: number,
  currentY: number | null,
  range: number,
): number {
  if (currentY == null) return 0.35;
  const delta = breathVerticalDelta(baselineY, currentY);
  const actual = clamp01(delta / range);

  if (phase === 'inhale') {
    return clamp01(1 - Math.abs(actual - phaseProgress) * 1.75);
  }
  if (phase === 'exhale') {
    const expected = 1 - phaseProgress;
    return clamp01(1 - Math.abs(actual - expected) * 1.75);
  }
  if (phase === 'hold' || phase === 'rest') {
    const drift = Math.abs(delta) / (range * 0.4);
    return clamp01(1 - drift);
  }
  return 0.5;
}

export function balloonScaleForPhase(
  phase: BreathPhase,
  progress: number,
  minScale: number,
  maxScale: number,
): number {
  const p = clamp01(progress);
  if (phase === 'inhale') return minScale + (maxScale - minScale) * p;
  if (phase === 'hold') return maxScale;
  if (phase === 'exhale') return maxScale - (maxScale - minScale) * p;
  return minScale;
}

export function regulationQualityScore(
  sync: number,
  postureQ: number,
  smoothness: number,
  attention: number,
  phase: BreathPhase,
): number {
  const phaseWeight = phase === 'hold' || phase === 'rest' ? 0.38 : 0.48;
  return clamp01(sync * phaseWeight + postureQ * 0.28 + smoothness * 0.14 + attention * 0.1);
}

export function steadinessFromMotion(prev: Point | null, cur: Point | null): number {
  return movementSmoothness(prev, cur, 0.06);
}

export function engagementFromBreathSync(sync: number, phase: BreathPhase): number {
  if (phase === 'rest') return 0.55 + sync * 0.25;
  return 0.45 + sync * 0.55;
}

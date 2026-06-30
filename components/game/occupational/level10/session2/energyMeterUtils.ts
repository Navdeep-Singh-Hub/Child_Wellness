import type { SensoryBodySample } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { EnergyRound } from '@/components/game/occupational/level10/session2/energyMeterTheme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Map per-tick motion to instantaneous body energy 0..1. */
export function motionToEnergy(motion: number, maxMotion: number): number {
  return clamp01(motion / maxMotion);
}

/** Smoothed rolling average of recent energy samples. */
export function smoothEnergy(samples: number[]): number {
  if (samples.length === 0) return 0;
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}

export function energyMatchScore(current: number, target: number, tolerance: number): number {
  const diff = Math.abs(current - target);
  if (diff <= tolerance) return clamp01(1 - diff / tolerance);
  return clamp01(Math.max(0, 0.35 - (diff - tolerance) * 1.2));
}

export function isEnergyMatched(current: number, target: number, tolerance: number): boolean {
  return Math.abs(current - target) <= tolerance;
}

export function energyQualityScore(
  match: number,
  postureQ: number,
  attention: number,
  smoothness: number,
): number {
  return clamp01(match * 0.5 + postureQ * 0.22 + smoothness * 0.16 + attention * 0.12);
}

export function wristBoostEnergy(sample: SensoryBodySample, baseEnergy: number): number {
  const wrists = [sample.leftWrist, sample.rightWrist].filter(Boolean);
  if (wrists.length === 0) return baseEnergy;
  return clamp01(baseEnergy * 0.7 + 0.15);
}

export function roundTargetLabel(round: EnergyRound): string {
  return `${Math.round(round.target * 100)}%`;
}

/**
 * Sensory Explorer — movement math using absolute normalized coordinates.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import type { SensoryOrbTarget } from '@/components/game/occupational/level10/session1/session1Pacing';

export type SensoryBodySample = {
  present: boolean;
  /** Primary explorer cursor (nose / head). */
  cursor: Point | null;
  nose: Point | null;
  leftWrist: Point | null;
  rightWrist: Point | null;
  shoulderMid: Point | null;
  headYaw: number;
  headPitch: number;
  stabilityScore: number;
  postureQuality: number;
  attentionScore: number;
  trackingSource: 'vision' | 'pose' | 'none';
};

export const distNorm = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

export function inOrbZone(cursor: Point | null, target: SensoryOrbTarget): boolean {
  if (!cursor) return false;
  return distNorm(cursor, { x: target.x, y: target.y }) <= target.radius;
}

export function holdProgressMs(holdMs: number, requiredMs: number): number {
  return Math.max(0, Math.min(1, holdMs / Math.max(1, requiredMs)));
}

/** Smoothness 0..1 — lower jitter = higher score. */
export function movementSmoothness(prev: Point | null, cur: Point | null, maxJump = 0.12): number {
  if (!prev || !cur) return 0.5;
  const d = distNorm(prev, cur);
  return Math.max(0, Math.min(1, 1 - d / maxJump));
}

export function adaptiveResponseScore(
  inZone: boolean,
  holdPct: number,
  postureQ: number,
  smoothness: number,
  attention: number,
): number {
  const zone = inZone ? 0.45 : 0;
  const hold = holdPct * 0.3;
  const posture = postureQ * 0.12;
  const smooth = smoothness * 0.08;
  const attn = attention * 0.05;
  return Math.max(0, Math.min(1, zone + hold + posture + smooth + attn));
}

export function engagementFromMotion(motion: number, expected = 0.08): number {
  return Math.max(0, Math.min(1, motion / expected));
}

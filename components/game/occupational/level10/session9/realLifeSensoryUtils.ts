/**
 * OT Level 10 · Session 9 — Real-Life Sensory Challenges shared scoring.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inRealLifeZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function realLifeSensoryQuality(
  entering: boolean,
  participating: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'enter' | 'participate',
): number {
  const ent = phase === 'enter' && entering ? 0.26 : entering ? 0.1 : 0.05;
  const part = phase === 'participate' && participating ? 0.32 : participating ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const attn = attention * 0.12;
  return clamp01(ent + part + hold + postureQ * 0.1 + attn + smoothness * 0.08);
}

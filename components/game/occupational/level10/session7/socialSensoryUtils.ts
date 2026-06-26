/**
 * OT Level 10 · Session 7 — Social Sensory Adventures shared scoring.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inSocialZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function socialSensoryQuality(
  approaching: boolean,
  greeting: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'approach' | 'greet',
): number {
  const app = phase === 'approach' && approaching ? 0.26 : approaching ? 0.1 : 0.05;
  const grt = phase === 'greet' && greeting ? 0.32 : greeting ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const attn = attention * 0.12;
  return clamp01(app + grt + hold + postureQ * 0.1 + attn + smoothness * 0.08);
}

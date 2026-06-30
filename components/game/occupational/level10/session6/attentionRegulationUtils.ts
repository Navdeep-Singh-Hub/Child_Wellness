/**
 * OT Level 10 · Session 6 — Attention & Regulation shared scoring.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inAttentionZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function attentionRegulationQuality(
  seeking: boolean,
  focused: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'seek' | 'focus',
): number {
  const seek = phase === 'seek' && seeking ? 0.26 : seeking ? 0.1 : 0.05;
  const foc = phase === 'focus' && focused ? 0.32 : focused ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const attn = attention * 0.12;
  return clamp01(seek + foc + hold + postureQ * 0.1 + attn + smoothness * 0.08);
}

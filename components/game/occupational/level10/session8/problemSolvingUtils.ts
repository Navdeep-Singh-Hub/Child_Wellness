/**
 * OT Level 10 · Session 8 — Sensory Problem Solving shared scoring.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inProblemZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function problemSolvingQuality(
  trying: boolean,
  adapting: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'try' | 'adapt',
): number {
  const tr = phase === 'try' && trying ? 0.26 : trying ? 0.1 : 0.05;
  const ad = phase === 'adapt' && adapting ? 0.32 : adapting ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const attn = attention * 0.12;
  return clamp01(tr + ad + hold + postureQ * 0.1 + attn + smoothness * 0.08);
}

export function problemSolverQuality(
  tryOk: boolean,
  adaptOk: boolean,
  solveOk: boolean,
  holdPct: number,
  smoothness: number,
  postureQ: number,
  attention: number,
  phase: 'try' | 'adapt' | 'solve',
): number {
  const tr = phase === 'try' && tryOk ? 0.28 : tryOk ? 0.1 : 0.05;
  const ad = phase === 'adapt' && adaptOk ? 0.3 : adaptOk ? 0.1 : 0.04;
  const sol = phase === 'solve' && solveOk ? 0.28 : solveOk ? 0.1 : 0.04;
  const hold = holdPct * 0.16;
  const still = phase === 'adapt' ? smoothness * 0.1 : smoothness * 0.06;
  return clamp01(tr + ad + sol + hold + still + postureQ * 0.08 + attention * 0.1);
}

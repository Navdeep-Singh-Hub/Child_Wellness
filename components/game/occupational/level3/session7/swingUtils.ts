/**
 * Gesture & motion helpers for OT Level 3 Session 7 swing games.
 */

import type { DifficultyTier } from '@/components/game/occupational/level3/session7/session7Pacing';

export type SwingDir = 'left' | 'right';
export type DiagonalDir = 'ne' | 'se' | 'sw' | 'nw';
export type TimingGrade = 'perfect' | 'good' | 'late' | 'miss';

export const normalizeAngleDelta = (delta: number) => {
  let d = delta;
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

export const swipeDistance = (dx: number, dy: number) => Math.sqrt(dx * dx + dy * dy);

export const diagonalArrow = (dir: DiagonalDir) => {
  const map: Record<DiagonalDir, string> = { ne: '↗️', se: '↘️', sw: '↙️', nw: '↖️' };
  return map[dir];
};

export const isDiagonalSwipe = (
  dx: number,
  dy: number,
  minDist: number,
  minRatio = 0.32,
): { ok: boolean; dir: DiagonalDir | null; score: number } => {
  const dist = swipeDistance(dx, dy);
  if (dist < minDist) return { ok: false, dir: null, score: 0 };
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (adx < dist * minRatio || ady < dist * minRatio) return { ok: false, dir: null, score: 0 };
  const dir: DiagonalDir = dx > 0 ? (dy > 0 ? 'se' : 'ne') : dy > 0 ? 'sw' : 'nw';
  const balance = Math.min(adx, ady) / Math.max(adx, ady);
  const score = Math.round(70 + balance * 30);
  return { ok: true, dir, score };
};

export const scorePeakTiming = (sincePeakMs: number, windowMs: number): { grade: TimingGrade; score: number } => {
  const half = windowMs / 2;
  if (sincePeakMs <= half * 0.45) return { grade: 'perfect', score: 100 };
  if (sincePeakMs <= half * 0.85) return { grade: 'good', score: 82 };
  if (sincePeakMs <= half) return { grade: 'late', score: 55 };
  return { grade: 'miss', score: 0 };
};

export const onBeat = (now: number, lastBeat: number, intervalMs: number, toleranceMs: number) => {
  const since = (now - lastBeat) % intervalMs;
  const diff = Math.min(since, intervalMs - since);
  return diff <= toleranceMs;
};

export const scoreBeatTiming = (diffMs: number, toleranceMs: number) =>
  Math.max(0, Math.round(100 - (diffMs / toleranceMs) * 40));

export const scoreCircleProgress = (progress: number, minRequired: number) => {
  if (progress < minRequired) return 0;
  return Math.round(75 + (progress - minRequired) / (1 - minRequired) * 25);
};

export const buildVineSequence = (swings: number, tier: DifficultyTier): DiagonalDir[] => {
  const pool: DiagonalDir[] = tier >= 3 ? ['ne', 'nw', 'se', 'sw'] : ['ne', 'se'];
  const seq: DiagonalDir[] = [];
  for (let i = 0; i < swings; i += 1) {
    seq.push(pool[i % pool.length]!);
  }
  return seq;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

/**
 * OT Level 7 · Session 6 — Visual-Vestibular Integration
 * Tracking-while-moving helpers built on Level 6 head-tracking + balance math.
 */
export {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  headCursor,
  targetPath,
  trunkMotion,
  trunkStability,
  uprightScore,
  weightBalanceScore,
  type HeadTargetPattern,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';

import {
  trunkStability,
  uprightScore,
  weightBalanceScore,
  type HeadTargetPattern,
  type PostureBaseline,
  type PostureMetrics,
  type Point,
} from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Head-cursor movement smoothness 0..1 (1 = very smooth tracking). */
export function cursorSmoothness(prev: Point | null, cur: Point, maxJerk = 0.08): number {
  if (!prev) return 1;
  const jerk = Math.hypot(cur.x - prev.x, cur.y - prev.y);
  return clamp01(1 - jerk / maxJerk);
}

/**
 * Visual-vestibular integration quality: blends eye/head tracking accuracy with
 * dynamic balance, trunk stability, smooth tracking and upright posture — the
 * core of tracking a moving target while staying balanced.
 */
export function visualVestibularQuality(
  trackAcc: number,
  trunkMotionVal: number,
  m: PostureMetrics,
  base: PostureBaseline,
  cursorJerk: number,
): number {
  if (!m.present) return 0;
  const trunk = trunkStability(trunkMotionVal);
  const balance = weightBalanceScore(m, base);
  const smooth = clamp01(1 - cursorJerk / 0.08);
  const up = uprightScore(m, base);
  return clamp01(trackAcc * 0.4 + balance * 0.22 + trunk * 0.16 + smooth * 0.12 + up * 0.1);
}

/** Per-mode ordered list of follow patterns cycled across rounds. */
export const ROCKET_PATTERNS: HeadTargetPattern[] = ['horizontal', 'diagonal', 'horizontal', 'diagonal'];
export const BUTTERFLY_PATTERNS: HeadTargetPattern[] = ['wander', 'circle', 'wander', 'circle'];
export const BALLOON_PATTERNS: HeadTargetPattern[] = ['vertical', 'diagonal', 'vertical', 'wander'];
export const UFO_PATTERNS: HeadTargetPattern[] = ['wander', 'wander', 'circle', 'wander', 'diagonal'];
export const ORBIT_PATTERNS: HeadTargetPattern[] = ['circle', 'diagonal', 'circle', 'diagonal', 'circle'];

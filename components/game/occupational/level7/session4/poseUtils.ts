/**
 * OT Level 7 · Session 4 — Rotational Processing
 * Rotation, stop-recovery and head-pointing detection on Level 6 pose math.
 */
export {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  headCursor,
  swayStillness,
  trunkMotion,
  trunkStability,
  turnProxy,
  weightBalanceScore,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';

import {
  headCursor,
  swayStillness,
  turnProxy,
  weightBalanceScore,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type RotCue = 'turn90' | 'turn180' | 'stop' | 'spin' | 'orbitLeft' | 'orbitRight' | 'orbitBehind';

export type RotRound =
  | { type: 'cue'; cue: RotCue }
  | { type: 'spinStop' }
  | { type: 'turnPoint'; turn: 'turn90' | 'turn180'; point: Point };

export const ROT_CUE_INFO: Record<RotCue, { label: string; cue: string; emoji: string }> = {
  turn90: { label: 'TURN 90°', cue: 'Turn slowly a quarter turn!', emoji: '↪️' },
  turn180: { label: 'TURN AROUND', cue: 'Turn all the way around — slow and controlled!', emoji: '🔄' },
  stop: { label: 'STOP!', cue: 'Freeze! Stop turning and balance!', emoji: '✋' },
  spin: { label: 'SPIN SLOWLY', cue: 'Spin slowly like a tornado — controlled!', emoji: '🌀' },
  orbitLeft: { label: 'ORBIT LEFT', cue: 'Turn left to catch the star!', emoji: '⭐' },
  orbitRight: { label: 'ORBIT RIGHT', cue: 'Turn right to catch the star!', emoji: '⭐' },
  orbitBehind: { label: 'ORBIT BEHIND', cue: 'Turn around to catch the star behind you!', emoji: '⭐' },
};

export const ORBIT_STAR_POS: Record<'left' | 'right' | 'behind', Point> = {
  left: { x: 0.14, y: 0.42 },
  right: { x: 0.86, y: 0.42 },
  behind: { x: 0.5, y: 0.38 },
};

export const TORNADO_SEQ: RotCue[] = ['turn90', 'stop', 'turn90', 'stop', 'turn180', 'stop', 'turn90', 'stop'];

export const HELICOPTER_SEQ: RotCue[] = ['orbitLeft', 'orbitRight', 'turn180', 'orbitLeft', 'orbitRight', 'turn180'];

export const ORBIT_HUNT_SEQ: RotCue[] = [
  'orbitLeft',
  'orbitRight',
  'orbitBehind',
  'orbitLeft',
  'orbitRight',
  'orbitBehind',
  'orbitLeft',
];

export const TURN_POINT_ROUNDS: Extract<RotRound, { type: 'turnPoint' }>[] = [
  { type: 'turnPoint', turn: 'turn90', point: { x: 0.18, y: 0.44 } },
  { type: 'turnPoint', turn: 'turn180', point: { x: 0.5, y: 0.32 } },
  { type: 'turnPoint', turn: 'turn90', point: { x: 0.82, y: 0.44 } },
  { type: 'turnPoint', turn: 'turn180', point: { x: 0.5, y: 0.28 } },
  { type: 'turnPoint', turn: 'turn90', point: { x: 0.22, y: 0.5 } },
  { type: 'turnPoint', turn: 'turn90', point: { x: 0.78, y: 0.5 } },
];

/** Slow controlled spin in progress. */
export function spinActive(turn: number, motion: number, turnMin: number, motionMin: number): boolean {
  return turn >= turnMin * 0.65 || (motion >= motionMin && turn >= turnMin * 0.4);
}

/** Stop command — body still with recovered balance. */
export function stopMatched(motion: number, balance: number, stillMin: number, balanceMin: number): boolean {
  return swayStillness(motion) >= stillMin && balance >= balanceMin;
}

/** Head cursor near a point target (turn & point phase). */
export function pointMatched(cursor: Point, target: Point, tol = 0.2): boolean {
  return Math.hypot(cursor.x - target.x, cursor.y - target.y) <= tol;
}

/** Body rotation cue match. */
export function rotCueMatched(
  cue: RotCue,
  turn: number,
  motion: number,
  balance: number,
  turn90Min: number,
  turn180Min: number,
  spinMotionMin: number,
  stopStillMin: number,
  balanceMin: number,
): boolean {
  switch (cue) {
    case 'turn90':
      return turn >= turn90Min && turn < turn180Min && balance >= balanceMin * 0.8;
    case 'turn180':
    case 'orbitBehind':
      return turn >= turn180Min && balance >= balanceMin * 0.75;
    case 'orbitLeft':
      return turn >= turn90Min * 0.85 && turn < turn180Min && balance >= balanceMin * 0.78;
    case 'orbitRight':
      return turn >= turn90Min * 0.85 && turn < turn180Min && balance >= balanceMin * 0.78;
    case 'stop':
      return stopMatched(motion, balance, stopStillMin, balanceMin);
    case 'spin':
      return spinActive(turn, motion, turn90Min, spinMotionMin);
  }
}

export function orbitStarPos(cue: RotCue): Point | null {
  if (cue === 'orbitLeft') return ORBIT_STAR_POS.left;
  if (cue === 'orbitRight') return ORBIT_STAR_POS.right;
  if (cue === 'orbitBehind') return ORBIT_STAR_POS.behind;
  return null;
}

/** Composite rotational processing quality. */
export function rotationalQuality(
  matched: boolean,
  balance: number,
  m: PostureMetrics,
  base: PostureBaseline,
  motion: number,
  trunkOk: number,
): number {
  if (!m.present) return 0;
  const bal = weightBalanceScore(m, base);
  const still = swayStillness(motion);
  return clamp01((matched ? 0.45 : 0) + bal * 0.25 + still * 0.15 + trunkOk * 0.1 + balance * 0.05);
}

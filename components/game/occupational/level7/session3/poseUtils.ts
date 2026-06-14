/**
 * OT Level 7 · Session 3 — Direction Changes
 * Vestibular direction-change detection built on Level 6 weight-shift & turn math.
 */
export {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  shiftZone,
  swayStillness,
  turnProxy,
  weightBalanceScore,
  weightShift,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
  type ShiftDir,
} from '@/components/game/occupational/level6/session1/poseUtils';

import { shiftZone, weightBalanceScore, type Point, type PostureBaseline, type PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type DirCue = 'left' | 'right' | 'center' | 'turn90' | 'turn180';

export const DIR_CUE_INFO: Record<DirCue, { label: string; cue: string; emoji: string }> = {
  left: { label: 'GO LEFT', cue: 'Move or shift to the left!', emoji: '⬅️' },
  right: { label: 'GO RIGHT', cue: 'Move or shift to the right!', emoji: '➡️' },
  center: { label: 'CENTER', cue: 'Return to center — balance in the middle!', emoji: '⬆️' },
  turn90: { label: 'TURN 90°', cue: 'Turn your body a quarter turn!', emoji: '↪️' },
  turn180: { label: 'TURN AROUND', cue: 'Turn all the way around — 180 degrees!', emoji: '🔄' },
};

/** Scripted arrow sequence for Follow The Arrow. */
export const FOLLOW_ARROW_SEQ: DirCue[] = ['left', 'right', 'center', 'left', 'turn90', 'right', 'center', 'turn180', 'left'];

/** Pirate treasure hunt directions. */
export const PIRATE_HUNT_SEQ: DirCue[] = ['left', 'right', 'left', 'turn90', 'right', 'turn180', 'left'];

/** Turn Around Quest — alternating 90° and 180° turns. */
export const TURN_QUEST_SEQ: DirCue[] = ['turn90', 'turn180', 'turn90', 'turn180', 'turn90', 'turn180'];

/** Whether a direction cue maps to a lateral weight-shift target. */
export function shiftTargetOf(cue: DirCue): ShiftDir | null {
  if (cue === 'left' || cue === 'right' || cue === 'center') return cue;
  return null;
}

/** Detect if the child's pose matches the active direction cue. */
export function dirCueMatched(
  cue: DirCue,
  ws: Point,
  turn: number,
  balance: number,
  stepTol: number,
  balanceMin: number,
  turn90Min: number,
  turn180Min: number,
): boolean {
  switch (cue) {
    case 'left':
    case 'right':
    case 'center':
      return shiftZone(ws.x, stepTol) === cue && balance >= balanceMin;
    case 'turn90':
      return turn >= turn90Min && turn < turn180Min && balance >= balanceMin * 0.82;
    case 'turn180':
      return turn >= turn180Min && balance >= balanceMin * 0.78;
  }
}

/** Composite direction-change quality for AI scoring. */
export function directionChangeQuality(
  matched: boolean,
  balance: number,
  m: PostureMetrics,
  base: PostureBaseline,
  motion: number,
): number {
  if (!m.present) return 0;
  const still = clamp01(1 - motion / 0.1);
  const bal = weightBalanceScore(m, base);
  const matchScore = matched ? 1 : 0;
  return clamp01(matchScore * 0.45 + bal * 0.35 + still * 0.1 + balance * 0.1);
}

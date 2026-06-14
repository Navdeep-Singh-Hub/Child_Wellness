/**
 * OT Level 7 · Session 2 — Head Movement & Vestibular Activation
 * Vestibular-focused scoring helpers built on Level 6 head-tracking math.
 */
export {
  averageBaseline,
  DEFAULT_BASELINE,
  dirZone,
  EMPTY_METRICS,
  headCursor,
  headPitchRaw,
  headYawRaw,
  HEAD_DIR_LABEL,
  targetPath,
  trunkMotion,
  trunkStability,
  uprightScore,
  type HeadDir,
  type HeadTargetPattern,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';

import { trunkStability, uprightScore, type PostureBaseline, type PostureMetrics, type Point } from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Cursor movement smoothness 0..1 (1 = very smooth head tracking). */
export function cursorSmoothness(prev: Point | null, cur: Point, maxJerk = 0.08): number {
  if (!prev) return 1;
  const jerk = Math.hypot(cur.x - prev.x, cur.y - prev.y);
  return clamp01(1 - jerk / maxJerk);
}

/**
 * Vestibular head-movement quality: blends tracking accuracy, trunk stability,
 * upright posture and smooth cursor motion.
 */
export function vestibularHeadQuality(
  trackAcc: number,
  trunkMotionVal: number,
  m: PostureMetrics,
  base: PostureBaseline,
  cursorJerk: number,
): number {
  if (!m.present) return 0;
  const trunk = trunkStability(trunkMotionVal);
  const smoothScore = clamp01(1 - cursorJerk / 0.08);
  const up = uprightScore(m, base);
  return clamp01(trackAcc * 0.4 + trunk * 0.25 + smoothScore * 0.2 + up * 0.15);
}

/** Treasure spots in the sky for Look Up Explorer rounds. */
export const SKY_TREASURE_SPOTS: Point[] = [
  { x: 0.22, y: 0.13 },
  { x: 0.5, y: 0.1 },
  { x: 0.78, y: 0.13 },
  { x: 0.35, y: 0.12 },
  { x: 0.65, y: 0.11 },
];

/** Left/right search sequence for Turn & Find. */
export const TURN_SEARCH_SEQUENCE = ['left', 'right', 'left', 'right', 'left', 'right'] as const;

export type TurnDir = (typeof TURN_SEARCH_SEQUENCE)[number];

export const TURN_DIR_LABEL: Record<TurnDir, { label: string; cue: string; emoji: string }> = {
  left: { label: 'TURN LEFT', cue: 'Turn your head left to find the target!', emoji: '👈' },
  right: { label: 'TURN RIGHT', cue: 'Turn your head right to find the target!', emoji: '👉' },
};

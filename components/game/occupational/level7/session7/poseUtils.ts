/**
 * OT Level 7 · Session 7 — Balance Reactions
 * Re-uses Level 6 dynamic-balance pose math with reaction-focused sequences.
 */
export {
  averageBaseline,
  DEFAULT_BASELINE,
  DYNAMIC_ACTION_INFO,
  EMPTY_METRICS,
  frameMotionFull,
  shiftZone,
  swayStillness,
  turnProxy,
  weightBalanceScore,
  weightShift,
  type DynamicAction,
  type PostureBaseline,
  type PostureMetrics,
  type ShiftDir,
} from '@/components/game/occupational/level6/session1/poseUtils';

import type { DynamicAction } from '@/components/game/occupational/level6/session1/poseUtils';

/** Freeze Balance — move freely, then freeze on the danger signal (reaction). */
export const FREEZE_BALANCE_SEQ: DynamicAction[] = ['go', 'stop', 'go', 'stop', 'go', 'stop', 'go', 'stop'];

/** Wave Rider — shift weight side to side to ride the rolling waves. */
export const WAVE_RIDER_SEQ: DynamicAction[] = ['left', 'right', 'center', 'left', 'right', 'left', 'right', 'center'];

/** Surf Challenge — sudden, unpredictable direction changes + recoveries. */
export const SURF_CHALLENGE_SEQ: DynamicAction[] = ['right', 'left', 'stop', 'right', 'turn', 'left', 'stop', 'center', 'right', 'left'];

/** Obstacle Balance — step around obstacles while staying in control. */
export const OBSTACLE_BALANCE_SEQ: DynamicAction[] = ['left', 'steady', 'right', 'steady', 'center', 'left', 'steady', 'right'];

/** Recovery Master — integrated grand finale across all reaction skills. */
export const RECOVERY_MASTER_SEQ: DynamicAction[] = ['go', 'stop', 'left', 'turn', 'right', 'stop', 'steady', 'center', 'go', 'stop', 'left', 'right'];

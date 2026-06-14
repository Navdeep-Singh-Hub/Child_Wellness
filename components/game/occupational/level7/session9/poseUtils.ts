/**
 * OT Level 7 · Session 9 — Vestibular Endurance
 * Re-uses Level 6 dynamic-balance pose math with long endurance sequences.
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

/** Long Trail Walk — sustained marching and steady steps over distance. */
export const LONG_TRAIL_SEQ: DynamicAction[] = ['go', 'steady', 'go', 'left', 'go', 'right', 'steady', 'go', 'center', 'go', 'steady', 'go'];

/** Rainbow Journey — long colorful directional path. */
export const RAINBOW_JOURNEY_SEQ: DynamicAction[] = ['left', 'center', 'right', 'center', 'left', 'right', 'center', 'left', 'right', 'center', 'left', 'right'];

/** Forest Explorer — navigate a winding forest with turns and steady holds. */
export const FOREST_EXPLORER_SEQ: DynamicAction[] = ['go', 'turn', 'left', 'steady', 'go', 'right', 'turn', 'go', 'steady', 'left', 'go', 'center'];

/** Endless Tracks — keep moving through changing train routes. */
export const ENDLESS_TRACKS_SEQ: DynamicAction[] = ['go', 'left', 'go', 'right', 'go', 'center', 'go', 'left', 'go', 'right', 'go', 'steady'];

/** Balance Marathon — the longest extended endurance challenge (grand finale). */
export const BALANCE_MARATHON_SEQ: DynamicAction[] = ['go', 'steady', 'left', 'turn', 'go', 'right', 'stop', 'steady', 'go', 'center', 'turn', 'left', 'go', 'steady', 'right', 'go'];

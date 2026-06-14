/**
 * OT Level 7 · Session 10 — Vestibular Challenge Course
 * Re-uses Level 6 dynamic-balance pose math with integrated obstacle-course sequences.
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

/** Pirate Island Challenge — treasure-hunt obstacle course. */
export const PIRATE_ISLAND_SEQ: DynamicAction[] = ['go', 'left', 'turn', 'right', 'steady', 'go', 'stop', 'center', 'right', 'go', 'turn', 'left'];

/** Space Explorer Course — space-themed balance missions. */
export const SPACE_EXPLORER_SEQ: DynamicAction[] = ['go', 'turn', 'stop', 'left', 'go', 'right', 'steady', 'turn', 'center', 'go', 'stop', 'right'];

/** Jungle Expedition — cross jungle obstacles with vestibular skills. */
export const JUNGLE_EXPEDITION_SEQ: DynamicAction[] = ['left', 'go', 'turn', 'steady', 'right', 'go', 'stop', 'turn', 'left', 'go', 'center', 'right'];

/** Mountain Adventure — climb, turn and balance through mountain paths. */
export const MOUNTAIN_ADVENTURE_SEQ: DynamicAction[] = ['go', 'steady', 'turn', 'left', 'go', 'stop', 'right', 'turn', 'go', 'steady', 'center', 'left'];

/** Vestibular Champion — final integrated obstacle course (grand finale of Level 7). */
export const VESTIBULAR_CHAMPION_SEQ: DynamicAction[] = ['go', 'left', 'turn', 'stop', 'right', 'steady', 'go', 'center', 'turn', 'left', 'stop', 'right', 'go', 'steady', 'turn', 'center'];

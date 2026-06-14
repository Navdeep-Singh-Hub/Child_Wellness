/**
 * OT Level 7 · Session 5 — Dynamic Standing Balance
 * Re-uses Level 6 dynamic-balance pose math with Level 7 sequences.
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

/** Balance Bridge — careful heel-to-toe steady steps across the bridge. */
export const BALANCE_BRIDGE_SEQ: DynamicAction[] = ['steady', 'steady', 'steady', 'steady', 'steady', 'steady', 'steady'];

/** Stepping Stones — lateral stepping from stone to stone. */
export const STEPPING_STONES_SEQ: DynamicAction[] = ['right', 'left', 'center', 'right', 'left', 'right', 'center'];

/** Island Hopper — lateral jumps with balance recovery. */
export const ISLAND_HOPPER_SEQ: DynamicAction[] = ['left', 'right', 'center', 'right', 'left', 'center', 'right', 'left'];

/** River Crossing — mixed steps, stop-and-balance and steady recovery. */
export const RIVER_CROSSING_SEQ: DynamicAction[] = ['right', 'stop', 'left', 'steady', 'right', 'stop', 'center', 'left'];

/** Star Trail — integrated walk, turn, stop and reach for stars (grand finale). */
export const STAR_TRAIL_SEQ: DynamicAction[] = ['right', 'go', 'turn', 'left', 'stop', 'center', 'go', 'turn', 'right', 'steady'];

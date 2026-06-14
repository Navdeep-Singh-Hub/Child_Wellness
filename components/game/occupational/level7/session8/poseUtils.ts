/**
 * OT Level 7 · Session 8 — Vestibular Sequencing
 * Re-uses Level 6 dynamic-balance pose math with motor-planning sequences.
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

/** Follow My Steps — footstep markers across the floor. */
export const FOLLOW_STEPS_SEQ: DynamicAction[] = ['left', 'center', 'right', 'center', 'left', 'right', 'center', 'left'];

/** Movement Pattern Copy — increasingly complex mixed patterns. */
export const PATTERN_COPY_SEQ: DynamicAction[] = ['left', 'right', 'steady', 'left', 'turn', 'right', 'stop', 'center', 'left', 'right'];

/** Star Sequence Path — collect stars in the correct movement order. */
export const STAR_SEQUENCE_SEQ: DynamicAction[] = ['center', 'left', 'right', 'center', 'steady', 'left', 'right', 'center', 'left'];

/** Space Mission — a sequence of movement commands in space. */
export const SPACE_MISSION_SEQ: DynamicAction[] = ['go', 'left', 'turn', 'right', 'stop', 'go', 'center', 'turn', 'left', 'steady'];

/** Pirate Journey — directional treasure-map sequence. */
export const PIRATE_JOURNEY_SEQ: DynamicAction[] = ['right', 'right', 'turn', 'left', 'center', 'turn', 'right', 'left', 'steady'];

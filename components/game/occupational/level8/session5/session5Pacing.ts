/**
 * Pacing & detection thresholds for OT Level 8 Session 5 — Body Position Planning.
 */
import type { PositionThresholds } from '@/components/game/occupational/level8/session5/bodyPosition';

export const SESSION5_THRESHOLDS: PositionThresholds = {
  positionHoldMs: 700,
  highRise: 0.45, // wrist rise above shoulders (shoulder-widths) for a full "high"
  lowDepth: 0.6, // wrist drop below shoulders for a full "low"
  sideOut: 0.16, // how far past center a hand must reach for a side
  turnShrink: 0.76, // shoulder-width shrink ratio confirming a body turn
  crouchY: 0.32, // center-of-mass drop confirming a crouch ("ball")
};

export const SESSION5_PACING = {
  calibrationMs: 2600,
  tickMs: 90,
  holdGraceMs: 220,

  planDelayMs: 1150,

  intensityCeiling: 0.18,
  jerkHigh: 0.8,

  maxGameMs: 95000,
  betweenRoundsMs: 850,
  fallbackHoldMs: 1700,

  starEveryNRounds: 2,
} as const;

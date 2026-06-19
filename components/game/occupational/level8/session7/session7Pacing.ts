/**
 * Pacing & detection thresholds for OT Level 8 Session 7 — Bilateral Motor Planning.
 */
import type { BilateralThresholds } from '@/components/game/occupational/level8/session7/bilateralPlan';

export const SESSION7_THRESHOLDS: BilateralThresholds = {
  holdMs: 680,
  crouchY: 0.28,
};

export const SESSION7_PACING = {
  calibrationMs: 2600,
  tickMs: 90,
  holdGraceMs: 220,

  planDelayMs: 1150,

  intensityCeiling: 0.18,
  jerkHigh: 0.8,

  maxGameMs: 95000,
  betweenRoundsMs: 850,
  fallbackMatchMs: 1700,

  starEveryNRounds: 2,
} as const;

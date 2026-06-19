/**
 * Pacing for OT Level 8 Session 9 — Novel Motor Challenges.
 */
import type { NovelThresholds } from '@/components/game/occupational/level8/session9/novelChallenge';

export const SESSION9_THRESHOLDS: NovelThresholds = {
  holdMs: 700,
  crouchY: 0.26,
  leanMin: 0.06,
};

export const SESSION9_PACING = {
  calibrationMs: 2600,
  tickMs: 90,
  holdGraceMs: 220,

  planDelayMs: 1100,
  surpriseRevealMs: 900,
  surprisePlanMs: 750,

  intensityCeiling: 0.18,
  jerkHigh: 0.82,

  maxGameMs: 100000,
  betweenRoundsMs: 900,
  fallbackMatchMs: 1750,

  starEveryNRounds: 2,
} as const;

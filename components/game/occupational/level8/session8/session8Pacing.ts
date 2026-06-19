/**
 * Pacing for OT Level 8 Session 8 — Movement Problem Solving.
 */
import type { PuzzleThresholds } from '@/components/game/occupational/level8/session8/puzzleSolve';

export const SESSION8_THRESHOLDS: PuzzleThresholds = {
  solveHoldMs: 650,
};

export const SESSION8_PACING = {
  calibrationMs: 2600,
  tickMs: 90,
  holdGraceMs: 220,

  thinkDelayMs: 1400,

  intensityCeiling: 0.18,
  jerkHigh: 0.8,

  maxGameMs: 100000,
  betweenRoundsMs: 900,
  fallbackSolveMs: 1800,
  wrongFeedbackMs: 1100,

  starEveryNRounds: 2,
} as const;

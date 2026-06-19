/**
 * Pacing for OT Level 8 Session 10 — Praxis Adventure (grand finale).
 */
import type { AdventureThresholds } from '@/components/game/occupational/level8/session10/praxisAdventure';

export const SESSION10_THRESHOLDS: AdventureThresholds = {
  stepHoldMs: 620,
};

export const SESSION10_PACING = {
  calibrationMs: 2800,
  tickMs: 90,
  holdGraceMs: 220,

  planDelayMs: 1100,
  planPerBeatMs: 200,

  intensityCeiling: 0.18,
  jerkHigh: 0.82,

  maxGameMs: 120000,
  betweenStepsMs: 600,
  betweenBeatsMs: 750,
  fallbackStepMs: 1500,

  starEveryNBeats: 2,
} as const;

/**
 * Pacing & detection thresholds for OT Level 8 Session 6 — Obstacle Navigation.
 */
import type { ObstacleNavThresholds } from '@/components/game/occupational/level8/session6/obstacleNav';

export const SESSION6_THRESHOLDS: ObstacleNavThresholds = {
  gateHoldMs: 620,
  stepHoldMs: 340,
};

export const SESSION6_PACING = {
  calibrationMs: 2600,
  tickMs: 90,
  holdGraceMs: 220,

  planDelayMs: 1200,
  planPerGateMs: 180,

  intensityCeiling: 0.18,
  jerkHigh: 0.82,

  maxGameMs: 105000,
  betweenGatesMs: 650,
  betweenRoundsMs: 900,
  fallbackGateMs: 1500,

  starEveryNRounds: 2,
} as const;

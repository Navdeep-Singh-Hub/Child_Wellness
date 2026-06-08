/**
 * Pacing constants for OT Level 3 Session 7 (swinging movement imitation).
 */

export const SESSION7_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 500,
  pendulumCenterXPct: 50,
  pendulumCenterYPct: 42,
  swingDistancePct: 28,
  minPendulumDirChanges: 4,
  demoSwingMs: 550,
  monkeyStartXPct: 22,
  monkeyStartYPct: 32,
  monkeyEndXPct: 78,
  monkeyEndYPct: 68,
  monkeyMinSwipePx: 180,
  monkeySwingsNeeded: 2,
  fanCenterXPct: 50,
  fanCenterYPct: 48,
  fanMinProgress: 0.78,
  ropeSwingHalfMs: 1000,
  ropeTimingWindowMs: 400,
  ropePeakAngleDeg: 5,
  musicBeatIntervalMs: 800,
  musicSwingToleranceMs: 300,
  musicSwingsNeeded: 4,
  swipeThresholdPx: 100,
} as const;

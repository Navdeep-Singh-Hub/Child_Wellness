/**
 * Pacing & scoring constants for OT Level 6 Session 10 — Integrated Core Challenge.
 */

export const SESSION10_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  // Detection thresholds (reuse Sessions 1–9 signals).
  uprightThreshold: 0.55,
  stillnessThreshold: 0.62,
  loweredThreshold: 0.32,
  reachTolerance: 0.55,
  crossMargin: 0.18,
  legLiftAmount: 0.4,
  marchIntensity: 0.32,
  balanceFallbackQuality: 0.58,

  // Per-task time budget before auto-advancing (incomplete) so the course flows.
  taskWindowMs: 9000,
  // Grace inside a dwell — brief dips don't reset the dwell timer.
  dwellGraceMs: 300,

  nextTaskDelayMs: 700,
  courseIntroDelayMs: 800,
  fallbackTaskMs: 1500,
} as const;

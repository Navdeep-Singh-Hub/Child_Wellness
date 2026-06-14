/**
 * Pacing & scoring constants for OT Level 6 Session 9 — Postural Endurance.
 */

export const SESSION9_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  // Pose quality required to count a frame as "holding".
  holdQualityThreshold: 0.5,
  // Below this, the hold is considered broken and the level's progress drains.
  breakQualityThreshold: 0.35,

  // How fast accumulated hold time drains while out of pose (fraction of dt).
  drainRate: 0.6,
  // Small grace window before a wobble counts as a break (ms).
  graceMs: 450,

  // Distraction spawns during a hold (purely visual; tests focus/inhibition).
  distractionIntervalMs: 1600,

  nextLevelDelayMs: 900,
  levelIntroDelayMs: 700,

  // Guided fallback: auto-fill rate (fraction of real-time).
  fallbackFillRate: 1.0,
} as const;

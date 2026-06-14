/**
 * Pacing & scoring constants for OT Level 6 Session 5 — Weight Shifting.
 */

export const SESSION5_PACING = {
  calibrationMs: 3000,
  tickMs: 110,

  // Lateral shift required to register a side (shoulder-widths).
  shiftTolerance: 0.26,
  // Deeper lean for Treasure Lean.
  leanTolerance: 0.36,
  // Dwell time inside the target zone to "collect".
  collectDwellMs: 450,
  // Balance-quality threshold to count a frame as controlled.
  balanceThreshold: 0.45,

  // ── Apple Reach ──
  appleTargets: 8,
  appleWindowMs: 7000,

  // ── Side Star Catch ──
  starTargets: 8,
  starWindowMs: 6000,

  // ── Treasure Lean ── (lean far, hold, recover)
  treasureTargets: 6,
  treasureHoldMs: 900, // hold at the lean to grab
  treasureWindowMs: 8000,

  // ── Bridge Balance ── (step across stones)
  bridgeStepDwellMs: 600,
  bridgeStepWindowMs: 6000,

  // ── Magic Scale ── (hold CoM at target to level)
  scaleRounds: 5,
  scaleLevelTol: 0.12, // shoulder-widths from target to count as "level"
  scaleHoldMs: 1500, // hold level to win the round
  scaleWindowMs: 10000,

  nextRoundDelayMs: 650,
  roundIntroDelayMs: 700,
  fallbackStepMs: 1400,
} as const;

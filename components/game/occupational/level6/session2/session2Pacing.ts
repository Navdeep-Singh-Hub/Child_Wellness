/**
 * Pacing & scoring constants for OT Level 6 Session 2 — Standing Posture Control.
 */

export const SESSION2_PACING = {
  calibrationMs: 3000,
  tickMs: 120,

  // ── Tall Tree ── (stand tall to grow the tree across stages)
  tallTreeRounds: 4,
  treeGrowthPerSec: 30, // growth gained per second while standing tall (0..100)
  treeDrainPerSec: 24,
  treeUprightThreshold: 0.55,

  // ── Soldier Stand ── (follow standing commands)
  soldierRounds: 4, // one command per round
  soldierCommandMs: 6000,
  soldierAlignThreshold: 0.55,

  // ── Statue Guard ── (stand still incl. arms; distractions)
  statueRounds: 3,
  statueRoundMs: 12000,
  statueStillThreshold: 0.55,
  statueDistractionEveryMs: 2200,

  // ── Grow Taller ── (stretch to float the balloon)
  growRounds: 4,
  balloonRisePerSec: 32, // balloon height gained per second while stretching
  balloonDrainPerSec: 20,
  stretchThreshold: 0.45,

  // ── Freeze & Balance ── (move, then freeze on signal)
  freezeRounds: 6,
  moveMsMin: 2200,
  moveMsMax: 3600,
  freezeWindowMs: 2600,
  freezeStillThreshold: 0.55,
  freezeBalanceThreshold: 0.5,

  nextRoundDelayMs: 750,
  roundIntroDelayMs: 700,
  fallbackHoldMs: 5000,
} as const;

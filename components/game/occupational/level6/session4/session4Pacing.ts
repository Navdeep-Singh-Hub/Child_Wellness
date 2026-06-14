/**
 * Pacing & scoring constants for OT Level 6 Session 4 — Static Balance.
 */

export const SESSION4_PACING = {
  calibrationMs: 3000,
  tickMs: 120,

  // Balance-quality threshold (0..1) to count a frame as "balanced".
  balanceThreshold: 0.5,
  // Stillness threshold for statue / freeze holds.
  stillThreshold: 0.55,

  // ── Flamingo Stand ── (single-leg hold; collect on milestones)
  flamingoRounds: 4,
  flamingoHoldMs: 5000, // balance hold to complete a round / collect
  flamingoCollectEveryMs: 1600, // sparkle a fish/star while balanced

  // ── One Foot Island ── (single-leg hold per island)
  islandRounds: 5,
  islandHoldMs: 4000,

  // ── Balance Statue ── (hold pose, ignore distractions)
  statueRounds: 4,
  statueRoundMs: 8000,
  statueStillThreshold: 0.55,
  statueDistractionEveryMs: 1700,

  // ── Star Balance Hold ── (arms extended + balance)
  starHoldRounds: 4,
  starHoldMs: 5000,
  starArmThreshold: 0.4, // armRaise required to count as "reaching"
  starCollectEveryMs: 1500,

  // ── Freeze Hero ── (move then freeze in balance pose)
  freezeRounds: 5,
  moveMsMin: 1800,
  moveMsMax: 3600,
  freezeWindowMs: 3000,
  freezeBalanceThreshold: 0.5,
  freezeStillThreshold: 0.6,

  nextRoundDelayMs: 800,
  roundIntroDelayMs: 700,
  fallbackHoldMs: 4500,
} as const;

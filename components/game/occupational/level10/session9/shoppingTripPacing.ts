/** Pacing — OT Level 10 Session 9 · Game 2 Shopping Trip */
export const SHOPPING_TRIP_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  browseHoldMs: 1200,
  browseGraceMs: 400,
  buyHoldMs: 1700,
  buyGraceMs: 400,
  minPostureForBuy: 0.34,
  minAttentionForBuy: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackBrowseMs: 2000,
  fallbackBuyMs: 2500,
  starEveryNRounds: 2,
} as const;

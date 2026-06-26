/** Pacing — OT Level 10 Session 10 · Game 3 Pirate Treasure Hunt */
export const PIRATE_TREASURE_HUNT_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  seekHoldMs: 1200,
  seekGraceMs: 400,
  claimHoldMs: 1700,
  claimGraceMs: 400,
  minPostureForClaim: 0.34,
  minAttentionForClaim: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackSeekMs: 2000,
  fallbackClaimMs: 2500,
  starEveryNRounds: 2,
} as const;

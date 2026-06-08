/**
 * Pacing constants for OT Level 3 Session 1 (tap with rhythm).
 */

export const SESSION1_PACING = {
  beatMatchRounds: 8,
  beatMatchBeatsPerRound: 4,
  beatMatchInitialBpm: 60,
  beatMatchFinalBpm: 120,
  stopGoRounds: 8,
  stopGoBeatsPerRound: 6,
  stopGoBeatIntervalMs: 800,
  stopGoSoundMs: 400,
  copyRounds: 6,
  copyBaseIntervalMs: 600,
  loudSoftRounds: 8,
  loudSoftBeatsPerRound: 6,
  loudSoftBeatIntervalMs: 1000,
  instrumentRounds: 10,
  nextRoundDelayMs: 420,
  tapToleranceRatio: 0.3,
  copyToleranceRatio: 0.4,
} as const;

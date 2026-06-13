/**
 * Pacing constants for OT Level 3 Session 1 — Musical Jungle Adventure.
 */

export const SESSION1_PACING = {
  // Beat Sync
  beatMatchRounds: 8,
  beatMatchBeatsPerRound: 6,
  beatMatchBpmLevels: [60, 60, 80, 80, 100, 100, 120, 120] as const,
  timingPerfectMs: 100,
  timingGoodMs: 250,

  // Stop & Go
  stopGoRounds: 8,
  stopGoCyclesPerRound: 8,
  stopGoPlayMsMin: 600,
  stopGoPlayMsMax: 1200,
  stopGoStopMsMin: 500,
  stopGoStopMsMax: 1400,

  // Rhythm Echo
  copyRounds: 8,
  copyBaseIntervalMs: 550,
  copyToleranceRatio: 0.45,
  copyPatternLengths: [2, 2, 3, 3, 4, 4, 5, 6] as const,

  // Loud & Soft
  loudSoftRounds: 8,
  loudSoftBeatsPerRound: 6,
  loudSoftBeatIntervalMs: 900,
  loudSoftHintFadeStart: 3,

  // Sound Match
  instrumentRounds: 10,
  instrumentSimilarSoundRound: 6,

  // General
  nextRoundDelayMs: 500,
  roundIntroDelayMs: 600,
  voicePromptDelayMs: 400,
} as const;

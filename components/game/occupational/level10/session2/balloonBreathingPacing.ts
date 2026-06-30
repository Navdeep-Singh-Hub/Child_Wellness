/** Pacing — OT Level 10 Session 2 · Game 1 Balloon Breathing */
export const BALLOON_BREATHING_PACING = {
  cycles: 5,
  calibrationMs: 2800,
  tickMs: 80,
  inhaleMs: 4200,
  holdMs: 1400,
  exhaleMs: 5200,
  restMs: 1200,
  betweenCyclesMs: 600,
  roundIntroMs: 900,
  starEveryNCycles: 2,
  balloonMinScale: 0.34,
  balloonMaxScale: 1,
  breathRangeNorm: 0.075,
} as const;

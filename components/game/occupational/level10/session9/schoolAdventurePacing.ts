/** Pacing — OT Level 10 Session 9 · Game 1 School Adventure */
export const SCHOOL_ADVENTURE_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  enterHoldMs: 1200,
  enterGraceMs: 400,
  participateHoldMs: 1700,
  participateGraceMs: 400,
  minPostureForParticipate: 0.34,
  minAttentionForParticipate: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackEnterMs: 2000,
  fallbackParticipateMs: 2500,
  starEveryNRounds: 2,
} as const;

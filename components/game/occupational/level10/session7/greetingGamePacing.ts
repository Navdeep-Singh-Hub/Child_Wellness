/** Pacing — OT Level 10 Session 7 · Game 1 Greeting Game */
export const GREETING_GAME_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  approachHoldMs: 1200,
  approachGraceMs: 400,
  greetHoldMs: 1700,
  greetGraceMs: 400,
  minPostureForGreet: 0.34,
  minAttentionForGreet: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackApproachMs: 2000,
  fallbackGreetMs: 2500,
  starEveryNRounds: 2,
} as const;

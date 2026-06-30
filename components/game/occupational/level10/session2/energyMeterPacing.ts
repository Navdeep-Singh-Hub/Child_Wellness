/** Pacing — OT Level 10 Session 2 · Game 5 Energy Meter */
export const ENERGY_METER_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  readMeterMs: 1800,
  holdMatchMs: 2200,
  holdGraceMs: 350,
  betweenRoundsMs: 1000,
  roundIntroMs: 800,
  fallbackMatchMs: 3000,
  starEveryNRounds: 2,
  /** Motion norm that maps to ~100% body energy reading. */
  maxMotionNorm: 0.065,
  /** Rolling average window for energy reading (ticks). */
  energySmoothTicks: 4,
  matchTolerance: 0.14,
} as const;

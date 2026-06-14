/**
 * Pacing & scoring constants for OT Level 6 Session 8 — Animal Walks & Core Activation.
 */

export const SESSION8_PACING = {
  calibrationMs: 3000,
  tickMs: 110,

  // Quadruped detection: how lowered the body must be to count as "in position".
  loweredThreshold: 0.32,

  // Cadence (motion-burst) rep detection thresholds on limbMotion magnitude.
  motionRepHigh: 0.085, // rising-edge threshold → a stride/push/crawl cycle
  motionRepLow: 0.04, // must drop below this to re-arm for the next rep
  repRefractoryMs: 360, // min time between counted reps (debounce)
  slowRepRefractoryMs: 700, // turtle: reward slower, controlled cadence

  // Gorilla march: alternating leg-lift detection.
  marchLiftAmount: 0.4, // legLift amount to register a raised knee
  marchRefractoryMs: 420,

  // Movement intensity ceiling for the energy meter.
  intensityCeiling: 0.16,

  // Quality gating.
  minIntensityForCredit: 0.25,

  // Per-game travel safety cap (auto-finish if it runs long).
  maxGameMs: 75000,

  nextStepDelayMs: 250,
  roundIntroDelayMs: 700,
  fallbackRepMs: 1300,

  starEveryNSteps: 2, // award a star/collectible every N steps
} as const;

/**
 * Pacing & scoring constants for OT Level 6 Session 1 — Sitting Posture Control.
 * Tuned for 4–10 year olds: short, encouraging rounds with forgiving windows.
 */

export const SESSION1_PACING = {
  // Calibration ("sit tall" baseline capture).
  calibrationMs: 3000,
  calibrationSamples: 16,

  // Sampling loop for posture evaluation (ms).
  tickMs: 120,

  // ── Superhero Power Sit ──
  powerSitRounds: 4,
  powerFillPerSec: 34, // power gained per second while upright (meter 0..100)
  powerDrainPerSec: 26, // power lost per second while slouched
  powerUprightThreshold: 0.55, // uprightScore needed to charge
  powerHoldTargetMs: 2000, // upright streak that counts as a "great hold"

  // ── Crown Keeper ──
  crownRounds: 3,
  crownRoundMs: 14000,
  crownStableThreshold: 0.6, // headStability needed to keep crown safe
  crownUnstableThreshold: 0.42, // below this the crown is wobbling
  crownUnstableFailMs: 1600, // sustained wobble ends the round early
  crownDistractionEveryMs: 2600,

  // ── Statue Kingdom ──
  statueRounds: 3,
  statueRoundMs: 12000,
  statueStillThreshold: 0.55, // stillness needed to stay "frozen"
  statueDistractionEveryMs: 2200,

  // ── Sit Tall Freeze (traffic light) ──
  freezeRounds: 8,
  freezeGreenMsMin: 1800,
  freezeGreenMsMax: 3200,
  freezeYellowMs: 1200,
  freezeRedMsMin: 1600,
  freezeRedMsMax: 2800,
  freezeUprightThreshold: 0.55,
  freezeStillThreshold: 0.5,

  // ── Star Reach Mission ──
  reachRounds: 6,
  reachTargetRadius: 0.14, // normalized distance from anchor that counts as a catch
  reachRecenterThreshold: 0.6, // uprightScore required to "sit back tall" between reaches
  reachTimeoutMs: 9000, // auto-advance if a reach is missed (fallback friendly)

  // General flow.
  nextRoundDelayMs: 700,
  roundIntroDelayMs: 700,

  // Fallback (no camera) — guided hold timer per round.
  fallbackHoldMs: 5000,
} as const;

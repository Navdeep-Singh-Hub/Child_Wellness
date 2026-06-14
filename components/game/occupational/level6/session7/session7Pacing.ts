/**
 * Pacing & scoring constants for OT Level 6 Session 7 — Trunk Rotation & Reaching.
 */

export const SESSION7_PACING = {
  calibrationMs: 3000,
  tickMs: 110,

  // Mirrored shoulder-widths a wrist must reach to register a side.
  reachTolerance: 0.55,
  // Cross-midline margin (how far past center the far hand must go).
  crossMargin: 0.18,
  // Trunk-rotation proxy threshold (0..1) for turn-required games.
  turnThreshold: 0.34,
  // Balance quality to count a frame as controlled (lean allowed).
  balanceThreshold: 0.4,
  // Dwell inside the target with a valid reach to "collect".
  collectDwellMs: 450,

  // ── Apple Picker ──
  appleTargets: 8,
  appleWindowMs: 7000,

  // ── Pirate Treasure Reach ── (cross-body)
  treasureTargets: 6,
  treasureWindowMs: 8000,

  // ── Turn & Touch ── (rotation required)
  turnTargets: 8,
  turnWindowMs: 7000,

  // ── Cross-Body Catch ── (cross-body + timing)
  catchTargets: 8,
  catchWindowMs: 4500,

  // ── Twisting Star Hunt ── (reach + rotation, mixed)
  starTargets: 10,
  starWindowMs: 7000,

  nextRoundDelayMs: 650,
  roundIntroDelayMs: 700,
  fallbackReachMs: 1400,
} as const;

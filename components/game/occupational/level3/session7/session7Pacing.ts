/**
 * Pacing & adaptive difficulty for OT Level 3 Session 7 — Swinging & Circular Motion.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION7_PACING = {
  rounds: 10,
  nextRoundDelayMs: 460,
  roundStartDelayMs: 520,

  pendulumCenterXPct: 50,
  pendulumCenterYPct: 42,
  swingDistancePct: 28,
  pendulumDirChangesBase: 3,
  pendulumDirChangesMax: 6,
  demoSwingBaseMs: 620,
  demoSwingMinMs: 380,

  monkeyStartXPct: 22,
  monkeyStartYPct: 32,
  monkeyEndXPct: 78,
  monkeyEndYPct: 68,
  monkeyMinSwipeBasePx: 130,
  monkeyMinSwipeStepPx: 25,
  monkeySwingsBase: 2,
  monkeySwingsMax: 4,

  fanCenterXPct: 50,
  fanCenterYPct: 48,
  fanMinProgressBase: 0.72,
  fanMinProgressMax: 0.92,

  ropeSwingHalfBaseMs: 1100,
  ropeSwingHalfMinMs: 650,
  ropeTimingWindowBaseMs: 450,
  ropeTimingWindowMinMs: 220,
  ropePeakAngleDeg: 6,

  musicBeatBaseMs: 880,
  musicBeatMinMs: 520,
  musicSwingToleranceBaseMs: 320,
  musicSwingToleranceMinMs: 180,
  musicSwingsBase: 3,
  musicSwingsMax: 5,

  swipeThresholdBasePx: 90,
  swipeThresholdMinPx: 120,
} as const;

export function difficultyTier(round: number, maxRounds = SESSION7_PACING.rounds): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function demoSwingMs(tier: DifficultyTier) {
  return Math.max(
    SESSION7_PACING.demoSwingMinMs,
    SESSION7_PACING.demoSwingBaseMs - (tier - 1) * 80,
  );
}

export function pendulumDirChanges(tier: DifficultyTier) {
  return Math.min(
    SESSION7_PACING.pendulumDirChangesMax,
    SESSION7_PACING.pendulumDirChangesBase + tier - 1,
  );
}

export function monkeyMinSwipePx(tier: DifficultyTier) {
  return SESSION7_PACING.monkeyMinSwipeBasePx + (tier - 1) * SESSION7_PACING.monkeyMinSwipeStepPx;
}

export function monkeySwingsNeeded(tier: DifficultyTier) {
  return Math.min(
    SESSION7_PACING.monkeySwingsMax,
    SESSION7_PACING.monkeySwingsBase + Math.floor((tier - 1) / 2),
  );
}

export function circleMinProgress(tier: DifficultyTier) {
  return Math.min(
    SESSION7_PACING.fanMinProgressMax,
    SESSION7_PACING.fanMinProgressBase + (tier - 1) * 0.06,
  );
}

export function ropeSwingHalfMs(tier: DifficultyTier) {
  return Math.max(
    SESSION7_PACING.ropeSwingHalfMinMs,
    SESSION7_PACING.ropeSwingHalfBaseMs - (tier - 1) * 150,
  );
}

export function ropeTimingWindowMs(tier: DifficultyTier) {
  return Math.max(
    SESSION7_PACING.ropeTimingWindowMinMs,
    SESSION7_PACING.ropeTimingWindowBaseMs - (tier - 1) * 75,
  );
}

export function musicBeatIntervalMs(tier: DifficultyTier) {
  return Math.max(
    SESSION7_PACING.musicBeatMinMs,
    SESSION7_PACING.musicBeatBaseMs - (tier - 1) * 120,
  );
}

export function musicSwingToleranceMs(tier: DifficultyTier) {
  return Math.max(
    SESSION7_PACING.musicSwingToleranceMinMs,
    SESSION7_PACING.musicSwingToleranceBaseMs - (tier - 1) * 45,
  );
}

export function musicSwingsNeeded(tier: DifficultyTier) {
  return Math.min(
    SESSION7_PACING.musicSwingsMax,
    SESSION7_PACING.musicSwingsBase + tier - 1,
  );
}

export function swipeThresholdPx(tier: DifficultyTier) {
  return Math.max(
    SESSION7_PACING.swipeThresholdMinPx - 20,
    SESSION7_PACING.swipeThresholdBasePx + (tier - 1) * 8,
  );
}

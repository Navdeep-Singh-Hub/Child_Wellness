/**
 * Pacing & adaptive difficulty for OT Level 3 Session 6 — Jump Imitation.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION6_PACING = {
  rounds: 10,

  doubleTapBaseMs: 680,
  doubleTapMinMs: 420,
  strictDoubleTapBaseMs: 580,
  strictDoubleTapMinMs: 380,

  beatIntervalBaseMs: 680,
  beatIntervalMinMs: 420,
  rhythmToleranceBaseMs: 340,
  rhythmToleranceMinMs: 180,
  rhythmTapWindowBaseMs: 2200,
  rhythmTapWindowMinMs: 1400,
  rhythmBeatsExpert: 3,

  numberShowBaseMs: 2200,
  numberShowMinMs: 1400,
  numberDelayMs: 700,

  obstacleCrossBaseMs: 2600,
  obstacleCrossMinMs: 1500,

  jumpUpPct: 28,
  jumpDownPct: 66,
  lilyPadY: 72,

  nextRoundDelayMs: 460,
  roundStartDelayMs: 520,
} as const;

export function difficultyTier(round: number, maxRounds = SESSION6_PACING.rounds): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function doubleTapMaxMs(tier: DifficultyTier, strict = false) {
  const base = strict ? SESSION6_PACING.strictDoubleTapBaseMs : SESSION6_PACING.doubleTapBaseMs;
  const min = strict ? SESSION6_PACING.strictDoubleTapMinMs : SESSION6_PACING.doubleTapMinMs;
  return Math.max(min, base - (tier - 1) * 85);
}

export function beatIntervalMs(tier: DifficultyTier) {
  return Math.max(
    SESSION6_PACING.beatIntervalMinMs,
    SESSION6_PACING.beatIntervalBaseMs - (tier - 1) * 90,
  );
}

export function rhythmToleranceMs(tier: DifficultyTier) {
  return Math.max(
    SESSION6_PACING.rhythmToleranceMinMs,
    SESSION6_PACING.rhythmToleranceBaseMs - (tier - 1) * 55,
  );
}

export function rhythmTapWindowMs(tier: DifficultyTier) {
  return Math.max(
    SESSION6_PACING.rhythmTapWindowMinMs,
    SESSION6_PACING.rhythmTapWindowBaseMs - (tier - 1) * 280,
  );
}

export function rhythmBeatCount(tier: DifficultyTier) {
  return tier >= 4 ? SESSION6_PACING.rhythmBeatsExpert : 2;
}

export function numberShowMs(tier: DifficultyTier) {
  return Math.max(
    SESSION6_PACING.numberShowMinMs,
    SESSION6_PACING.numberShowBaseMs - (tier - 1) * 260,
  );
}

export function obstacleCrossMs(tier: DifficultyTier) {
  return Math.max(
    SESSION6_PACING.obstacleCrossMinMs,
    SESSION6_PACING.obstacleCrossBaseMs - (tier - 1) * 360,
  );
}

export function jumpNumberWeightTwo(tier: DifficultyTier) {
  if (tier <= 2) return 0.33;
  if (tier === 3) return 0.45;
  return 0.55;
}

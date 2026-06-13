/**
 * Pacing & adaptive difficulty for OT Level 3 Session 8 — Body Part Awareness.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION8_PACING = {
  rounds: 10,
  nextRoundDelayMs: 460,
  nextRoundDelayLongMs: 680,
  roundStartDelayMs: 520,
  highlightDelayBaseMs: 500,
  highlightDelayMinMs: 280,
  pulseBaseMs: 580,
  pulseMinMs: 360,
  flashDurationBaseMs: 900,
  flashDurationMinMs: 480,
  flashResponseBaseMs: 1600,
  flashResponseMinMs: 900,
  flashesPerRoundBase: 4,
  flashesPerRoundMax: 6,
  puzzleMatchBasePx: 58,
  puzzleMatchMinPx: 38,
  puzzleRoundLimitBaseMs: 0,
  puzzleRoundLimitMs: 22000,
  followDemoBaseMs: 1900,
  followDemoMinMs: 1200,
  followSequenceMax: 2,
  timedResponseTier: 4,
} as const;

export function difficultyTier(round: number, maxRounds = SESSION8_PACING.rounds): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function highlightDelayMs(tier: DifficultyTier) {
  return Math.max(
    SESSION8_PACING.highlightDelayMinMs,
    SESSION8_PACING.highlightDelayBaseMs - (tier - 1) * 70,
  );
}

export function pulseMs(tier: DifficultyTier) {
  return Math.max(SESSION8_PACING.pulseMinMs, SESSION8_PACING.pulseBaseMs - (tier - 1) * 70);
}

export function flashDurationMs(tier: DifficultyTier) {
  return Math.max(
    SESSION8_PACING.flashDurationMinMs,
    SESSION8_PACING.flashDurationBaseMs - (tier - 1) * 140,
  );
}

export function flashesPerRound(tier: DifficultyTier) {
  return Math.min(
    SESSION8_PACING.flashesPerRoundMax,
    SESSION8_PACING.flashesPerRoundBase + Math.floor((tier - 1) / 2),
  );
}

export function puzzleMatchPx(tier: DifficultyTier) {
  return Math.max(
    SESSION8_PACING.puzzleMatchMinPx,
    SESSION8_PACING.puzzleMatchBasePx - (tier - 1) * 6,
  );
}

export function puzzleRoundLimitMs(tier: DifficultyTier) {
  return tier >= SESSION8_PACING.timedResponseTier ? SESSION8_PACING.puzzleRoundLimitMs : 0;
}

export function followDemoMs(tier: DifficultyTier) {
  return Math.max(
    SESSION8_PACING.followDemoMinMs,
    SESSION8_PACING.followDemoBaseMs - (tier - 1) * 230,
  );
}

export function followSequenceLength(tier: DifficultyTier) {
  return tier >= 4 ? SESSION8_PACING.followSequenceMax : 1;
}

export function showGlowHint(tier: DifficultyTier) {
  return tier < 3;
}

export function timedTapRound(tier: DifficultyTier) {
  return tier >= SESSION8_PACING.timedResponseTier;
}

export function tapTimeLimitMs(tier: DifficultyTier) {
  return timedTapRound(tier) ? SESSION8_PACING.flashResponseMinMs + (4 - tier) * 200 : 0;
}

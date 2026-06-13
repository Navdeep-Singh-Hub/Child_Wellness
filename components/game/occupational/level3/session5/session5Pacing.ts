/**
 * Pacing for OT Level 3 Session 5 — Left-Right Directional Awareness.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION5_PACING = {
  rounds: 10,
  swipeThresholdBase: 70,
  swipeTierMultiplier: [1.25, 1.1, 1.0, 0.9] as const,
  horizontalDominanceRatio: 0.5,

  objectCenterPct: 50,
  objectLeftPct: 16,
  objectRightPct: 84,
  ballTopPct: 14,
  ballCatchPct: 64,

  ballFallBaseMs: 2400,
  ballFallMinMs: 1400,
  arrowPulseFastMs: 280,
  arrowPulseSlowMs: 500,
  sequenceMaxLen: 3,
  mirrorMixedChance: 0.35,
  multiBallCount: 2,

  reactionWindowMs: 3200,
  nextRoundDelayMs: 480,
  roundStartDelayMs: 520,
} as const;

export function difficultyTier(round: number, maxRounds = SESSION5_PACING.rounds): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function swipeThreshold(tier: DifficultyTier) {
  return SESSION5_PACING.swipeThresholdBase * SESSION5_PACING.swipeTierMultiplier[tier - 1];
}

export function ballFallMs(round: number, maxRounds = SESSION5_PACING.rounds) {
  const tier = difficultyTier(round, maxRounds);
  return Math.max(
    SESSION5_PACING.ballFallMinMs,
    SESSION5_PACING.ballFallBaseMs - tier * 280 - (round % 3) * 80,
  );
}

export function arrowSequenceLength(round: number, maxRounds = SESSION5_PACING.rounds) {
  const tier = difficultyTier(round, maxRounds);
  if (tier <= 2) return 1;
  if (tier === 3) return 2;
  return Math.min(SESSION5_PACING.sequenceMaxLen, 2 + (round % 2));
}

export function useMirrorRound(round: number, maxRounds = SESSION5_PACING.rounds) {
  const tier = difficultyTier(round, maxRounds);
  if (tier < 4) return true;
  return Math.random() > SESSION5_PACING.mirrorMixedChance;
}

export function multiBallRound(round: number, maxRounds = SESSION5_PACING.rounds) {
  return difficultyTier(round, maxRounds) >= 4 && round % 2 === 0;
}

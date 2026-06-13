/**
 * Pacing for OT Level 3 Session 4 — Vertical Direction & Size Control.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION4_PACING = {
  verticalRounds: 10,
  sizeRounds: 10,
  smallDotRounds: 12,
  switchRounds: 12,

  swipeThresholdBase: 72,
  swipeTierMultiplier: [1.3, 1.1, 1.0, 0.88] as const,
  verticalDominanceRatio: 0.55,

  objectStartUpPct: 18,
  objectStartDownPct: 78,
  objectEndUpPct: 12,
  objectEndDownPct: 82,
  elevatorTopPct: 14,
  elevatorGroundPct: 74,

  maxFloors: 10,
  rainDropsPerRound: 3,
  rainFallMs: 2200,
  arrowSequenceMax: 3,

  bigTapMinDist: 120,
  bigTapMinScreenPct: 0.28,
  smallDotBase: 22,
  smallDotMin: 12,
  bigCircleSize: 200,
  smallCircleSize: 56,

  bigSwipeThreshold: 165,
  smallSwipeMax: 85,
  inflateMinScale: 0.5,
  inflateMaxScale: 2.1,
  inflateBigTarget: 1.75,
  inflateSmallTarget: 0.58,

  nextRoundDelayMs: 480,
  roundStartDelayMs: 520,
  reactionWindowMs: 3500,
} as const;

export function difficultyTier(round: number, maxRounds: number): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function swipeThreshold(tier: DifficultyTier) {
  return SESSION4_PACING.swipeThresholdBase * SESSION4_PACING.swipeTierMultiplier[tier - 1];
}

export function floorCountForTier(tier: DifficultyTier) {
  if (tier === 1) return 2;
  if (tier === 2) return 5;
  if (tier === 3) return 8;
  return 10;
}

export function balloonCountForRound(round: number) {
  if (round <= 3) return 1;
  if (round <= 7) return 2;
  return 3;
}

export function dotSizeForRound(round: number, maxRounds: number) {
  const tier = difficultyTier(round, maxRounds);
  return Math.max(
    SESSION4_PACING.smallDotMin,
    SESSION4_PACING.smallDotBase - tier * 2 - (round % 3),
  );
}

export function mixedDirectionRound(round: number, maxRounds: number) {
  return difficultyTier(round, maxRounds) >= 4 && round % 2 === 0;
}

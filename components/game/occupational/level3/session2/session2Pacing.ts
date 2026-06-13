/**
 * Pacing & difficulty for OT Level 3 Session 2 — Big vs Small Movements.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION2_PACING = {
  tapRounds: 10,
  swipeRounds: 8,
  pinchRounds: 8,
  throwRounds: 8,
  pathRounds: 8,

  nextRoundDelayMs: 480,
  cueDelayMs: 550,
  decisionWindowMs: 8000,

  /** Pinch / stretch scale bounds */
  minScale: 0.45,
  maxScale: 2.2,
  targetBigScale: 1.75,
  targetSmallScale: 0.58,
  targetBigScaleHard: 1.85,
  targetSmallScaleHard: 0.52,

  /** Swipe distance thresholds (px) — tier adjusts tolerance multiplier */
  bigSwipeBase: 185,
  smallSwipeMax: 95,
  swipeTierMultiplier: [1.35, 1.15, 1.0, 0.88] as const,

  /** Throw drag distance (px) */
  bigThrowBase: 175,
  smallThrowMax: 90,
  throwTierMultiplier: [1.3, 1.1, 1.0, 0.9] as const,

  /** Path tracing */
  widePathStroke: 28,
  narrowPathStroke: 12,
  pathToleranceBase: 5.5,
  pathToleranceWideBonus: 2.5,
  pathCompletePct: 94,
  pathWarnIntervalMs: 700,

  /** Throw baskets (% from left, % from top) */
  basketNearX: 22,
  basketMidX: 50,
  basketFarX: 78,
  basketY: 12,
  basketHitRadius: 14,
  ballStartX: 50,
  ballStartY: 78,

  /** Creature base size */
  creatureSize: 160,
} as const;

export function difficultyTier(round: number, maxRounds: number): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function objectCountForRound(round: number): 2 | 3 | 4 {
  if (round <= 3) return 2;
  if (round <= 7) return 3;
  return 4;
}

export function sizeSetForTier(tier: DifficultyTier, count: number): number[] {
  const sets: Record<DifficultyTier, number[][]> = {
    1: [[130, 44], [130, 70, 40]],
    2: [[110, 52], [115, 78, 48], [120, 88, 58, 38]],
    3: [[100, 58], [108, 82, 54], [112, 90, 68, 46]],
    4: [[92, 64], [100, 84, 62], [104, 88, 72, 56]],
  };
  const pool = sets[tier];
  const idx = Math.min(count - 2, pool.length - 1);
  return pool[idx] ?? pool[0]!;
}

export function swipeThresholds(tier: DifficultyTier) {
  const m = SESSION2_PACING.swipeTierMultiplier[tier - 1];
  return {
    big: SESSION2_PACING.bigSwipeBase * m,
    smallMax: SESSION2_PACING.smallSwipeMax * m,
  };
}

export function throwThresholds(tier: DifficultyTier) {
  const m = SESSION2_PACING.throwTierMultiplier[tier - 1];
  return {
    big: SESSION2_PACING.bigThrowBase * m,
    smallMax: SESSION2_PACING.smallThrowMax * m,
  };
}

export function pinchTargets(tier: DifficultyTier) {
  if (tier >= 4) {
    return {
      big: SESSION2_PACING.targetBigScaleHard,
      small: SESSION2_PACING.targetSmallScaleHard,
    };
  }
  return {
    big: SESSION2_PACING.targetBigScale,
    small: SESSION2_PACING.targetSmallScale,
  };
}

export function pathConfigForRound(round: number) {
  const tier = difficultyTier(round, SESSION2_PACING.pathRounds);
  const curved = tier >= 2;
  const narrow = tier >= 3 || (tier === 2 && round % 2 === 0);
  const mixed = tier >= 4;
  return {
    tier,
    curved,
    narrow: mixed ? round % 2 === 1 : narrow,
    wide: mixed ? round % 2 === 0 : !narrow,
    stroke: narrow ? SESSION2_PACING.narrowPathStroke : SESSION2_PACING.widePathStroke,
    tolerance:
      SESSION2_PACING.pathToleranceBase +
      (narrow ? 0 : SESSION2_PACING.pathToleranceWideBonus) -
      (tier - 1) * 0.4,
  };
}

export function throwTargetForRound(round: number): 'near' | 'mid' | 'far' {
  const tier = difficultyTier(round, SESSION2_PACING.throwRounds);
  if (tier === 1) return 'near';
  if (tier === 2) return round % 2 === 0 ? 'near' : 'far';
  if (tier === 3) {
    const opts: Array<'near' | 'mid' | 'far'> = ['near', 'mid', 'far'];
    return opts[round % 3]!;
  }
  const opts: Array<'near' | 'mid' | 'far'> = ['near', 'mid', 'far', 'mid'];
  return opts[round % 4]!;
}

export function throwTargetMoves(round: number): boolean {
  return difficultyTier(round, SESSION2_PACING.throwRounds) >= 4;
}

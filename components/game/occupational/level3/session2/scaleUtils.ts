/**
 * Helpers for OT Level 3 Session 2 big vs small movement games.
 */
import {
  SESSION2_PACING,
  difficultyTier,
  objectCountForRound,
  pinchTargets,
  sizeSetForTier,
  swipeThresholds,
  throwThresholds,
  type DifficultyTier,
} from '@/components/game/occupational/level3/session2/session2Pacing';

export type ScaleTarget = 'big' | 'small';
export type ScaleMoveMode = 'tap' | 'swipe' | 'pinch' | 'throw' | 'path';
export type ThrowBasket = 'near' | 'mid' | 'far';

export type TapObject = {
  id: string;
  size: number;
  isLargest: boolean;
  isSmallest: boolean;
};

export const randomTarget = (): ScaleTarget => (Math.random() > 0.5 ? 'big' : 'small');

export function buildTapObjects(round: number, maxRounds: number): TapObject[] {
  const tier = difficultyTier(round, maxRounds);
  const count = objectCountForRound(round);
  const sizes = sizeSetForTier(tier, count).slice(0, count);
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);
  return sizes.map((size, i) => ({
    id: `obj-${i}`,
    size,
    isLargest: size === maxSize,
    isSmallest: size === minSize,
  }));
}

export function correctTapObject(objects: TapObject[], target: ScaleTarget): TapObject {
  if (target === 'big') return objects.find((o) => o.isLargest) ?? objects[0]!;
  return objects.find((o) => o.isSmallest) ?? objects[objects.length - 1]!;
}

export function swipeMatches(
  distance: number,
  target: ScaleTarget,
  tier: DifficultyTier,
): { ok: boolean; score: number } {
  const { big, smallMax } = swipeThresholds(tier);
  if (target === 'big') {
    const ok = distance >= big;
    const score = ok ? Math.min(100, Math.round((distance / big) * 100)) : Math.round((distance / big) * 50);
    return { ok, score };
  }
  const ok = distance >= smallMax * 0.35 && distance < big;
  const ideal = (smallMax + big) / 2;
  const score = ok ? Math.max(0, 100 - Math.round((Math.abs(distance - ideal) / ideal) * 40)) : 0;
  return { ok, score };
}

export function pinchMatches(
  scale: number,
  target: ScaleTarget,
  tier: DifficultyTier,
): { ok: boolean; score: number } {
  const { big, small } = pinchTargets(tier);
  if (target === 'big') {
    const ok = scale >= big;
    const score = ok ? Math.min(100, Math.round((scale / big) * 100)) : Math.round((scale / big) * 55);
    return { ok, score };
  }
  const ok = scale <= small;
  const score = ok ? Math.min(100, Math.round(((small - scale + 1) / small) * 100)) : 0;
  return { ok, score };
}

export function throwMatches(
  dragDistance: number,
  basket: ThrowBasket,
  tier: DifficultyTier,
): { ok: boolean; score: number; implied: ScaleTarget } {
  const { big, smallMax } = throwThresholds(tier);
  const midLow = smallMax * 0.75;
  const midHigh = big * 0.92;
  const isBigThrow = dragDistance >= big;
  const isMidThrow = dragDistance >= midLow && dragDistance < midHigh;
  const isSmallThrow = dragDistance < midLow;
  const implied: ScaleTarget = isBigThrow ? 'big' : 'small';

  let ok = false;
  let score = 0;
  if (basket === 'near') {
    ok = isSmallThrow;
    score = ok ? Math.min(100, Math.round((1 - dragDistance / midLow) * 80 + 20)) : 0;
  } else if (basket === 'mid') {
    ok = isMidThrow;
    const center = (midLow + midHigh) / 2;
    score = ok ? Math.max(0, 100 - Math.round((Math.abs(dragDistance - center) / center) * 35)) : 0;
  } else {
    ok = isBigThrow;
    score = ok ? Math.min(100, Math.round((dragDistance / big) * 100)) : Math.round((dragDistance / big) * 40);
  }
  return { ok, score, implied };
}

export function basketX(basket: ThrowBasket): number {
  const P = SESSION2_PACING;
  if (basket === 'near') return P.basketNearX;
  if (basket === 'mid') return P.basketMidX;
  return P.basketFarX;
}

export function basketLabel(basket: ThrowBasket): string {
  if (basket === 'near') return 'NEAR';
  if (basket === 'mid') return 'MIDDLE';
  return 'FAR';
}

export function throwVoiceCue(basket: ThrowBasket): string {
  if (basket === 'near') return 'Throw it NEAR! Small throw!';
  if (basket === 'mid') return 'Throw to the MIDDLE! Medium throw!';
  return 'Throw it FAR! Big throw!';
}

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

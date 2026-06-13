/**
 * Direction & size helpers for OT Level 3 Session 4.
 */
import {
  SESSION4_PACING,
  difficultyTier,
  floorCountForTier,
  swipeThreshold,
  type DifficultyTier,
} from '@/components/game/occupational/level3/session4/session4Pacing';

export type VerticalDir = 'up' | 'down';
export type SizeKind = 'big' | 'small';

export const randomVerticalDir = (): VerticalDir => (Math.random() > 0.5 ? 'up' : 'down');
export const randomSize = (): SizeKind => (Math.random() > 0.5 ? 'big' : 'small');

export function swipeMatchesDir(
  deltaX: number,
  deltaY: number,
  distance: number,
  required: VerticalDir,
  tier: DifficultyTier,
): { ok: boolean; score: number } {
  const thresh = swipeThreshold(tier);
  if (distance < thresh) return { ok: false, score: 0 };
  const verticalEnough = Math.abs(deltaY) >= Math.abs(deltaX) * SESSION4_PACING.verticalDominanceRatio;
  if (!verticalEnough) return { ok: false, score: 20 };
  const ok = required === 'up' ? deltaY < 0 : deltaY > 0;
  const score = ok ? Math.min(100, Math.round((distance / thresh) * 85)) : 0;
  return { ok, score };
}

export function elevatorTarget(round: number, maxRounds: number) {
  const tier = difficultyTier(round, maxRounds);
  const floors = floorCountForTier(tier);
  const current = 1 + Math.floor(Math.random() * (floors - 1));
  let target = current;
  while (target === current) {
    target = 1 + Math.floor(Math.random() * floors);
  }
  const dir: VerticalDir = target > current ? 'up' : 'down';
  return { current, target, floors, dir };
}

export function floorToPct(floor: number, maxFloor: number) {
  const range = SESSION4_PACING.elevatorGroundPct - SESSION4_PACING.elevatorTopPct;
  return SESSION4_PACING.elevatorGroundPct - ((floor - 1) / Math.max(maxFloor - 1, 1)) * range;
}

export function swipeMatchesSize(
  distance: number,
  target: SizeKind,
  tier: DifficultyTier,
): { ok: boolean; score: number } {
  const m = SESSION4_PACING.swipeTierMultiplier[tier - 1];
  const big = SESSION4_PACING.bigSwipeThreshold * m;
  const smallMax = SESSION4_PACING.smallSwipeMax * m;
  if (target === 'big') {
    const ok = distance >= big;
    return { ok, score: ok ? Math.min(100, Math.round((distance / big) * 100)) : 0 };
  }
  const ok = distance >= smallMax * 0.35 && distance < big;
  return { ok, score: ok ? 80 : 0 };
}

export function pinchMatchesSize(
  scale: number,
  target: SizeKind,
  tier: DifficultyTier,
): { ok: boolean; score: number } {
  const big = SESSION4_PACING.inflateBigTarget + (tier >= 4 ? 0.08 : 0);
  const small = SESSION4_PACING.inflateSmallTarget - (tier >= 4 ? 0.05 : 0);
  if (target === 'big') {
    const ok = scale >= big;
    return { ok, score: ok ? Math.min(100, Math.round((scale / big) * 100)) : 0 };
  }
  const ok = scale <= small;
  return { ok, score: ok ? Math.min(100, Math.round(((small - scale + 1) / small) * 100)) : 0 };
}

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

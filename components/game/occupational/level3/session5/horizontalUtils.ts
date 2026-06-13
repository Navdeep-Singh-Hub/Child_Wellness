/**
 * Left-right direction helpers for OT Level 3 Session 5.
 */
import {
  SESSION5_PACING,
  swipeThreshold,
  type DifficultyTier,
} from '@/components/game/occupational/level3/session5/session5Pacing';

export type HorizontalDir = 'left' | 'right';

export const randomHorizontalDir = (): HorizontalDir => (Math.random() > 0.5 ? 'left' : 'right');

export const swipeToDir = (deltaX: number): HorizontalDir => (deltaX < 0 ? 'left' : 'right');

export const oppositeDir = (d: HorizontalDir): HorizontalDir => (d === 'left' ? 'right' : 'left');

export const dirLabel = (d: HorizontalDir) => (d === 'left' ? '⬅️ LEFT' : '➡️ RIGHT');

export const dirArrow = (d: HorizontalDir) => (d === 'left' ? '⬅️' : '➡️');

export function swipeMatchesDir(
  deltaX: number,
  deltaY: number,
  distance: number,
  required: HorizontalDir,
  tier: DifficultyTier,
): { ok: boolean; score: number } {
  const thresh = swipeThreshold(tier);
  if (distance < thresh) return { ok: false, score: 0 };
  const horizontalEnough = Math.abs(deltaX) >= Math.abs(deltaY) * SESSION5_PACING.horizontalDominanceRatio;
  if (!horizontalEnough) return { ok: false, score: 15 };
  const ok = swipeToDir(deltaX) === required;
  const score = ok ? Math.min(100, Math.round((distance / thresh) * 88)) : 0;
  return { ok, score };
}

export function buildArrowSequence(length: number): HorizontalDir[] {
  return Array.from({ length }, () => randomHorizontalDir());
}

export const ANIMAL_EMOJIS = ['🐕', '🦊', '🐰', '🐱', '🐔'] as const;
export const ANIMAL_NAMES = ['Dash', 'Finn', 'Ruby', 'Mittens', 'Cluck'] as const;

export function randomAnimal() {
  const i = Math.floor(Math.random() * ANIMAL_EMOJIS.length);
  return { emoji: ANIMAL_EMOJIS[i]!, name: ANIMAL_NAMES[i]! };
}

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

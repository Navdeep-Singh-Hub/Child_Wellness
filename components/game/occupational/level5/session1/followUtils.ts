/**
 * Helpers for OT Level 5 Session 1 follow / moving-target games.
 */

export {
  getGameAreaTap,
  isTapNearTarget,
  tapDistanceToTarget,
} from '@/components/game/occupational/shared/movingTargetTouch';

export { useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';

export const distPx = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);

export type MovingEntity = { id: string; x: number; y: number };

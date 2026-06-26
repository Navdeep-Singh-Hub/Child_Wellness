import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inQuestZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function integrationQuestQuality(
  gatherOk: boolean,
  integrateOk: boolean,
  completeOk: boolean,
  holdPct: number,
  smoothness: number,
  postureQ: number,
  attention: number,
  phase: 'gather' | 'integrate' | 'complete',
): number {
  const gather = phase === 'gather' && gatherOk ? 0.28 : gatherOk ? 0.12 : 0.05;
  const integrate = phase === 'integrate' && integrateOk ? 0.3 : integrateOk ? 0.12 : 0.04;
  const complete = phase === 'complete' && completeOk ? 0.28 : completeOk ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  return clamp01(
    gather + integrate + complete + hold + smoothness * 0.08 + postureQ * 0.08 + attention * 0.05,
  );
}

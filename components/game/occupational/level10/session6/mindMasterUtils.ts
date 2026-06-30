import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inAttentionZone } from '@/components/game/occupational/level10/session6/attentionRegulationUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inMindZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  return inAttentionZone(cursor, zone);
}

export function mindMasterQuality(
  focusOk: boolean,
  regulateOk: boolean,
  masterOk: boolean,
  holdPct: number,
  smoothness: number,
  postureQ: number,
  attention: number,
  phase: 'focus' | 'regulate' | 'master',
): number {
  const foc = phase === 'focus' && focusOk ? 0.28 : focusOk ? 0.1 : 0.05;
  const reg = phase === 'regulate' && regulateOk ? 0.3 : regulateOk ? 0.1 : 0.04;
  const mst = phase === 'master' && masterOk ? 0.28 : masterOk ? 0.1 : 0.04;
  const hold = holdPct * 0.16;
  const still = phase === 'regulate' ? smoothness * 0.1 : smoothness * 0.06;
  return clamp01(foc + reg + mst + hold + still + postureQ * 0.08 + attention * 0.1);
}

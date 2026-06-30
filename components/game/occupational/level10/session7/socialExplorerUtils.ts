import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inSocialZone } from '@/components/game/occupational/level10/session7/socialSensoryUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inExplorerZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  return inSocialZone(cursor, zone);
}

export function socialExplorerQuality(
  exploreOk: boolean,
  connectOk: boolean,
  socialOk: boolean,
  holdPct: number,
  smoothness: number,
  postureQ: number,
  attention: number,
  phase: 'explore' | 'connect' | 'social',
): number {
  const exp = phase === 'explore' && exploreOk ? 0.28 : exploreOk ? 0.1 : 0.05;
  const con = phase === 'connect' && connectOk ? 0.3 : connectOk ? 0.1 : 0.04;
  const soc = phase === 'social' && socialOk ? 0.28 : socialOk ? 0.1 : 0.04;
  const hold = holdPct * 0.16;
  const still = phase === 'connect' ? smoothness * 0.1 : smoothness * 0.06;
  return clamp01(exp + con + soc + hold + still + postureQ * 0.08 + attention * 0.1);
}

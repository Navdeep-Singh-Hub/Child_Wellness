/** Watch Carefully zone helpers — OT Level 10 Session 6 · Game 4 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inAttentionZone } from '@/components/game/occupational/level10/session6/attentionRegulationUtils';
import type { WatchCarefullyRound } from '@/components/game/occupational/level10/session6/watchCarefullyTheme';

export function inWatchZone(cursor: Point | null, round: WatchCarefullyRound): boolean {
  return inAttentionZone(cursor, round.watch);
}

export function inCarefulZone(cursor: Point | null, round: WatchCarefullyRound): boolean {
  return inAttentionZone(cursor, round.careful);
}

export function watchCarefullyQuality(
  watching: boolean,
  careful: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'watch' | 'careful',
): number {
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const wch = phase === 'watch' && watching ? 0.24 : watching ? 0.1 : 0.05;
  const car = phase === 'careful' && careful ? 0.34 : careful ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const attn = attention * 0.13;
  const still = phase === 'careful' ? smoothness * 0.12 : smoothness * 0.06;
  return clamp01(wch + car + hold + postureQ * 0.1 + attn + still);
}

/** Stop & Think zone helpers — OT Level 10 Session 6 · Game 2 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inAttentionZone } from '@/components/game/occupational/level10/session6/attentionRegulationUtils';
import type { StopThinkRound } from '@/components/game/occupational/level10/session6/stopThinkTheme';

export function inGoZone(cursor: Point | null, round: StopThinkRound): boolean {
  return inAttentionZone(cursor, round.go);
}

export function inStopZone(cursor: Point | null, round: StopThinkRound): boolean {
  return inAttentionZone(cursor, round.stop);
}

export function stopThinkQuality(
  going: boolean,
  stopped: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'go' | 'stop',
): number {
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const go = phase === 'go' && going ? 0.24 : going ? 0.1 : 0.05;
  const stp = phase === 'stop' && stopped ? 0.34 : stopped ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const still = phase === 'stop' ? smoothness * 0.14 : smoothness * 0.06;
  return clamp01(go + stp + hold + postureQ * 0.1 + attention * 0.1 + still);
}

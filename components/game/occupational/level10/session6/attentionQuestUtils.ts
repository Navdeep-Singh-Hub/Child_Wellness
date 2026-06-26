/** Attention Quest zone helpers — OT Level 10 Session 6 · Game 3 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inAttentionZone } from '@/components/game/occupational/level10/session6/attentionRegulationUtils';
import type { AttentionQuestRound } from '@/components/game/occupational/level10/session6/attentionQuestTheme';

export function inTrailZone(cursor: Point | null, round: AttentionQuestRound): boolean {
  return inAttentionZone(cursor, round.trail);
}

export function inQuestZone(cursor: Point | null, round: AttentionQuestRound): boolean {
  return inAttentionZone(cursor, round.quest);
}

export function attentionQuestQuality(
  onTrail: boolean,
  onQuest: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'trail' | 'quest',
): number {
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const trail = phase === 'trail' && onTrail ? 0.26 : onTrail ? 0.1 : 0.05;
  const quest = phase === 'quest' && onQuest ? 0.32 : onQuest ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const attn = attention * 0.12;
  return clamp01(trail + quest + hold + postureQ * 0.1 + attn + smoothness * 0.08);
}

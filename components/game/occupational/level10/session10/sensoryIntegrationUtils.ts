/**
 * OT Level 10 · Session 10 — Sensory Integration Adventure shared scoring.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inIntegrationZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function sensoryIntegrationQuality(
  scouting: boolean,
  trekking: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'scout' | 'trek',
): number {
  const scout = phase === 'scout' && scouting ? 0.26 : scouting ? 0.1 : 0.05;
  const trek = phase === 'trek' && trekking ? 0.32 : trekking ? 0.1 : 0.04;
  const hold = holdPct * 0.18;
  const attn = attention * 0.12;
  return clamp01(scout + trek + hold + postureQ * 0.1 + attn + smoothness * 0.08);
}

/** Capstone — ARVIT Grand Champion three-phase scoring */
export function integrationChampionQuality(
  exploreOk: boolean,
  integrateOk: boolean,
  championOk: boolean,
  holdPct: number,
  smoothness: number,
  postureQ: number,
  attention: number,
  phase: 'explore' | 'integrate' | 'champion',
): number {
  const exp = phase === 'explore' && exploreOk ? 0.28 : exploreOk ? 0.1 : 0.05;
  const int = phase === 'integrate' && integrateOk ? 0.3 : integrateOk ? 0.1 : 0.04;
  const champ = phase === 'champion' && championOk ? 0.28 : championOk ? 0.1 : 0.04;
  const hold = holdPct * 0.16;
  const still = phase === 'integrate' ? smoothness * 0.1 : smoothness * 0.06;
  return clamp01(exp + int + champ + hold + still + postureQ * 0.08 + attention * 0.1);
}

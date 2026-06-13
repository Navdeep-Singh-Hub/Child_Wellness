/**
 * Pacing & tempo engine for OT Level 3 Session 3 — Speed & Tempo Control.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;
export type PaceLevel = 'verySlow' | 'slow' | 'medium' | 'fast' | 'veryFast';
export type TrafficLight = 'green' | 'yellow' | 'red';
export type MusicTempo = 'slow' | 'medium' | 'fast';

export const SESSION3_PACING = {
  singleBeatRounds: 10,
  doubleBeatRounds: 8,
  pauseTapRounds: 10,
  fastBeatRounds: 8,
  slowBeatRounds: 8,
  dragRounds: 10,
  speedMatchRounds: 10,
  trafficRounds: 10,
  musicRounds: 10,

  timingPerfectMs: 100,
  timingGoodMs: 250,
  timingLateMs: 400,

  bpmLevels: [60, 80, 100, 120, 140] as const,
  calmBpm: 50,
  sprintStartBpm: 60,
  sprintStepBpm: 20,
  sprintBeatsPerRound: 6,
  sprintAccelEvery: 2,

  doubleBeatBaseMs: 550,
  pauseBeatMs: 450,
  pauseWaitBaseMs: 1200,
  pauseFakeCueChance: 0.15,

  slowMinDragMs: 500,
  fastMaxDragMs: 650,
  stumbleSpeedMs: 380,
  rabbitTimeLimitMs: 4500,
  checkpointCount: 3,

  paceDurations: {
    verySlow: 2200,
    slow: 1600,
    medium: 1000,
    fast: 650,
    veryFast: 400,
  } as Record<PaceLevel, number>,
  paceToleranceMs: 420,

  fastSwipeMaxMs: 320,
  mediumSwipeMaxMs: 700,
  slowSwipeMinMs: 950,
  minSwipeDistance: 55,

  trafficGreenFastMs: 350,
  trafficYellowSlowMinMs: 900,
  trafficSignalMinMs: 1400,
  trafficSignalMaxMs: 3200,

  musicTempoSwipe: {
    slow: { minMs: 900, maxMs: 99999 },
    medium: { minMs: 450, maxMs: 899 },
    fast: { minMs: 0, maxMs: 449 },
  } as Record<MusicTempo, { minMs: number; maxMs: number }>,

  nextRoundDelayMs: 480,
  roundStartDelayMs: 520,
  tapWindowRatio: 0.55,
} as const;

export function difficultyTier(round: number, maxRounds: number): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function bpmForRound(round: number, maxRounds: number, base = 60): number {
  const tier = difficultyTier(round, maxRounds);
  const levels = SESSION3_PACING.bpmLevels;
  const idx = Math.min(tier + Math.floor((round - 1) / 3), levels.length - 1);
  return levels[idx] ?? base;
}

export function bpmToInterval(bpm: number) {
  return (60 / bpm) * 1000;
}

export function pauseWaitForRound(round: number, maxRounds: number) {
  const tier = difficultyTier(round, maxRounds);
  return SESSION3_PACING.pauseWaitBaseMs + tier * 350 + (round % 3) * 200;
}

export function doubleBeatSpacing(round: number, maxRounds: number) {
  const tier = difficultyTier(round, maxRounds);
  return SESSION3_PACING.doubleBeatBaseMs - tier * 60 - (round % 2) * 40;
}

export function sprintBpmForBeat(beatIndex: number) {
  const steps = Math.floor(beatIndex / SESSION3_PACING.sprintAccelEvery);
  return Math.min(
    140,
    SESSION3_PACING.sprintStartBpm + steps * SESSION3_PACING.sprintStepBpm,
  );
}

export function paceForRound(round: number): PaceLevel {
  const levels: PaceLevel[] = ['verySlow', 'slow', 'medium', 'fast', 'veryFast'];
  return levels[Math.min(round - 1, levels.length - 1)] ?? 'medium';
}

export function randomTrafficLight(round: number): TrafficLight {
  const tier = difficultyTier(round, SESSION3_PACING.trafficRounds);
  const roll = Math.random();
  if (tier >= 4) {
    if (roll < 0.35) return 'red';
    if (roll < 0.65) return 'yellow';
    return 'green';
  }
  if (roll < 0.2) return 'red';
  if (roll < 0.5) return 'yellow';
  return 'green';
}

export function musicTempoForRound(round: number): MusicTempo {
  const tier = difficultyTier(round, SESSION3_PACING.musicRounds);
  if (tier === 1) return 'slow';
  if (tier === 2) return round % 2 === 0 ? 'slow' : 'medium';
  if (tier === 3) {
    const opts: MusicTempo[] = ['slow', 'medium', 'fast'];
    return opts[round % 3]!;
  }
  const opts: MusicTempo[] = ['slow', 'medium', 'fast', 'medium'];
  return opts[round % 4]!;
}

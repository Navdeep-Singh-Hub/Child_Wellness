/**
 * Pacing & adaptive difficulty for OT Level 3 Session 9 — Pose & Motion Imitation.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION9_PACING = {
  rounds: 10,
  nextRoundDelayMs: 460,
  roundStartDelayMs: 520,

  poseShowBaseMs: 3000,
  poseShowMinMs: 1600,
  handShowBaseMs: 2400,
  handShowMinMs: 1400,
  delayedShowBaseMs: 2000,
  delayedShowMinMs: 1200,
  delayedWaitBaseMs: 2200,
  delayedWaitMinMs: 3200,
  fastPoseBaseMs: 1400,
  fastPoseMinMs: 750,
  fastPosesBase: 3,
  fastPosesMax: 6,
  patternStepBaseMs: 950,
  patternStepMinMs: 550,
  patternLenBase: 2,
  patternLenMax: 5,
  confirmTimeLimitBaseMs: 0,
  confirmTimeLimitMs: 12000,
} as const;

export function difficultyTier(round: number, maxRounds = SESSION9_PACING.rounds): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function poseShowMs(tier: DifficultyTier) {
  return Math.max(SESSION9_PACING.poseShowMinMs, SESSION9_PACING.poseShowBaseMs - (tier - 1) * 450);
}

export function handShowMs(tier: DifficultyTier) {
  return Math.max(SESSION9_PACING.handShowMinMs, SESSION9_PACING.handShowBaseMs - (tier - 1) * 330);
}

export function delayedShowMs(tier: DifficultyTier) {
  return Math.max(SESSION9_PACING.delayedShowMinMs, SESSION9_PACING.delayedShowBaseMs - (tier - 1) * 260);
}

export function delayedWaitMs(tier: DifficultyTier) {
  return Math.min(
    SESSION9_PACING.delayedWaitMinMs,
    SESSION9_PACING.delayedWaitBaseMs + (tier - 1) * 350,
  );
}

export function fastPoseMs(tier: DifficultyTier) {
  return Math.max(SESSION9_PACING.fastPoseMinMs, SESSION9_PACING.fastPoseBaseMs - (tier - 1) * 220);
}

export function fastPosesPerRound(tier: DifficultyTier) {
  return Math.min(SESSION9_PACING.fastPosesMax, SESSION9_PACING.fastPosesBase + tier - 1);
}

export function patternStepMs(tier: DifficultyTier) {
  return Math.max(SESSION9_PACING.patternStepMinMs, SESSION9_PACING.patternStepBaseMs - (tier - 1) * 130);
}

export function patternLength(tier: DifficultyTier) {
  return Math.min(SESSION9_PACING.patternLenMax, SESSION9_PACING.patternLenBase + tier - 1);
}

export function confirmTimeLimitMs(tier: DifficultyTier) {
  return tier >= 4 ? SESSION9_PACING.confirmTimeLimitMs : 0;
}

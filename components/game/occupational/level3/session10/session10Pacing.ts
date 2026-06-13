/**
 * Pacing & adaptive difficulty for OT Level 3 Session 10 — Posture & Hold Control.
 */

export type DifficultyTier = 1 | 2 | 3 | 4;

export const SESSION10_PACING = {
  confirmRounds: 10,
  holdRounds: 8,
  nextRoundDelayMs: 480,
  roundStartDelayMs: 560,
  breathingIntroMs: 2200,

  poseShowBaseMs: 3000,
  poseShowMinMs: 1800,
  confirmWindowBaseMs: 5200,
  confirmWindowMinMs: 3200,
  holdPoseShowBaseMs: 2000,
  holdPoseShowMinMs: 1200,

  holdDurationBaseMs: 5000,
  holdDurationStepMs: 5000,
  holdDurationMaxMs: 25000,
  holdTickMs: 100,

  countStartBase: 5,
  countStartMax: 12,
  countIntervalBaseMs: 1000,
  countIntervalMinMs: 800,
} as const;

export function difficultyTier(round: number, maxRounds = SESSION10_PACING.confirmRounds): DifficultyTier {
  const pct = round / maxRounds;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function poseShowMs(tier: DifficultyTier) {
  return Math.max(
    SESSION10_PACING.poseShowMinMs,
    SESSION10_PACING.poseShowBaseMs - (tier - 1) * 400,
  );
}

export function confirmWindowMs(tier: DifficultyTier) {
  return Math.max(
    SESSION10_PACING.confirmWindowMinMs,
    SESSION10_PACING.confirmWindowBaseMs - (tier - 1) * 650,
  );
}

export function holdPoseShowMs(tier: DifficultyTier) {
  return Math.max(
    SESSION10_PACING.holdPoseShowMinMs,
    SESSION10_PACING.holdPoseShowBaseMs - (tier - 1) * 260,
  );
}

export function holdDurationMs(tier: DifficultyTier) {
  return Math.min(
    SESSION10_PACING.holdDurationMaxMs,
    SESSION10_PACING.holdDurationBaseMs + (tier - 1) * SESSION10_PACING.holdDurationStepMs,
  );
}

export function countStart(tier: DifficultyTier) {
  return Math.min(SESSION10_PACING.countStartMax, SESSION10_PACING.countStartBase + (tier - 1) * 2);
}

export function countIntervalMs(tier: DifficultyTier) {
  return Math.max(
    SESSION10_PACING.countIntervalMinMs,
    SESSION10_PACING.countIntervalBaseMs - (tier - 1) * 70,
  );
}

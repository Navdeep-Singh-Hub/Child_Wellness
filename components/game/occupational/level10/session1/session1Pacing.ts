/** Pacing — OT Level 10 Session 1 · Sensory Awareness */
import type { SensoryZoneId } from '@/components/game/occupational/level10/session1/sensoryExplorerTheme';

export type SensoryOrbTarget = {
  zoneId: SensoryZoneId;
  /** Normalized screen position 0..1 (origin top-left). */
  x: number;
  y: number;
  /** Hit radius in normalized units. */
  radius: number;
};

export const SESSION10_1_PACING = {
  rounds: 5,
  calibrationMs: 3000,
  tickMs: 80,
  holdToCollectMs: 1800,
  holdGraceMs: 400,
  betweenRoundsMs: 1100,
  roundIntroMs: 900,
  maxGameMs: 6 * 60 * 1000,
  fallbackReachMs: 2800,
  starEveryNRounds: 2,
  /** Orb positions per round (matches SENSORY_ZONES order). */
  orbTargets: [
    { zoneId: 'touch' as const, x: 0.5, y: 0.46, radius: 0.11 },
    { zoneId: 'left' as const, x: 0.17, y: 0.5, radius: 0.1 },
    { zoneId: 'right' as const, x: 0.83, y: 0.5, radius: 0.1 },
    { zoneId: 'sky' as const, x: 0.5, y: 0.2, radius: 0.095 },
    { zoneId: 'calm' as const, x: 0.5, y: 0.48, radius: 0.085 },
  ] satisfies SensoryOrbTarget[],
} as const;

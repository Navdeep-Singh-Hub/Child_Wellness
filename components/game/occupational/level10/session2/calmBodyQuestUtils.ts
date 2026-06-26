import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { SensoryBodySample } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { CalmSanctuary } from '@/components/game/occupational/level10/session2/calmBodyQuestTheme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inSanctuaryZone(cursor: Point | null, sanctuary: CalmSanctuary): boolean {
  if (!cursor) return false;
  return distNorm(cursor, sanctuary) <= sanctuary.radius;
}

export function stillnessScore(motion: number, maxStill: number, restless: number): number {
  if (motion <= maxStill) return clamp01(0.6 + (1 - motion / maxStill) * 0.4);
  if (motion >= restless) return 0.12;
  const t = (motion - maxStill) / (restless - maxStill);
  return clamp01(0.6 - t * 0.5);
}

export function calmPoseSatisfied(sample: SensoryBodySample, sanctuary: CalmSanctuary): boolean {
  if (!sample.present || !sample.cursor) return false;
  if (!inSanctuaryZone(sample.cursor, sanctuary)) return false;

  switch (sanctuary.pose) {
    case 'still':
      return true;
    case 'soft-hands': {
      const lowL = sample.leftWrist ? sample.leftWrist.y >= 0.52 : true;
      const lowR = sample.rightWrist ? sample.rightWrist.y >= 0.52 : true;
      return lowL && lowR;
    }
    case 'quiet-head':
      return Math.abs(sample.headYaw) < 14 && Math.abs(sample.headPitch) < 12;
    case 'centered':
      return true;
    case 'peace': {
      const handsLow =
        (!sample.leftWrist || sample.leftWrist.y >= 0.5) &&
        (!sample.rightWrist || sample.rightWrist.y >= 0.5);
      const headQuiet = Math.abs(sample.headYaw) < 12 && Math.abs(sample.headPitch) < 10;
      return handsLow && headQuiet;
    }
    default:
      return true;
  }
}

export function calmBodyQualityScore(
  still: number,
  postureQ: number,
  attention: number,
  poseOk: boolean,
  inZone: boolean,
): number {
  const zone = inZone ? 0.32 : 0.08;
  const pose = poseOk ? 0.28 : 0.1;
  return clamp01(zone + pose + still * 0.25 + postureQ * 0.1 + attention * 0.05);
}

export function isTooRestless(motion: number, restless: number): boolean {
  return motion > restless;
}

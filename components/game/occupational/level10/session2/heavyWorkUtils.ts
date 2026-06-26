import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { SensoryBodySample } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { HeavyWorkStation, WorkZone } from '@/components/game/occupational/level10/session2/heavyWorkTheme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inWorkZone(hand: Point | null, zone: WorkZone): boolean {
  if (!hand) return false;
  return distNorm(hand, zone) <= zone.radius;
}

export function bilateralZoneStatus(
  sample: SensoryBodySample,
  station: HeavyWorkStation,
): { leftOk: boolean; rightOk: boolean } {
  return {
    leftOk: inWorkZone(sample.leftWrist, station.leftZone),
    rightOk: inWorkZone(sample.rightWrist, station.rightZone),
  };
}

export function heavyWorkSatisfied(sample: SensoryBodySample, station: HeavyWorkStation): boolean {
  const { leftOk, rightOk } = bilateralZoneStatus(sample, station);
  if (!sample.leftWrist || !sample.rightWrist) return false;

  switch (station.type) {
    case 'push-down':
      return leftOk && rightOk && sample.leftWrist.y > 0.52 && sample.rightWrist.y > 0.52;
    case 'wall-push':
      return leftOk && rightOk;
    case 'pull-apart': {
      const spread = distNorm(sample.leftWrist, sample.rightWrist);
      return leftOk && rightOk && spread >= 0.52;
    }
    case 'carry': {
      const together = distNorm(sample.leftWrist, sample.rightWrist);
      return leftOk && rightOk && together <= 0.22;
    }
    case 'press-in': {
      const center = station.center ?? { x: 0.5, y: 0.42, radius: 0.14 };
      const lNear = inWorkZone(sample.leftWrist, center);
      const rNear = inWorkZone(sample.rightWrist, center);
      const together = distNorm(sample.leftWrist, sample.rightWrist);
      return lNear && rNear && together <= 0.18;
    }
    default:
      return leftOk && rightOk;
  }
}

export function heavyEffortScore(sample: SensoryBodySample, station: HeavyWorkStation): number {
  if (!heavyWorkSatisfied(sample, station)) {
    const { leftOk, rightOk } = bilateralZoneStatus(sample, station);
    return clamp01((leftOk ? 0.25 : 0) + (rightOk ? 0.25 : 0));
  }
  let bonus = 0.5;
  if (station.type === 'pull-apart' && sample.leftWrist && sample.rightWrist) {
    bonus += clamp01((distNorm(sample.leftWrist, sample.rightWrist) - 0.52) / 0.35) * 0.25;
  }
  if (station.type === 'carry' && sample.leftWrist && sample.rightWrist) {
    bonus += clamp01(1 - distNorm(sample.leftWrist, sample.rightWrist) / 0.22) * 0.2;
  }
  return clamp01(bonus + sample.postureQuality * 0.25);
}

export function heavyWorkQualityScore(
  effort: number,
  smoothness: number,
  postureQ: number,
  attention: number,
  satisfied: boolean,
): number {
  const hold = satisfied ? 0.38 : 0.1;
  return clamp01(hold + effort * 0.32 + smoothness * 0.14 + postureQ * 0.1 + attention * 0.06);
}

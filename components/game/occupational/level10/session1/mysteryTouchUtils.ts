import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import type { SensoryBodySample } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { MysteryTouchChallenge, TouchHand } from '@/components/game/occupational/level10/session1/mysteryTouchTheme';

export function distNorm(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function inTouchZone(hand: Point | null, target: Point & { radius: number }): boolean {
  if (!hand) return false;
  return distNorm(hand, target) <= target.radius;
}

export function handPoint(sample: SensoryBodySample, hand: TouchHand): Point | null {
  if (hand === 'left') return sample.leftWrist;
  if (hand === 'right') return sample.rightWrist;
  return null;
}

export function touchSatisfied(sample: SensoryBodySample, challenge: MysteryTouchChallenge): boolean {
  if (challenge.hand === 'both' && challenge.secondary) {
    return (
      inTouchZone(sample.leftWrist, challenge.primary) &&
      inTouchZone(sample.rightWrist, challenge.secondary)
    );
  }
  const pt = challenge.hand === 'left' ? sample.leftWrist : sample.rightWrist;
  return inTouchZone(pt, challenge.primary);
}

export function wrongHandActive(sample: SensoryBodySample, challenge: MysteryTouchChallenge): boolean {
  if (challenge.hand === 'both') return false;
  const wrong = challenge.hand === 'left' ? sample.rightWrist : sample.leftWrist;
  const right = challenge.hand === 'left' ? sample.leftWrist : sample.rightWrist;
  if (inTouchZone(wrong, challenge.primary) && !inTouchZone(right, challenge.primary)) return true;
  return false;
}

import type { MouthPoseCalibration } from './mouthPoseTypes';
import type { MouthPoseMatchLevel, MouthPoseReading, MouthPoseTarget } from './mouthPoseTypes';
import { normalizedJawOpen } from './MouthPoseCalibration';

const MATCH_FRAMES = 3;
const PARTIAL_FRAMES = 2;

export class MouthPoseMatchSmoother {
  private matchStreak = 0;
  private partialStreak = 0;

  reset() {
    this.matchStreak = 0;
    this.partialStreak = 0;
  }

  push(level: MouthPoseMatchLevel): MouthPoseMatchLevel {
    if (level === 'match') {
      this.matchStreak += 1;
      this.partialStreak = 0;
      if (this.matchStreak >= MATCH_FRAMES) return 'match';
      return 'partial';
    }
    if (level === 'partial') {
      this.partialStreak += 1;
      this.matchStreak = 0;
      if (this.partialStreak >= PARTIAL_FRAMES) return 'partial';
      return 'none';
    }
    this.matchStreak = 0;
    this.partialStreak = 0;
    return 'none';
  }
}

export function matchPose(
  target: MouthPoseTarget,
  reading: MouthPoseReading,
  cal: MouthPoseCalibration,
): MouthPoseMatchLevel {
  if (reading.unstable || reading.confidence < 0.25) {
    return 'none';
  }

  const jawNorm = normalizedJawOpen(cal, reading.jawRatio);
  const smile = reading.smileAmount;
  const round = reading.roundness;

  switch (target) {
    case 'face_present':
      return reading.isDetecting && reading.confidence >= 0.35 ? 'match' : 'none';

    case 'tongue_hint':
      if (reading.isTongueVisible && reading.jawOpen) return 'partial';
      return 'none';

    case 'open':
      if (reading.jawOpen || jawNorm >= 0.55) return 'match';
      if (jawNorm >= 0.35 || !reading.lipsClosed) return 'partial';
      return 'none';

    case 'closed':
      if (reading.lipsClosed && !reading.jawOpen && jawNorm <= 0.25) return 'match';
      if (reading.lipsClosed || jawNorm <= 0.4) return 'partial';
      return 'none';

    case 'round':
      if (round >= 0.45 && jawNorm <= 0.45) return 'match';
      if (round >= 0.3 || (!reading.jawOpen && reading.lipsClosed)) return 'partial';
      return 'none';

    case 'spread':
    case 'smile':
      if (smile >= 0.45 || round >= 0.35) return 'match';
      if (smile >= 0.25) return 'partial';
      return 'none';

    case 'neutral':
      if (!reading.jawOpen && reading.lipsClosed && smile < 0.35) return 'match';
      if (smile < 0.5) return 'partial';
      return 'none';

    default:
      return 'none';
  }
}

export function isPoseSuccess(level: MouthPoseMatchLevel): boolean {
  return level === 'match' || level === 'partial';
}

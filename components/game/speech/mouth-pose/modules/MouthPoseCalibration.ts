import type { MouthPoseCalibration } from './mouthPoseTypes';

export function createCalibration(): MouthPoseCalibration {
  return { jawMin: Infinity, jawMax: -Infinity, ready: false };
}

export function pushCalibration(
  cal: MouthPoseCalibration,
  jawRatio: number,
  frameBudget = 24,
): MouthPoseCalibration {
  if (!Number.isFinite(jawRatio) || jawRatio <= 0) return cal;
  const jawMin = Math.min(cal.jawMin, jawRatio);
  const jawMax = Math.max(cal.jawMax, jawRatio);
  const span = jawMax - jawMin;
  const ready = span >= 0.04 || (cal.ready && span >= 0.02);
  return { jawMin, jawMax, ready };
}

export function normalizedJawOpen(cal: MouthPoseCalibration, jawRatio: number): number {
  if (!cal.ready || !Number.isFinite(jawRatio)) {
    return jawRatio > 0.2 ? 1 : 0;
  }
  const span = Math.max(0.03, cal.jawMax - cal.jawMin);
  return Math.max(0, Math.min(1, (jawRatio - cal.jawMin) / span));
}

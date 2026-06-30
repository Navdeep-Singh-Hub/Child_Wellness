import type { FaceTrackingData, HandTrackingData, VisionGameEvent, VisionPoint } from './visionTypes';

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export type HeadStabilityState = {
  stabilityScore: number;
  movementSpeed: number;
  rotationAmount: number;
  stableMs: number;
};

export function createHeadStabilityTracker(initialMaxDegrees = 15) {
  let baselineYaw = 0;
  let baselinePitch = 0;
  let baselineRoll = 0;
  let calibrated = false;
  let stableMs = 0;
  let score = 50;
  let prevNose: VisionPoint | null = null;
  let prevTs = 0;
  let maxDegrees = initialMaxDegrees;
  let crownCooldown = 0;

  return {
    setDifficulty(degrees: number) {
      maxDegrees = degrees;
    },
    reset() {
      calibrated = false;
      stableMs = 0;
      score = 50;
      prevNose = null;
      prevTs = 0;
      crownCooldown = 0;
    },
    calibrate(yaw: number, pitch: number, roll: number) {
      baselineYaw = yaw;
      baselinePitch = pitch;
      baselineRoll = roll;
      calibrated = true;
      stableMs = 0;
      score = 50;
      prevNose = null;
    },
    update(timestampMs: number, face: Pick<FaceTrackingData, 'headYaw' | 'headPitch' | 'headRoll' | 'nose'>): HeadStabilityState & { crownFall: boolean } {
      const yaw = face.headYaw;
      const pitch = face.headPitch;
      const roll = face.headRoll;
      if (!calibrated) this.calibrate(yaw, pitch, roll);

      const dt = prevTs > 0 ? Math.max(1, timestampMs - prevTs) : 33;
      prevTs = timestampMs;

      const rotationAmount = Math.max(
        Math.abs(yaw - baselineYaw),
        Math.abs(pitch - baselinePitch),
        Math.abs(roll - baselineRoll),
      );

      const nose = face.nose ?? { x: 0.5, y: 0.5 };
      let movementSpeed = 0;
      if (prevNose) {
        movementSpeed =
          Math.hypot(nose.x - prevNose.x, nose.y - prevNose.y) / (dt / 1000);
      }
      prevNose = nose;

      const within = rotationAmount <= maxDegrees;
      if (within) {
        stableMs += dt;
        if (stableMs >= 5000) score = clamp(score + (dt / 1000) * 4);
      } else {
        stableMs = 0;
        score = clamp(score - (dt / 1000) * 8);
      }

      const rotPenalty = Math.min(1.5, rotationAmount / maxDegrees);
      const movePenalty = Math.min(1, movementSpeed / 0.35);
      const instant = clamp((1 - rotPenalty * 0.75 - movePenalty * 0.25) * 100);
      const stabilityScore = clamp(score * 0.55 + instant * 0.45);

      const crownFall = !within && timestampMs >= crownCooldown;
      if (crownFall) {
        crownCooldown = timestampMs + 900;
        score = clamp(score - 12);
      }

      return { stabilityScore, movementSpeed, rotationAmount, stableMs, crownFall };
    },
  };
}

export function extractFaceMetricsFromLandmarks(
  landmarks: VisionPoint[],
  matrix?: Float32Array | number[],
): Omit<
  FaceTrackingData,
  'stabilityScore' | 'movementSpeed' | 'rotationAmount' | 'stableMs'
> {
  const nose = landmarks[1] ?? landmarks[0];
  const forehead = landmarks[10] ?? nose;
  const leftTemple = landmarks[234] ?? landmarks[127];
  const rightTemple = landmarks[454] ?? landmarks[356];
  const upper = landmarks[13];
  const lower = landmarks[14];
  const left = landmarks[61];
  const right = landmarks[291];

  let headYaw = 0;
  let headPitch = 0;
  let headRoll = 0;
  if (matrix && matrix.length >= 16) {
    const r00 = matrix[0];
    const r10 = matrix[4];
    const r20 = matrix[8];
    const r21 = matrix[9];
    const r22 = matrix[10];
    headPitch = (Math.asin(Math.max(-1, Math.min(1, -r20))) * 180) / Math.PI;
    headYaw = (Math.atan2(r10, r00) * 180) / Math.PI;
    headRoll = (Math.atan2(r21, r22) * 180) / Math.PI;
  }

  const mouthWidth = left && right ? Math.abs(right.x - left.x) : 0;
  const mouthHeight = upper && lower ? Math.hypot(upper.x - lower.x, upper.y - lower.y) : 0;
  const mouthOpenScore = mouthWidth > 0 ? Math.min(1, mouthHeight / mouthWidth) : 0;
  const mouthRoundness = mouthWidth > 0 ? Math.min(1, 1 - Math.abs(mouthWidth - mouthHeight) / mouthWidth) : 0;
  const mouthWidthRatio = Math.min(1, mouthWidth * 4);

  const eyeOpenRatio = (() => {
    const dist = (a: number, b: number) => {
      const pa = landmarks[a];
      const pb = landmarks[b];
      if (!pa || !pb) return 0;
      return Math.hypot(pa.x - pb.x, pa.y - pb.y);
    };
    const leftOpen = dist(159, 145) / Math.max(0.001, dist(33, 133));
    const rightOpen = dist(386, 374) / Math.max(0.001, dist(362, 263));
    return Math.min(1, (leftOpen + rightOpen) / 2);
  })();

  const smileRatio = (() => {
    if (!left || !right || !upper) return 0;
    const widthScore = Math.min(1, mouthWidth * 2.5);
    const lift = ((left.y + right.y) / 2 - upper.y);
    return Math.min(1, widthScore * 0.5 + Math.min(1, lift * 8) * 0.5);
  })();

  return {
    headYaw,
    headPitch,
    headRoll,
    mouthWidth,
    mouthHeight,
    mouthOpen: mouthOpenScore,
    mouthRoundness,
    mouthWidthRatio,
    smileRatio,
    eyeOpenRatio,
    landmarks,
    nose,
    forehead,
    leftTemple,
    rightTemple,
    mouthOpenScore,
    oooScore: Math.min(1, mouthRoundness * 0.7 + mouthOpenScore * 0.3),
    eeeScore: Math.min(1, (1 - mouthOpenScore) * 0.6 + (1 - mouthRoundness) * 0.4),
    aaaScore: Math.min(1, mouthOpenScore * 0.75 + (1 - mouthRoundness) * 0.25),
    uuuScore: Math.min(1, mouthRoundness * 0.55 + (1 - mouthWidthRatio) * 0.45),
  };
}

export function evaluateGameEvents(
  timestampMs: number,
  face: FaceTrackingData,
  hands: HandTrackingData | null,
  emitted: Set<string>,
): VisionGameEvent[] {
  const events: VisionGameEvent[] = [];
  const push = (type: VisionGameEvent['type']) => {
    const key = `${type}`;
    if (emitted.has(key)) return;
    emitted.add(key);
    events.push({ type, timestamp: timestampMs });
  };

  if (face.stableMs >= 5000) push('HEAD_STABLE');
  if (face.stableMs < 4500) emitted.delete('HEAD_STABLE');

  if (face.mouthOpenScore >= 0.55) push('MOUTH_OPEN');
  if (face.mouthOpenScore < 0.35) emitted.delete('MOUTH_OPEN');

  if (face.smileRatio >= 0.6) push('SMILE_DETECTED');
  if (face.smileRatio < 0.4) emitted.delete('SMILE_DETECTED');

  const pinch = Math.min(
    hands?.leftPinch ?? 1,
    hands?.rightPinch ?? 1,
  );
  if (pinch >= 0 && pinch < 0.04) push('PINCH_SUCCESS');
  if (pinch > 0.07) emitted.delete('PINCH_SUCCESS');

  if (face.rotationAmount > 12) {
    if (!emitted.has('CROWN_FALL')) {
      emitted.add('CROWN_FALL');
      events.push({ type: 'CROWN_FALL', timestamp: timestampMs });
    }
  } else {
    emitted.delete('CROWN_FALL');
  }

  return events;
}

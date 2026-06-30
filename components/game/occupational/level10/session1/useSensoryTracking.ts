/**
 * Unified body tracking for OT Level 10 sensory games.
 * APK: child-wellness-vision (face + hands + pose absolute coords).
 * Web: MediaPipe pose + face via vision web fallback.
 */
import {
  DEFAULT_BASELINE,
  uprightScore,
  type Point,
  type PostureBaseline,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { mirroredWrists } from '@/components/game/occupational/level9/session1/forceUtils';
import type { SensoryBodySample } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useVisionTracking } from '@/hooks/useVisionTracking';
import { useMemo } from 'react';
import { Platform } from 'react-native';

const EMPTY: SensoryBodySample = {
  present: false,
  cursor: null,
  nose: null,
  leftWrist: null,
  rightWrist: null,
  shoulderMid: null,
  headYaw: 0,
  headPitch: 0,
  stabilityScore: 0,
  postureQuality: 0,
  attentionScore: 0,
  trackingSource: 'none',
};

function pt(x?: number, y?: number): Point | null {
  if (x == null || y == null) return null;
  return { x, y };
}

export function useSensoryTracking(isActive: boolean) {
  const vision = useVisionTracking(isActive, 'easy', {
    enableFace: true,
    enableHands: true,
    enablePose: true,
    targetFps: 25,
  });
  const pose = usePoseDetection(isActive);

  const sample = useMemo<SensoryBodySample>(() => {
    const face = vision.snapshot.face;
    const hands = vision.snapshot.hands;
    const poseData = vision.snapshot.pose;
    const metrics = pose.metrics;
    const baseline: PostureBaseline = DEFAULT_BASELINE;

    const visionNose = face?.nose ? { x: face.nose.x, y: face.nose.y } : null;
    const poseNose = metrics.nose;
    const nose = visionNose ?? poseNose;

    const visionLeft = hands?.leftHand?.[0];
    const visionRight = hands?.rightHand?.[0];
    const poseWrists = mirroredWrists(metrics);

    const leftWrist =
      pt(visionLeft?.x, visionLeft?.y) ??
      (poseData?.wrists?.left ? { x: poseData.wrists.left.x, y: poseData.wrists.left.y } : null) ??
      poseWrists.left;

    const rightWrist =
      pt(visionRight?.x, visionRight?.y) ??
      (poseData?.wrists?.right ? { x: poseData.wrists.right.x, y: poseData.wrists.right.y } : null) ??
      poseWrists.right;

    const shoulderMid =
      poseData?.shoulders?.left && poseData?.shoulders?.right
        ? {
            x: (poseData.shoulders.left.x + poseData.shoulders.right.x) / 2,
            y: (poseData.shoulders.left.y + poseData.shoulders.right.y) / 2,
          }
        : metrics.shoulderMid;

    const present = Boolean(nose);
    const trackingSource: SensoryBodySample['trackingSource'] = visionNose
      ? 'vision'
      : poseNose
        ? 'pose'
        : 'none';

    const postureQuality = metrics.present ? uprightScore(metrics, baseline) : face ? 0.65 : 0;
    const stabilityScore = face?.stabilityScore ?? (metrics.present ? postureQuality * 100 : 0);
    const attentionScore = present
      ? Math.min(1, (face?.eyeOpenRatio ?? 0.5) * 0.4 + (face ? 0.45 : 0.35) + postureQuality * 0.2)
      : 0;

    return {
      present,
      cursor: nose,
      nose,
      leftWrist,
      rightWrist,
      shoulderMid,
      headYaw: face?.headYaw ?? 0,
      headPitch: face?.headPitch ?? 0,
      stabilityScore,
      postureQuality,
      attentionScore,
      trackingSource,
    };
  }, [pose.metrics, vision.snapshot]);

  const hasCamera =
    (vision.isModuleAvailable && vision.isTracking) ||
    pose.hasCamera ||
    (Platform.OS === 'web' && pose.cameraSupported);

  const cameraSupported = vision.isModuleAvailable || pose.cameraSupported;

  return {
    sample,
    hasCamera,
    cameraSupported,
    vision,
    pose,
    previewContainerId: pose.previewContainerId,
    mediapipeSolution: pose.mediapipeSolution,
    permissionGranted: pose.permissionGranted,
    requestCameraAccess: pose.requestCameraAccess,
    error: vision.error ?? pose.error,
  };
}

export type SensoryTrackingResult = ReturnType<typeof useSensoryTracking>;

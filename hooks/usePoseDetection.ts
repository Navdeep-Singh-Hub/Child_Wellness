/**
 * Platform router for full-body pose detection (OT Level 6 posture games).
 *
 *  • Web    → MediaPipe PoseLandmarker via getUserMedia (usePoseDetectionWeb).
 *  • Native → MediaPipe PoseLandmarker via VisionCamera frame processor
 *             (usePoseDetectionNative). Requires dev-client build:
 *             npx expo run:android
 */

import { Platform } from 'react-native';
import {
  computeMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePoseDetectionWeb } from '@/hooks/usePoseDetectionWeb';
import { usePoseDetectionNative } from '@/hooks/usePoseDetectionNative';
import type { PoseDetectionResult } from '@/hooks/poseDetectionTypes';

export type { PoseDetectionResult } from '@/hooks/poseDetectionTypes';

function usePoseDetectionWebRoute(isActive: boolean): PoseDetectionResult {
  const web = usePoseDetectionWeb(isActive);
  const metrics = computeMetrics(web.pose);
  return {
    metrics,
    present: metrics.present,
    isDetecting: web.isDetecting,
    hasCamera: web.hasCamera,
    cameraSupported: true,
    error: web.error,
    previewContainerId: web.previewContainerId,
  };
}

/** Unified pose-detection API for all OT Level 6 games. */
export function usePoseDetection(isActive: boolean = true): PoseDetectionResult {
  if (Platform.OS === 'web') {
    return usePoseDetectionWebRoute(isActive);
  }
  return usePoseDetectionNative(isActive);
}

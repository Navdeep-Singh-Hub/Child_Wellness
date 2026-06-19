import type { PoseDetectionResult } from '@/hooks/poseDetectionTypes';

/** Spread onto CameraStage to mount the native pose camera on APK. */
export function poseStageNativeProps(det: PoseDetectionResult) {
  if (!det.mediapipeSolution || !det.permissionGranted) {
    return {
      mediapipeSolution: null as PoseDetectionResult['mediapipeSolution'],
      cameraIsActive: false,
    };
  }

  return {
    mediapipeSolution: det.mediapipeSolution,
    onCameraLayout: det.cameraLayoutHandler,
    cameraIsActive: det.cameraActive ?? true,
    visionDevice: det.visionDevice,
    frameProcessor: det.frameProcessor,
  };
}

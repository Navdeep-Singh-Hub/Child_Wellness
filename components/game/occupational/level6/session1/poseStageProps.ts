import type { PoseDetectionResult } from '@/hooks/poseDetectionTypes';

/** Spread onto CameraStage to mount the native VisionCamera preview on APK. */
export function poseStageNativeProps(det: PoseDetectionResult) {
  if (!det.visionDevice || !det.frameProcessor) return {};
  return {
    visionDevice: det.visionDevice,
    frameProcessor: det.frameProcessor,
    onCameraLayout: det.cameraLayoutHandler,
    cameraIsActive: det.cameraActive ?? true,
  };
}

import type { LayoutChangeEvent } from 'react-native';
import type { PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';

/** Solution object returned by react-native-mediapipe-posedetection usePoseDetection. */
export type MediapipePoseSolution = {
  frameProcessor: unknown;
  cameraViewLayoutChangeHandler: (event: LayoutChangeEvent) => void;
  cameraDeviceChangeHandler: (device: unknown) => void;
  cameraOrientationChangedHandler: (orientation: unknown) => void;
  resizeModeChangeHandler: (mode: unknown) => void;
  cameraViewDimensions: { width: number; height: number };
};

export interface PoseDetectionResult {
  metrics: PostureMetrics;
  present: boolean;
  isDetecting: boolean;
  hasCamera: boolean;
  /** True when native pose modules are linked (dev / release APK). */
  cameraSupported: boolean;
  permissionGranted: boolean;
  error?: string;
  previewContainerId: string;
  /** Ask for camera access — call when the user taps Start Mission. */
  requestCameraAccess: () => Promise<boolean>;
  /** Native VisionCamera (legacy manual path). */
  visionDevice?: unknown;
  frameProcessor?: unknown;
  cameraLayoutHandler?: (event: LayoutChangeEvent) => void;
  cameraActive?: boolean;
  /** Preferred native camera + pose pipeline (MediapipeCamera). */
  mediapipeSolution?: MediapipePoseSolution | null;
}

import type { LayoutChangeEvent } from 'react-native';
import type { PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';

export interface PoseDetectionResult {
  metrics: PostureMetrics;
  present: boolean;
  isDetecting: boolean;
  hasCamera: boolean;
  /** True when this platform can track the body via camera. */
  cameraSupported: boolean;
  error?: string;
  previewContainerId: string;
  /** Native VisionCamera (undefined on web). */
  visionDevice?: unknown;
  frameProcessor?: unknown;
  cameraLayoutHandler?: (event: LayoutChangeEvent) => void;
  cameraActive?: boolean;
}

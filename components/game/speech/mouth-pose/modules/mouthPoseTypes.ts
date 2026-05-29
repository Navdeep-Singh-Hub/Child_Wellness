/** Shared mouth-pose targets for Level 5 camera detection (APK + web). */

export type MouthPoseTarget =
  | 'open'
  | 'closed'
  | 'round'
  | 'spread'
  | 'smile'
  | 'neutral'
  | 'face_present'
  | 'tongue_hint';

export type MouthPoseMatchLevel = 'match' | 'partial' | 'none';

export type MouthPoseGameState =
  | 'IDLE'
  | 'SHOW_PROMPT'
  | 'DETECTING'
  | 'MATCH'
  | 'REWARDING'
  | 'HELPING';

export interface MouthPoseReading {
  jawOpen: boolean;
  jawRatio: number;
  lipsClosed: boolean;
  lipGap: number;
  smileAmount: number;
  roundness: number;
  confidence: number;
  unstable: boolean;
  hasCamera: boolean;
  isDetecting: boolean;
  isTongueVisible: boolean;
  error?: string;
  device: unknown;
  frameProcessor: unknown;
  previewContainerId?: string;
  useCamera: boolean;
}

export interface MouthPoseCalibration {
  jawMin: number;
  jawMax: number;
  ready: boolean;
}

export const DEFAULT_CALIBRATION_FRAMES = 24;

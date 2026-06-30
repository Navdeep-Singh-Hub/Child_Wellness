export type VisionDifficulty = 'easy' | 'medium' | 'hard';

export type VisionGameEventType =
  | 'HEAD_STABLE'
  | 'MOUTH_OPEN'
  | 'PINCH_SUCCESS'
  | 'HAND_RAISED'
  | 'BOTH_HANDS_UP'
  | 'SMILE_DETECTED'
  | 'CROWN_FALL';

export type VisionPoint = { x: number; y: number; z?: number };

export type FaceLandmarkPoint = VisionPoint;

export type HandLandmarkPoint = VisionPoint;

export type FaceTrackingData = {
  headYaw: number;
  headPitch: number;
  headRoll: number;
  mouthWidth: number;
  mouthHeight: number;
  mouthOpen: number;
  mouthRoundness: number;
  mouthWidthRatio: number;
  smileRatio: number;
  eyeOpenRatio: number;
  landmarks: FaceLandmarkPoint[];
  nose?: VisionPoint;
  forehead?: VisionPoint;
  leftTemple?: VisionPoint;
  rightTemple?: VisionPoint;
  stabilityScore: number;
  movementSpeed: number;
  rotationAmount: number;
  stableMs: number;
  mouthOpenScore: number;
  oooScore: number;
  eeeScore: number;
  aaaScore: number;
  uuuScore: number;
};

export type HandTrackingData = {
  leftHand: HandLandmarkPoint[];
  rightHand: HandLandmarkPoint[];
  leftPinch: number;
  rightPinch: number;
  leftOpenness: number;
  rightOpenness: number;
};

export type PoseJointPair = { left?: VisionPoint | null; right?: VisionPoint | null };

export type PoseTrackingData = {
  shoulders: PoseJointPair;
  elbows: PoseJointPair;
  wrists: PoseJointPair;
  hips: PoseJointPair;
  knees: PoseJointPair;
  ankles: PoseJointPair;
};

export type VisionGameEvent = {
  type: VisionGameEventType;
  timestamp: number;
  payload?: Record<string, unknown>;
};

export type VisionTrackingOptions = {
  difficulty?: VisionDifficulty;
  enableFace?: boolean;
  enableHands?: boolean;
  enablePose?: boolean;
  targetFps?: number;
};

export type VisionTrackingSnapshot = {
  face: FaceTrackingData | null;
  hands: HandTrackingData | null;
  pose: PoseTrackingData | null;
  lastEvent: VisionGameEvent | null;
};

export type VisionTrackingResult = {
  snapshot: VisionTrackingSnapshot;
  isTracking: boolean;
  isModuleAvailable: boolean;
  hasPreview: boolean;
  error?: string;
  startTracking: (options?: VisionTrackingOptions) => Promise<boolean>;
  stopTracking: () => Promise<boolean>;
  resetCalibration: () => Promise<boolean>;
  setDifficulty: (level: VisionDifficulty) => Promise<boolean>;
};

export const VISION_REBUILD_MSG =
  'Vision tracking requires a dev-client rebuild: npm run android:dev';

export const DIFFICULTY_DEGREES: Record<VisionDifficulty, number> = {
  easy: 15,
  medium: 8,
  hard: 4,
};

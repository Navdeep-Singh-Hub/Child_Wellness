import { requireNativeModule, NativeModule } from 'expo-modules-core';
import type {
  FaceTrackingData,
  HandTrackingData,
  PoseTrackingData,
  VisionDifficulty,
  VisionGameEvent,
  VisionTrackingOptions,
} from './visionTypes';

type ChildWellnessVisionNative = NativeModule & {
  startTracking: (options?: VisionTrackingOptions) => Promise<boolean>;
  stopTracking: () => Promise<boolean>;
  resetCalibration: () => Promise<boolean>;
  setDifficulty: (level: VisionDifficulty) => Promise<boolean>;
  addListener: (event: string, listener: (payload: unknown) => void) => { remove: () => void };
  removeListeners: (count: number) => void;
};

let nativeModule: ChildWellnessVisionNative | null = null;

export function getVisionNativeModule(): ChildWellnessVisionNative | null {
  if (nativeModule) return nativeModule;
  try {
    nativeModule = requireNativeModule<ChildWellnessVisionNative>('ChildWellnessVision');
    return nativeModule;
  } catch {
    return null;
  }
}

export function parseFaceData(raw: unknown): FaceTrackingData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  return {
    headYaw: Number(d.headYaw ?? 0),
    headPitch: Number(d.headPitch ?? 0),
    headRoll: Number(d.headRoll ?? 0),
    mouthWidth: Number(d.mouthWidth ?? 0),
    mouthHeight: Number(d.mouthHeight ?? 0),
    mouthOpen: Number(d.mouthOpen ?? d.mouthOpenScore ?? 0),
    mouthRoundness: Number(d.mouthRoundness ?? 0),
    mouthWidthRatio: Number(d.mouthWidthRatio ?? 0),
    smileRatio: Number(d.smileRatio ?? 0),
    eyeOpenRatio: Number(d.eyeOpenRatio ?? 0),
    landmarks: Array.isArray(d.landmarks) ? (d.landmarks as FaceTrackingData['landmarks']) : [],
    nose: d.nose as FaceTrackingData['nose'],
    forehead: d.forehead as FaceTrackingData['forehead'],
    leftTemple: d.leftTemple as FaceTrackingData['leftTemple'],
    rightTemple: d.rightTemple as FaceTrackingData['rightTemple'],
    stabilityScore: Number(d.stabilityScore ?? 0),
    movementSpeed: Number(d.movementSpeed ?? 0),
    rotationAmount: Number(d.rotationAmount ?? 0),
    stableMs: Number(d.stableMs ?? 0),
    mouthOpenScore: Number(d.mouthOpenScore ?? d.mouthOpen ?? 0),
    oooScore: Number(d.oooScore ?? 0),
    eeeScore: Number(d.eeeScore ?? 0),
    aaaScore: Number(d.aaaScore ?? 0),
    uuuScore: Number(d.uuuScore ?? 0),
  };
}

export function parseHandData(raw: unknown): HandTrackingData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  return {
    leftHand: Array.isArray(d.leftHand) ? (d.leftHand as HandTrackingData['leftHand']) : [],
    rightHand: Array.isArray(d.rightHand) ? (d.rightHand as HandTrackingData['rightHand']) : [],
    leftPinch: Number(d.leftPinch ?? -1),
    rightPinch: Number(d.rightPinch ?? -1),
    leftOpenness: Number(d.leftOpenness ?? 0),
    rightOpenness: Number(d.rightOpenness ?? 0),
  };
}

export function parsePoseData(raw: unknown): PoseTrackingData | null {
  if (!raw || typeof raw !== 'object') return null;
  return raw as PoseTrackingData;
}

export function parseGameEvent(raw: unknown): VisionGameEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  const type = d.type as VisionGameEvent['type'];
  if (!type) return null;
  return {
    type,
    timestamp: Number(d.timestamp ?? Date.now()),
    payload: d.payload as Record<string, unknown> | undefined,
  };
}

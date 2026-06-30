/**
 * Native (APK) full-body pose detection via react-native-mediapipe-posedetection +
 * react-native-vision-camera frame processors.
 */
import {
  computeMetrics,
  type PoseLandmark,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { MediapipePoseSolution, PoseDetectionResult } from '@/hooks/poseDetectionTypes';

const MODEL_FILE = 'pose_landmarker_lite.task';
const PREVIEW_ID = 'pose-preview-container';

export const POSE_NATIVE_REBUILD_MSG =
  'Body tracking is not in this app build. Play guided mode, or reinstall with: npx expo run:android';

export function friendlyPoseError(raw?: string): string {
  if (!raw) return POSE_NATIVE_REBUILD_MSG;
  if (/TurboModule|MediapipePose|native binary|not registered|posedetection plugin/i.test(raw)) {
    return POSE_NATIVE_REBUILD_MSG;
  }
  return raw;
}

type MpSolution = MediapipePoseSolution | null;

function useCameraDeviceStub(_position: 'front' | 'back'): null {
  return null;
}

function useCameraPermissionStub() {
  return { hasPermission: false, requestPermission: async () => false };
}

function useExpoCameraPermissionsStub(): [{ granted: boolean } | null, () => Promise<{ granted: boolean }>] {
  return [null, async () => ({ granted: false })];
}

function useMediapipePoseStub(): MpSolution {
  return null;
}

let useCameraDevice: ((position: 'front' | 'back') => unknown) | null = null;
let useCameraPermission: (() => { hasPermission: boolean; requestPermission: () => Promise<boolean> }) | null = null;
let useExpoCameraPermissions: (() => [{ granted: boolean } | null, () => Promise<{ granted: boolean }>]) | null = null;
let useMediapipePoseDetection: ((...args: unknown[]) => MpSolution) | null = null;
let RunningMode: { LIVE_STREAM: unknown } | null = null;
let Delegate: { GPU: unknown; CPU: unknown } | null = null;
let poseModuleLoadError: string | undefined;
let nativeModulesLoadAttempted = false;

/** Load native camera + pose modules on first hook use (not at bundle import time). */
function ensureNativePoseModulesLoaded(): boolean {
  if (nativeModulesLoadAttempted) {
    return Boolean(
      useMediapipePoseDetection && RunningMode && Delegate && (useCameraPermission || useExpoCameraPermissions),
    );
  }
  nativeModulesLoadAttempted = true;

  if (Platform.OS === 'web') {
    poseModuleLoadError = POSE_NATIVE_REBUILD_MSG;
    return false;
  }

  try {
    const visionCamera = require('react-native-vision-camera');
    useCameraDevice = visionCamera.useCameraDevice;
    useCameraPermission = visionCamera.useCameraPermission;
  } catch (e) {
    console.warn('[pose-native] vision-camera unavailable:', e);
  }

  try {
    const expoCamera = require('expo-camera');
    useExpoCameraPermissions = expoCamera.useCameraPermissions;
  } catch (e) {
    console.warn('[pose-native] expo-camera permissions unavailable:', e);
  }

  try {
    const mp = require('react-native-mediapipe-posedetection');
    useMediapipePoseDetection = mp.usePoseDetection;
    RunningMode = mp.RunningMode;
    Delegate = mp.Delegate;
  } catch (e) {
    poseModuleLoadError = friendlyPoseError(e instanceof Error ? e.message : undefined);
    console.warn('[pose-native] mediapipe-posedetection unavailable:', e);
  }

  const ok = Boolean(
    useMediapipePoseDetection && RunningMode && Delegate && (useCameraPermission || useExpoCameraPermissions),
  );
  if (!ok && !poseModuleLoadError) {
    poseModuleLoadError = POSE_NATIVE_REBUILD_MSG;
  }
  return ok;
}

export function usePoseDetectionNative(isActive: boolean = true): PoseDetectionResult {
  const [modulesReady, setModulesReady] = useState(() => ensureNativePoseModulesLoaded());

  useEffect(() => {
    if (!modulesReady && ensureNativePoseModulesLoaded()) {
      setModulesReady(true);
    }
  }, [modulesReady]);

  const modulesAvailable = modulesReady;

  const [pose, setPose] = useState<PoseLandmark[] | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | undefined>(
    poseModuleLoadError ? friendlyPoseError(poseModuleLoadError) : undefined,
  );
  const [permissionGranted, setPermissionGranted] = useState(false);

  const { hasPermission: visionPermission, requestPermission: requestVisionPermission } = (
    useCameraPermission ?? useCameraPermissionStub
  )();
  const [expoPermission, requestExpoPermission] = (useExpoCameraPermissions ?? useExpoCameraPermissionsStub)();

  const device = (useCameraDevice ?? useCameraDeviceStub)('front') as unknown;

  useEffect(() => {
    const granted = Boolean(visionPermission || expoPermission?.granted);
    setPermissionGranted(granted);
    if (granted && modulesAvailable) {
      setError((prev) => (prev === poseModuleLoadError ? undefined : prev));
    }
  }, [visionPermission, expoPermission?.granted, modulesAvailable]);

  const onResults = useCallback((result: { landmarks?: PoseLandmark[][] }) => {
    const lm = result?.landmarks?.[0];
    if (lm && lm.length >= 25) {
      setPose(lm);
      setIsDetecting(true);
    } else {
      setPose(null);
      setIsDetecting(false);
    }
  }, []);

  const onError = useCallback((err: { message?: string }) => {
    console.warn('[pose-native] detection error:', err?.message);
    setError(err?.message ?? 'Body tracking error. Try guided mode or rebuild the app.');
    setIsDetecting(false);
  }, []);

  const useMP = (useMediapipePoseDetection ?? useMediapipePoseStub) as (
    callbacks: { onResults: (r: { landmarks?: PoseLandmark[][] }) => void; onError: (e: { message?: string }) => void },
    mode: unknown,
    model: string,
    options: Record<string, unknown>,
  ) => MpSolution;

  const mpSolution = useMP(
    { onResults, onError },
    RunningMode?.LIVE_STREAM ?? 'LIVE_STREAM',
    MODEL_FILE,
    {
      numPoses: 1,
      minPoseDetectionConfidence: 0.4,
      minPosePresenceConfidence: 0.4,
      minTrackingConfidence: 0.4,
      delegate: Delegate?.GPU ?? Delegate?.CPU ?? 1,
      mirrorMode: 'mirror-front-only',
      shouldOutputSegmentationMasks: false,
    },
  );

  const requestCameraAccess = useCallback(async () => {
    if (!modulesAvailable) return false;

    if (visionPermission || expoPermission?.granted) {
      setPermissionGranted(true);
      return true;
    }

    let granted = false;

    if (requestVisionPermission) {
      try {
        granted = await requestVisionPermission();
      } catch {
        granted = false;
      }
    }

    if (!granted && requestExpoPermission) {
      try {
        const result = await requestExpoPermission();
        granted = Boolean(result?.granted);
      } catch {
        granted = false;
      }
    }

    setPermissionGranted(granted);
    if (!granted) {
      setError('Camera permission is required. Allow camera in the popup or in Settings.');
    } else {
      setError(undefined);
    }
    return granted;
  }, [expoPermission?.granted, modulesAvailable, requestExpoPermission, requestVisionPermission, visionPermission]);

  useEffect(() => {
    if (!modulesAvailable) {
      setError(friendlyPoseError(poseModuleLoadError));
    }
  }, [modulesAvailable]);

  useEffect(() => {
    if (isActive && modulesAvailable && !permissionGranted) {
      requestCameraAccess().catch(() => {});
    }
  }, [isActive, modulesAvailable, permissionGranted, requestCameraAccess]);

  const metrics = useMemo<PostureMetrics>(() => computeMetrics(pose), [pose]);

  const hasFrameProcessor = Boolean(mpSolution?.frameProcessor);
  const hasCamera = Boolean(
    modulesAvailable && permissionGranted && hasFrameProcessor && (device || mpSolution),
  );
  const cameraSupported = modulesAvailable;

  return {
    metrics,
    present: metrics.present,
    isDetecting: isActive && isDetecting,
    hasCamera,
    cameraSupported,
    permissionGranted,
    error: hasCamera ? undefined : error ? friendlyPoseError(error) : undefined,
    previewContainerId: PREVIEW_ID,
    requestCameraAccess,
    visionDevice: device,
    frameProcessor: mpSolution?.frameProcessor ?? null,
    cameraLayoutHandler: mpSolution?.cameraViewLayoutChangeHandler,
    cameraActive: isActive && hasCamera,
    mediapipeSolution: mpSolution,
  };
}

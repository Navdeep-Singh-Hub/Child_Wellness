/**
 * Native (APK) full-body pose detection via react-native-mediapipe-posedetection +
 * react-native-vision-camera frame processors. Feeds the same 33 BlazePose
 * landmarks into computeMetrics() as the web MediaPipe hook.
 *
 * Requires a dev-client / release build with the native module linked:
 *   npx expo run:android
 */
import {
  computeMetrics,
  type PoseLandmark,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { PoseDetectionResult } from '@/hooks/poseDetectionTypes';

const MODEL_FILE = 'pose_landmarker_lite.task';
const PREVIEW_ID = 'pose-preview-container';

type MpSolution = {
  frameProcessor: unknown;
  cameraViewLayoutChangeHandler: (event: unknown) => void;
} | null;

/** Stable no-op when vision-camera isn't available. */
function useCameraDeviceStub(_position: 'front' | 'back'): null {
  return null;
}

/** Stable no-op when the native module isn't linked (Expo Go). */
function useMediapipePoseStub(): MpSolution {
  return null;
}

// Conditional native imports — unavailable on web / Expo Go without native build.
let useCameraDevice: ((position: 'front' | 'back') => unknown) | null = null;
let Camera: { requestCameraPermission: () => Promise<string>; getCameraPermissionStatus?: () => string } | null = null;
let useMediapipePoseDetection: ((...args: unknown[]) => unknown) | null = null;
let RunningMode: { LIVE_STREAM: unknown } | null = null;
let Delegate: { GPU: unknown; CPU: unknown } | null = null;

if (Platform.OS !== 'web') {
  try {
    const visionCamera = require('react-native-vision-camera');
    useCameraDevice = visionCamera.useCameraDevice;
    Camera = visionCamera.Camera;
  } catch (e) {
    console.warn('[pose-native] vision-camera unavailable:', e);
  }
  try {
    const mp = require('react-native-mediapipe-posedetection');
    useMediapipePoseDetection = mp.usePoseDetection;
    RunningMode = mp.RunningMode;
    Delegate = mp.Delegate;
  } catch (e) {
    console.warn('[pose-native] mediapipe-posedetection unavailable — rebuild dev client:', e);
  }
}

export function usePoseDetectionNative(isActive: boolean = true): PoseDetectionResult {
  const [pose, setPose] = useState<PoseLandmark[] | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [moduleReady, setModuleReady] = useState(
    Boolean(useMediapipePoseDetection && RunningMode && Delegate && useCameraDevice),
  );

  const device = (useCameraDevice ?? useCameraDeviceStub)('front') as unknown;

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
    setError(err?.message ?? 'Body tracking error. Try rebuilding the app.');
    setIsDetecting(false);
  }, []);

  // Mediapipe hook — always invoked (stub when module missing) to satisfy Rules of Hooks.
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
      delegate: Delegate?.GPU ?? 1,
      mirrorMode: 'mirror-front-only',
      shouldOutputSegmentationMasks: false,
    },
  );

  useEffect(() => {
    if (!isActive || !Camera?.requestCameraPermission) return;

    const existing = Camera.getCameraPermissionStatus?.();
    if (existing === 'denied' || existing === 'restricted') {
      setPermissionGranted(false);
      setError('Camera permission is required. Enable it in Settings.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const status = await Camera!.requestCameraPermission();
        if (cancelled) return;
        const granted = status === 'granted';
        setPermissionGranted(granted);
        if (!granted) setError('Camera permission is required. Enable it in Settings.');
        else setError(undefined);
      } catch {
        if (!cancelled) setError('Could not request camera permission.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isActive]);

  useEffect(() => {
    if (!useMediapipePoseDetection) {
      setModuleReady(false);
      setError('Body tracking needs a native rebuild. Run: npx expo run:android');
    }
  }, []);

  const metrics = useMemo<PostureMetrics>(() => computeMetrics(pose), [pose]);

  const hasCamera = Boolean(device && mpSolution?.frameProcessor && permissionGranted && moduleReady);
  const cameraSupported = moduleReady;

  return {
    metrics,
    present: metrics.present,
    isDetecting: isActive && isDetecting,
    hasCamera,
    cameraSupported,
    error: hasCamera ? undefined : error,
    previewContainerId: PREVIEW_ID,
    visionDevice: device,
    frameProcessor: mpSolution?.frameProcessor ?? null,
    cameraLayoutHandler: mpSolution?.cameraViewLayoutChangeHandler,
    cameraActive: isActive && hasCamera,
  };
}

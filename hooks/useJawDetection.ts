import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { MouthLandmarks } from './useJawDetectionWeb';
import { useNativeFaceDetectorSafe } from './useNativeFaceDetector';

// Import web version for web platform - lazy load to avoid issues
let useJawDetectionWeb: any = null;

// Conditional imports for VisionCamera (only available in dev builds, not Expo Go)
let useFrameProcessor: any = null;
let useCameraDevice: any = null;
let Camera: any = null;
let runAsync: any = null;
let runOnJS: any = null;

if (Platform.OS !== 'web') {
  try {
    const visionCamera = require('react-native-vision-camera');
    useFrameProcessor = visionCamera.useFrameProcessor;
    useCameraDevice = visionCamera.useCameraDevice;
    Camera = visionCamera.Camera;
    runAsync = visionCamera.runAsync;
    const reanimated = require('react-native-reanimated');
    runOnJS = reanimated.runOnJS;
  } catch (e) {
    console.warn('Vision camera not available:', e);
  }
}

type Point = { x: number; y: number };

function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function meanPoint(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < points.length; i++) {
    sx += points[i].x;
    sy += points[i].y;
  }
  return { x: sx / points.length, y: sy / points.length };
}

export interface JawDetectionResult {
  isOpen: boolean;
  ratio: number;
  isDetecting: boolean;
  device: any;
  frameProcessor: any;
  hasCamera: boolean;
  error?: string;
  previewContainerId?: string;
  landmarks?: MouthLandmarks | null;
  lateralPosition?: 'left' | 'center' | 'right';
  lateralAmount?: number;
  protrusion?: number;
  tongueElevation?: number;
  tonguePosition?: { x: number; y: number };
  isTongueVisible?: boolean;
  smileAmount?: number;
  cheekExpansion?: number;
}

const OPEN_THRESHOLD = 0.22;
const CLOSE_THRESHOLD = 0.16;
const EMA_ALPHA = 0.25;
const THROTTLE_MS = 80;

/** Voice-only games on native: skip VisionCamera so expo-av mic can start. */
export const NATIVE_JAW_IDLE: JawDetectionResult = {
  isOpen: false,
  ratio: 0,
  isDetecting: false,
  device: null,
  frameProcessor: null,
  hasCamera: false,
  landmarks: null,
  lateralPosition: 'center',
  lateralAmount: 0,
  protrusion: 0,
  tongueElevation: 0,
  isTongueVisible: false,
  smileAmount: 0,
  cheekExpansion: 0,
};

interface FaceDetectionOptions {
  performanceMode?: 'fast' | 'accurate';
  landmarkMode?: 'none' | 'all';
  contourMode?: 'none' | 'all';
  classificationMode?: 'none' | 'all';
}

type NativeFace = {
  bounds: { width: number; height: number; x: number; y: number };
  smilingProbability?: number;
  contours?: {
    UPPER_LIP_TOP?: Point[];
    UPPER_LIP_BOTTOM?: Point[];
    LOWER_LIP_TOP?: Point[];
    LOWER_LIP_BOTTOM?: Point[];
    LEFT_CHEEK?: Point[];
    RIGHT_CHEEK?: Point[];
  };
  landmarks?: {
    MOUTH_LEFT?: Point;
    MOUTH_RIGHT?: Point;
    NOSE_BASE?: Point;
    MOUTH_BOTTOM?: Point;
  };
};

function processNativeFace(face: NativeFace): {
  ratio: number;
  isOpen: boolean;
  landmarks: MouthLandmarks | null;
  lateralPosition: 'left' | 'center' | 'right';
  lateralAmount: number;
  protrusion: number;
  tongueElevation: number;
  tonguePosition?: { x: number; y: number };
  isTongueVisible: boolean;
  smileAmount: number;
  cheekExpansion: number;
} | null {
  const contours = face.contours;
  const landmarks = face.landmarks;
  if (!contours && !landmarks) return null;

  const upperLipPoints = contours?.UPPER_LIP_TOP?.length
    ? contours.UPPER_LIP_TOP
    : contours?.UPPER_LIP_BOTTOM ?? [];
  const lowerLipPoints = contours?.LOWER_LIP_BOTTOM?.length
    ? contours.LOWER_LIP_BOTTOM
    : contours?.LOWER_LIP_TOP ?? [];

  if (!upperLipPoints.length || !lowerLipPoints.length) return null;

  const upperLip = meanPoint(upperLipPoints);
  const lowerLip = meanPoint(lowerLipPoints);
  const mouthLeft = landmarks?.MOUTH_LEFT;
  const mouthRight = landmarks?.MOUTH_RIGHT;
  const mouthWidth =
    mouthLeft && mouthRight
      ? dist(mouthLeft, mouthRight)
      : Math.max(1, face.bounds.width * 0.35);

  const gap = dist(upperLip, lowerLip);
  const rawRatio = gap / Math.max(1, mouthWidth);

  const verticalDisplacement = lowerLip.y - (upperLip.y + 2);
  const protrusion = Math.max(0, Math.min(1, (verticalDisplacement / Math.max(1, face.bounds.height) + 0.05) * 8));

  const faceCenterX = mouthLeft && mouthRight ? (mouthLeft.x + mouthRight.x) / 2 : face.bounds.x + face.bounds.width / 2;
  const chinX = landmarks?.MOUTH_BOTTOM?.x ?? lowerLip.x;
  let lateralAmount = Math.max(-1, Math.min(1, ((chinX - faceCenterX) / Math.max(1, mouthWidth)) * 2.5));
  let lateralPosition: 'left' | 'center' | 'right' = 'center';
  if (lateralAmount > 0.25) lateralPosition = 'right';
  else if (lateralAmount < -0.25) lateralPosition = 'left';

  const smileAmount = Math.max(0, Math.min(1, face.smilingProbability ?? 0));

  let cheekExpansion = 0;
  if (contours?.LEFT_CHEEK?.length && contours?.RIGHT_CHEEK?.length) {
    const left = meanPoint(contours.LEFT_CHEEK);
    const right = meanPoint(contours.RIGHT_CHEEK);
    const cheekSpan = dist(left, right);
    cheekExpansion = Math.max(0, Math.min(1, cheekSpan / Math.max(1, face.bounds.width) - 0.55));
  }

  const isOpen = rawRatio > OPEN_THRESHOLD;
  const tongueElevation = isOpen
    ? Math.max(0, Math.min(1, 1 - rawRatio / 0.35))
    : 0;
  const tonguePosition = landmarks?.MOUTH_BOTTOM
    ? { x: landmarks.MOUTH_BOTTOM.x, y: landmarks.MOUTH_BOTTOM.y }
    : { x: lowerLip.x, y: lowerLip.y };
  const isTongueVisible = isOpen && tongueElevation > 0.2;

  const mouthLandmarks: MouthLandmarks = {
    upperLip: upperLipPoints,
    lowerLip: lowerLipPoints,
    mouthLeft: mouthLeft ?? null,
    mouthRight: mouthRight ?? null,
    allMouthLandmarks: [...upperLipPoints, ...lowerLipPoints],
  };

  return {
    ratio: rawRatio,
    isOpen,
    landmarks: mouthLandmarks,
    lateralPosition,
    lateralAmount,
    protrusion,
    tongueElevation,
    tonguePosition,
    isTongueVisible,
    smileAmount,
    cheekExpansion,
  };
}

export function useJawDetection(
  isActive: boolean = true,
  options?: FaceDetectionOptions
): JawDetectionResult {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    if (!useJawDetectionWeb) {
      try {
        const webHook = require('./useJawDetectionWeb');
        useJawDetectionWeb = webHook.useJawDetectionWeb;
      } catch (e) {
        console.error('Failed to load web hook:', e);
        return {
          isOpen: false,
          ratio: 0,
          isDetecting: false,
          device: null,
          frameProcessor: null,
          hasCamera: false,
          error: 'Failed to load web camera detection. Please refresh the page.',
        };
      }
    }

    if (useJawDetectionWeb) {
      return useJawDetectionWeb(isActive);
    }

    return {
      isOpen: false,
      ratio: 0,
      isDetecting: false,
      device: null,
      frameProcessor: null,
      hasCamera: false,
      error: 'Web camera detection not available. Please check browser permissions.',
    };
  }

  const [isOpen, setIsOpen] = useState(false);
  const [ratio, setRatio] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [landmarks, setLandmarks] = useState<MouthLandmarks | null>(null);
  const [lateralPosition, setLateralPosition] = useState<'left' | 'center' | 'right'>('center');
  const [lateralAmount, setLateralAmount] = useState(0);
  const [protrusion, setProtrusion] = useState(0);
  const [tongueElevation, setTongueElevation] = useState(0);
  const [tonguePosition, setTonguePosition] = useState<{ x: number; y: number } | undefined>();
  const [isTongueVisible, setIsTongueVisible] = useState(false);
  const [smileAmount, setSmileAmount] = useState(0);
  const [cheekExpansion, setCheekExpansion] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const device = useCameraDevice ? useCameraDevice('front') : null;
  const ema = useRef(0);
  const lastTimestamp = useRef(0);
  const currentIsOpen = useRef(false);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const faceDetectionOptions = useMemo(
    () => ({
      performanceMode: 'fast' as const,
      landmarkMode: 'all' as const,
      contourMode: 'all' as const,
      classificationMode: 'all' as const,
      cameraFacing: 'front' as const,
      minFaceSize: 0.12,
      ...options,
    }),
    [options]
  );

  const faceDetectorPlugin = useNativeFaceDetectorSafe(faceDetectionOptions);
  const detectFaces = faceDetectorPlugin?.detectFaces;
  const stopFaceListeners = faceDetectorPlugin?.stopListeners;

  const updateJawState = useCallback((newRatio: number, newIsOpen: boolean) => {
    setRatio(newRatio);
    setIsOpen(newIsOpen);
    currentIsOpen.current = newIsOpen;
  }, []);

  const updateDetectionState = useCallback((detecting: boolean) => {
    setIsDetecting(detecting);
  }, []);

  const updateError = useCallback((err: string | undefined) => {
    setError(err);
  }, []);

  const handleFaces = useCallback(
    (faces: NativeFace[]) => {
      if (!isActiveRef.current) return;

      const now = Date.now();
      if (now - lastTimestamp.current < THROTTLE_MS) return;
      lastTimestamp.current = now;

      if (!faces?.length) {
        updateDetectionState(false);
        return;
      }

      updateDetectionState(true);
      const parsed = processNativeFace(faces[0]);
      if (!parsed) return;

      const smoothed =
        ema.current === 0 ? parsed.ratio : EMA_ALPHA * parsed.ratio + (1 - EMA_ALPHA) * ema.current;
      ema.current = smoothed;

      const nextIsOpen = currentIsOpen.current
        ? smoothed > CLOSE_THRESHOLD
        : smoothed > OPEN_THRESHOLD;

      updateJawState(smoothed, nextIsOpen);
      setLandmarks(parsed.landmarks);
      setLateralPosition(parsed.lateralPosition);
      setLateralAmount(parsed.lateralAmount);
      setProtrusion(parsed.protrusion);
      setTongueElevation(parsed.tongueElevation);
      setTonguePosition(parsed.tonguePosition);
      setIsTongueVisible(parsed.isTongueVisible);
      setSmileAmount(parsed.smileAmount);
      setCheekExpansion(parsed.cheekExpansion);
    },
    [updateDetectionState, updateJawState]
  );

  const handleFacesOnJS = useMemo(() => {
    if (!runOnJS) return null;
    return runOnJS(handleFaces);
  }, [handleFaces]);

  useEffect(() => {
    if (!isActive) return;
    if (!Camera?.requestCameraPermission) return;

    const existing = Camera.getCameraPermissionStatus?.();
    if (existing === 'denied' || existing === 'restricted') {
      setPermissionGranted(false);
      updateError('Camera permission is required for this game. Enable it in Settings.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        if (cancelled) return;
        const granted = status === 'granted';
        setPermissionGranted(granted);
        if (!granted) {
          updateError('Camera permission is required for this game. Enable it in Settings.');
        }
      } catch (e) {
        if (!cancelled) {
          updateError('Could not request camera permission.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isActive, updateError]);

  useEffect(() => {
    return () => {
      stopFaceListeners?.();
    };
  }, [stopFaceListeners]);

  const hasCamera =
    Boolean(useCameraDevice && device && detectFaces && permissionGranted);

  useEffect(() => {
    if (!useCameraDevice) {
      updateError(
        'VisionCamera not available. Rebuild the app with: npx expo run:android'
      );
    } else if (!device) {
      updateError('Front camera not found on this device.');
    } else if (!permissionGranted && !error) {
      updateError(undefined);
    }
  }, [device, detectFaces, permissionGranted, error, updateError]);

  // Always invoke useFrameProcessor (never behind permissionGranted) — conditional hooks crash on HMR.
  const frameProcessor =
    useFrameProcessor && runAsync
      ? useFrameProcessor(
          (frame: any) => {
            'worklet';
            if (!isActive) return;
            if (!detectFaces || !handleFacesOnJS) return;
            runAsync(frame, () => {
              'worklet';
              try {
                const faces = detectFaces(frame);
                handleFacesOnJS(faces);
              } catch {
                // Frame dropped — ignore
              }
            });
          },
          [detectFaces, handleFacesOnJS, isActive, runAsync],
        )
      : null;

  return {
    isOpen,
    ratio,
    isDetecting,
    device,
    frameProcessor,
    hasCamera,
    error,
    landmarks,
    lateralPosition,
    lateralAmount,
    protrusion,
    tongueElevation,
    tonguePosition,
    isTongueVisible,
    smileAmount,
    cheekExpansion,
  };
}

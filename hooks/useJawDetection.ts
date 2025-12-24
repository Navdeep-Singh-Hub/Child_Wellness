import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Import web version for web platform - lazy load to avoid issues
let useJawDetectionWeb: any = null;

// Conditional imports for VisionCamera (only available in dev builds, not Expo Go)
let useFrameProcessor: any = null;
let useCameraDevice: any = null;
let Camera: any = null;
let runOnJS: any = null;

if (Platform.OS !== 'web') {
  try {
    const visionCamera = require('react-native-vision-camera');
    useFrameProcessor = visionCamera.useFrameProcessor;
    useCameraDevice = visionCamera.useCameraDevice;
    Camera = visionCamera.Camera;
    const reanimated = require('react-native-reanimated');
    runOnJS = reanimated.runOnJS;
  } catch (e) {
    console.warn('react-native-vision-camera not available:', e);
  }
}

type Point = { x: number; y: number };

function dist(a: Point, b: Point): number {
  'worklet';
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function meanPoint(points: Point[]): Point {
  'worklet';
  if (points.length === 0) return { x: 0, y: 0 };
  let sx = 0, sy = 0;
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
}

// Constants for jaw detection
const OPEN_THRESHOLD = 0.22;
const CLOSE_THRESHOLD = 0.16;
const EMA_ALPHA = 0.25;
const THROTTLE_MS = 80; // ~12 fps

interface FaceDetectionOptions {
  performanceMode?: 'fast' | 'accurate';
  landmarkMode?: 'none' | 'all';
  contourMode?: 'none' | 'all';
  classificationMode?: 'none' | 'all';
}

export function useJawDetection(
  isActive: boolean = true,
  options?: FaceDetectionOptions
): JawDetectionResult {
  // Use web version if on web platform
  // Check Platform.OS at runtime, not module load time
  // React Native Web sets Platform.OS to 'web', but also check for browser globals
  const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined' && navigator.mediaDevices);
  
  // Early return for web - must happen before any hooks are called
  if (isWeb) {
    // Try to load web hook if not already loaded
    if (!useJawDetectionWeb) {
      try {
        const webHook = require('./useJawDetectionWeb');
        useJawDetectionWeb = webHook.useJawDetectionWeb;
        if (!useJawDetectionWeb) {
          console.error('useJawDetectionWeb export not found in module');
        }
      } catch (e) {
        console.error('Failed to load web hook:', e);
        // Return early with error instead of falling through to native
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
    } else {
      console.warn('Web hook not available, returning fallback');
      // Return web-compatible result even if hook failed to load
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
  }
  
  // Native code path - only execute if NOT web

  const [isOpen, setIsOpen] = useState(false);
  const [ratio, setRatio] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const device = useCameraDevice ? useCameraDevice('front') : null;
  const ema = useRef(0);
  const lastTimestamp = useRef(0);
  const currentIsOpen = useRef(false);

  const faceDetectionOptions = useMemo<FaceDetectionOptions>(() => ({
    performanceMode: 'fast',
    landmarkMode: 'all',
    contourMode: 'all',
    classificationMode: 'none',
    ...options,
  }), [options]);

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

  // Check if VisionCamera is available
  const hasCamera = useCameraDevice !== null && device !== null;

  useEffect(() => {
    // Only show this error on native platforms, not web
    // Double-check we're not on web before showing error
    const isWebCheck = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof document !== 'undefined');
    if (!hasCamera && !isWebCheck) {
      updateError('VisionCamera not available. Please use a dev build (npx expo run:android or npx expo run:ios) instead of Expo Go.');
    }
  }, [hasCamera, updateError]);

  const frameProcessor = useFrameProcessor ? useFrameProcessor((frame: any) => {
    'worklet';
    
    // Throttle frame processing
    const now = Date.now();
    if (now - lastTimestamp.current < THROTTLE_MS) return;
    lastTimestamp.current = now;

    // TODO: Replace with actual face detection when package is installed
    // This structure is ready for react-native-vision-camera-face-detector
    // 
    // Example implementation (uncomment when package is installed):
    // 
    // const { detectFaces } = useFaceDetector(faceDetectionOptions);
    // const faces = detectFaces(frame);
    // 
    // if (!faces || faces.length === 0) {
    //   runOnJS(updateDetectionState)(false);
    //   return;
    // }
    //
    // runOnJS(updateDetectionState)(true);
    //
    // const face = faces[0];
    // const contours = face.contours;
    // const landmarks = face.landmarks;
    //
    // // Get upper and lower lip points
    // const upperLipPoints = contours?.UPPER_LIP_TOP;
    // const lowerLipPoints = contours?.LOWER_LIP_BOTTOM;
    // 
    // if (!upperLipPoints?.length || !lowerLipPoints?.length) {
    //   runOnJS(updateDetectionState)(false);
    //   return;
    // }
    //
    // const upperLip = meanPoint(upperLipPoints);
    // const lowerLip = meanPoint(lowerLipPoints);
    //
    // // Calculate mouth width (normalization factor)
    // let mouthWidth = face.bounds?.width ?? 200;
    // if (landmarks?.MOUTH_LEFT && landmarks?.MOUTH_RIGHT) {
    //   mouthWidth = dist(landmarks.MOUTH_LEFT, landmarks.MOUTH_RIGHT);
    // }
    //
    // // Calculate vertical gap between lips
    // const gap = dist(upperLip, lowerLip);
    // const rawRatio = gap / Math.max(1, mouthWidth);
    //
    // // Apply EMA smoothing
    // const smoothed = ema.current === 0 
    //   ? rawRatio 
    //   : EMA_ALPHA * rawRatio + (1 - EMA_ALPHA) * ema.current;
    // ema.current = smoothed;
    //
    // // Hysteresis threshold to prevent flicker
    // const nextIsOpen = currentIsOpen.current
    //   ? smoothed > CLOSE_THRESHOLD
    //   : smoothed > OPEN_THRESHOLD;
    //
    // if (runOnJS) {
    //   runOnJS(updateJawState)(smoothed, nextIsOpen);
    // }

    // For now, return empty processor (will be filled when face detector is installed)
  }, []) : null;

  return {
    isOpen,
    ratio,
    isDetecting,
    device,
    frameProcessor,
    hasCamera: hasCamera || false,
    error,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  getVisionNativeModule,
  parseFaceData,
  parseGameEvent,
  parseHandData,
  parsePoseData,
} from './nativeModule';
import type {
  FaceTrackingData,
  HandTrackingData,
  PoseTrackingData,
  VisionDifficulty,
  VisionGameEvent,
  VisionTrackingOptions,
  VisionTrackingResult,
  VisionTrackingSnapshot,
} from './visionTypes';
import { VISION_REBUILD_MSG } from './visionTypes';
import { useVisionTrackingWeb } from './useVisionTrackingWeb';

const EMPTY_SNAPSHOT: VisionTrackingSnapshot = {
  face: null,
  hands: null,
  pose: null,
  lastEvent: null,
};

function useVisionTrackingNative(isActive: boolean, difficulty: VisionDifficulty): VisionTrackingResult {
  const native = getVisionNativeModule();
  const [snapshot, setSnapshot] = useState<VisionTrackingSnapshot>(EMPTY_SNAPSHOT);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | undefined>(
    native ? undefined : VISION_REBUILD_MSG,
  );
  const optionsRef = useRef<VisionTrackingOptions>({ difficulty, targetFps: 25 });

  useEffect(() => {
    optionsRef.current.difficulty = difficulty;
  }, [difficulty]);

  useEffect(() => {
    if (!native || !isActive) return;

    const subs = [
      native.addListener('onFaceData', (payload) => {
        setSnapshot((prev) => ({ ...prev, face: parseFaceData(payload) }));
      }),
      native.addListener('onHandData', (payload) => {
        setSnapshot((prev) => ({ ...prev, hands: parseHandData(payload) }));
      }),
      native.addListener('onPoseData', (payload) => {
        setSnapshot((prev) => ({ ...prev, pose: parsePoseData(payload) }));
      }),
      native.addListener('onGameEvent', (payload) => {
        const event = parseGameEvent(payload);
        if (event) setSnapshot((prev) => ({ ...prev, lastEvent: event }));
      }),
    ];

    native
      .startTracking({ ...optionsRef.current, difficulty })
      .then((ok) => {
        setIsTracking(ok);
        if (!ok) setError('Could not start vision tracking.');
      })
      .catch((e: Error) => setError(e.message));

    return () => {
      subs.forEach((s) => s.remove());
      native.stopTracking().catch(() => {});
      setIsTracking(false);
    };
  }, [native, isActive, difficulty]);

  const startTracking = useCallback(async (options?: VisionTrackingOptions) => {
    if (!native) {
      setError(VISION_REBUILD_MSG);
      return false;
    }
    optionsRef.current = { ...optionsRef.current, ...options };
    const ok = await native.startTracking(optionsRef.current);
    setIsTracking(ok);
    return ok;
  }, [native]);

  const stopTracking = useCallback(async () => {
    if (!native) return false;
    const ok = await native.stopTracking();
    setIsTracking(false);
    return ok;
  }, [native]);

  const resetCalibration = useCallback(async () => {
    if (!native) return false;
    return native.resetCalibration();
  }, [native]);

  const setDifficultyLevel = useCallback(async (level: VisionDifficulty) => {
    if (!native) return false;
    optionsRef.current.difficulty = level;
    return native.setDifficulty(level);
  }, [native]);

  return {
    snapshot,
    isTracking,
    isModuleAvailable: Boolean(native),
    hasPreview: Boolean(native),
    error,
    startTracking,
    stopTracking,
    resetCalibration,
    setDifficulty: setDifficultyLevel,
  };
}

/** Unified vision tracking for OT head-movement games (native CameraX + MediaPipe, web FaceLandmarker). */
export function useVisionTracking(
  isActive = true,
  difficulty: VisionDifficulty = 'easy',
  options?: VisionTrackingOptions,
): VisionTrackingResult {
  const web = useVisionTrackingWeb(isActive, difficulty, options);
  const native = useVisionTrackingNative(isActive, difficulty);

  return useMemo(() => {
    if (Platform.OS === 'web') return web;
    if (native.isModuleAvailable) return native;
    return web.isModuleAvailable ? web : native;
  }, [native, web]);
}

export { VisionTrackingView } from './VisionTrackingView';

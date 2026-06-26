import { useCallback, useEffect, useRef, useState } from 'react';
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
import { DIFFICULTY_DEGREES } from './visionTypes';
import {
  createHeadStabilityTracker,
  evaluateGameEvents,
  extractFaceMetricsFromLandmarks,
} from './headStability';

const EMPTY_SNAPSHOT: VisionTrackingSnapshot = {
  face: null,
  hands: null,
  pose: null,
  lastEvent: null,
};

let FaceLandmarkerClass: any = null;
let FilesetResolverClass: any = null;

async function loadMediaPipe() {
  if (FaceLandmarkerClass) return;
  const vision = await import('@mediapipe/tasks-vision');
  FaceLandmarkerClass = vision.FaceLandmarker;
  FilesetResolverClass = vision.FilesetResolver;
}

export function useVisionTrackingWeb(
  isActive: boolean,
  difficulty: VisionDifficulty,
  _options?: VisionTrackingOptions,
): VisionTrackingResult {
  const [snapshot, setSnapshot] = useState<VisionTrackingSnapshot>(EMPTY_SNAPSHOT);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const landmarkerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const trackerRef = useRef(createHeadStabilityTracker(difficulty));
  const gameRef = useRef({ emitted: new Set<string>() });

  useEffect(() => {
    trackerRef.current.setDifficulty(DIFFICULTY_DEGREES[difficulty]);
  }, [difficulty]);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const startTracking = useCallback(async () => {
    try {
      await loadMediaPipe();
      if (!landmarkerRef.current) {
        const wasm = await FilesetResolverClass.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
        );
        landmarkerRef.current = await FaceLandmarkerClass.createFromOptions(wasm, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });
      }

      if (!videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false,
        });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        await video.play();
        videoRef.current = video;
      }

      trackerRef.current.reset();
      gameRef.current.emitted.clear();
      setIsTracking(true);
      setError(undefined);

      const tick = () => {
        const video = videoRef.current;
        const lm = landmarkerRef.current;
        if (!video || !lm || !isActive) return;
        const now = performance.now();
        const result = lm.detectForVideo(video, now);
        if (result.faceLandmarks?.[0]) {
          const landmarks = result.faceLandmarks[0].map((p: { x: number; y: number; z?: number }) => ({
            x: p.x,
            y: p.y,
            z: p.z,
          }));
          const matrix = result.facialTransformationMatrixes?.[0]?.data;
          const metrics = extractFaceMetricsFromLandmarks(landmarks, matrix);
          const stability = trackerRef.current.update(now, metrics);
          const face: FaceTrackingData = {
            ...metrics,
            stabilityScore: stability.stabilityScore,
            movementSpeed: stability.movementSpeed,
            rotationAmount: stability.rotationAmount,
            stableMs: stability.stableMs,
          };
          const events = evaluateGameEvents(now, face, null, gameRef.current.emitted);
          if (stability.crownFall && !gameRef.current.emitted.has('CROWN_FALL')) {
            gameRef.current.emitted.add('CROWN_FALL');
            events.push({ type: 'CROWN_FALL', timestamp: now });
          } else if (!stability.crownFall) {
            gameRef.current.emitted.delete('CROWN_FALL');
          }
          const lastEvent = events.length ? events[events.length - 1] : null;
          setSnapshot({ face, hands: null, pose: null, lastEvent });
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Web vision tracking unavailable');
      return false;
    }
  }, [isActive]);

  const stopTracking = useCallback(async () => {
    stopLoop();
    videoRef.current?.srcObject &&
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    videoRef.current = null;
    setIsTracking(false);
    return true;
  }, [stopLoop]);

  useEffect(() => {
    if (isActive) startTracking();
    else stopTracking();
    return () => {
      stopTracking();
    };
  }, [isActive, startTracking, stopTracking]);

  return {
    snapshot,
    isTracking,
    isModuleAvailable: typeof window !== 'undefined' && !!navigator.mediaDevices,
    hasPreview: false,
    error,
    startTracking,
    stopTracking,
    resetCalibration: async () => {
      trackerRef.current.reset();
      return true;
    },
    setDifficulty: async (level) => {
      trackerRef.current.setDifficulty(DIFFICULTY_DEGREES[level]);
      return true;
    },
  };
}

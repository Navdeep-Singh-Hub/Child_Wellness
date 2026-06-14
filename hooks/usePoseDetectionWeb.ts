/**
 * Web full-body pose detection using MediaPipe PoseLandmarker (@mediapipe/tasks-vision).
 * Streams 33 BlazePose landmarks from the front camera for OT posture games.
 *
 * Mirrors the structure of useHandDetectionWeb but tuned for a single body pose.
 */

import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { PoseLandmark } from '@/components/game/occupational/level6/session1/poseUtils';

export interface PoseDetectionWebResult {
  pose: PoseLandmark[] | null;
  isDetecting: boolean;
  hasCamera: boolean;
  error?: string;
  previewContainerId: string;
}

const THROTTLE_MS = 70; // ~14 fps

let PoseLandmarker: any = null;
let FilesetResolver: any = null;
let poseLandmarker: any = null;
let isInitialized = false;

async function loadLibrary(): Promise<boolean> {
  if (PoseLandmarker && FilesetResolver) return true;
  try {
    if (typeof window === 'undefined') return false;
    const mod = await import('@mediapipe/tasks-vision');
    PoseLandmarker = mod.PoseLandmarker;
    FilesetResolver = mod.FilesetResolver;
    return !!(PoseLandmarker && FilesetResolver);
  } catch (err) {
    console.error('[pose] Failed to load MediaPipe tasks-vision:', err);
    return false;
  }
}

async function initLandmarker(): Promise<boolean> {
  if (isInitialized && poseLandmarker) return true;
  try {
    if (typeof window === 'undefined') return false;
    const ok = await loadLibrary();
    if (!ok) return false;

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
    );

    const buildOptions = (delegate: 'GPU' | 'CPU') => ({
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate,
      },
      runningMode: 'VIDEO' as const,
      numPoses: 1,
      minPoseDetectionConfidence: 0.4,
      minPosePresenceConfidence: 0.4,
      minTrackingConfidence: 0.4,
    });

    try {
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, buildOptions('GPU'));
    } catch (gpuErr) {
      console.warn('[pose] GPU init failed, falling back to CPU:', gpuErr);
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, buildOptions('CPU'));
    }

    isInitialized = true;
    console.log('✅ [pose] PoseLandmarker ready');
    return true;
  } catch (err) {
    console.error('❌ [pose] PoseLandmarker init failed:', err);
    return false;
  }
}

function extractPose(video: HTMLVideoElement): PoseLandmark[] | null {
  if (!poseLandmarker || typeof poseLandmarker.detectForVideo !== 'function') return null;
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
  if (video.paused || video.ended) {
    video.play().catch(() => {});
    return null;
  }
  try {
    const result = poseLandmarker.detectForVideo(video, performance.now());
    const landmarks = result?.landmarks;
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length === 0) return null;
    const pose = landmarks[0];
    if (!Array.isArray(pose) || pose.length < 25) return null;
    return pose as PoseLandmark[];
  } catch {
    return null;
  }
}

export function usePoseDetectionWeb(isActive: boolean = true): PoseDetectionWebResult {
  const [pose, setPose] = useState<PoseLandmark[] | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastTs = useRef(0);
  const previewContainerId = 'pose-preview-container';

  // Init model once.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      initLandmarker().then((ok) => {
        if (!ok) setError('Could not start body tracking. Try a modern browser.');
      });
    }
  }, []);

  // Camera setup.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    let cancelled = false;
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setHasCamera(true);
        setError(undefined);

        // Hidden processing video (kept in DOM so frames decode).
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.style.position = 'fixed';
        video.style.width = '2px';
        video.style.height = '2px';
        video.style.opacity = '0.01';
        video.style.pointerEvents = 'none';
        video.style.zIndex = '-1';
        document.body.appendChild(video);
        videoRef.current = video;
        video.play().catch(() => {});

        // Mirror the stream into any visible preview container.
        const attachPreview = () => {
          const container =
            document.getElementById(previewContainerId) ||
            (document.querySelector(`[data-native-id="${previewContainerId}"]`) as HTMLElement | null);
          if (!container) return false;
          let preview = container.querySelector('video[data-pose-preview]') as HTMLVideoElement | null;
          if (!preview) {
            preview = document.createElement('video');
            preview.setAttribute('data-pose-preview', 'true');
            preview.autoplay = true;
            preview.playsInline = true;
            preview.muted = true;
            preview.style.width = '100%';
            preview.style.height = '100%';
            preview.style.objectFit = 'cover';
            preview.style.transform = 'scaleX(-1)'; // selfie mirror feels natural
            container.appendChild(preview);
          }
          preview.srcObject = stream;
          preview.play().catch(() => {});
          return true;
        };
        if (!attachPreview()) setTimeout(attachPreview, 150);
      } catch (err: any) {
        setHasCamera(false);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Allow the camera to play.');
        } else if (err?.name === 'NotFoundError') {
          setError('No camera found.');
        } else {
          setError('Could not access the camera.');
        }
      }
    };
    setup();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.remove();
        videoRef.current = null;
      }
      const preview = document.querySelector('video[data-pose-preview]') as HTMLVideoElement | null;
      if (preview) {
        preview.srcObject = null;
        preview.remove();
      }
      setHasCamera(false);
    };
  }, []);

  // Frame loop.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!isActive || !hasCamera) return;

    const tick = () => {
      const video = videoRef.current;
      if (!video || !isInitialized) return;
      const now = Date.now();
      if (now - lastTs.current < THROTTLE_MS) return;
      lastTs.current = now;
      const p = extractPose(video);
      if (p) {
        setPose(p);
        setIsDetecting(true);
      } else {
        setIsDetecting(false);
        setPose(null);
      }
    };

    intervalRef.current = setInterval(tick, THROTTLE_MS) as unknown as number;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, hasCamera]);

  return { pose, isDetecting, hasCamera, error, previewContainerId };
}

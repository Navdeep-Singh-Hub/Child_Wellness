/**
 * Web lip detection — MediaPipe FaceMesh, upper/lower lip center only.
 */

import { LipDetectionEngine, LOWER_LIP_INDEX, UPPER_LIP_INDEX } from '@/components/game/speech/lip-closure/modules/LipDetectionEngine';
import { FPSOptimizer } from '@/components/game/speech/lip-closure/modules/FPSOptimizer';
import type { LipDetectionSnapshot } from '@/components/game/speech/lip-closure/modules/types';
import { useEffect, useRef, useState } from 'react';

export interface LipDetectionResult extends LipDetectionSnapshot {
  isDetecting: boolean;
  hasCamera: boolean;
  error?: string;
  previewContainerId?: string;
}

const IDLE: LipDetectionResult = {
  lipsClosed: false,
  holdDuration: 0,
  confidence: 0,
  smoothedGap: 99,
  unstable: true,
  isDetecting: false,
  hasCamera: false,
};

let FaceLandmarker: any = null;
let FilesetResolver: any = null;
let faceLandmarker: any = null;
let isInitialized = false;

async function initMediaPipe() {
  if (isInitialized && faceLandmarker) return true;
  if (typeof window === 'undefined') return false;
  try {
    const mod = await import('@mediapipe/tasks-vision');
    FaceLandmarker = mod.FaceLandmarker;
    FilesetResolver = mod.FilesetResolver;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: false,
      runningMode: 'VIDEO',
      numFaces: 1,
    });
    isInitialized = true;
    return true;
  } catch (e) {
    console.warn('[lip detection web] init failed', e);
    return false;
  }
}

export function useLipDetectionWeb(enabled: boolean): LipDetectionResult {
  const [result, setResult] = useState<LipDetectionResult>(IDLE);
  const engineRef = useRef(new LipDetectionEngine());
  const fpsRef = useRef(new FPSOptimizer(25));
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const containerId = 'lip-detection-preview';

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setResult(IDLE);
      return;
    }

    let cancelled = false;
    engineRef.current.reset();

    const loop = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && faceLandmarker && video.readyState >= 2 && fpsRef.current.shouldProcess()) {
        try {
          const detection = faceLandmarker.detectForVideo(video, performance.now());
          const lm = detection?.faceLandmarks?.[0];
          if (lm) {
            const snap = engineRef.current.processLandmarks(
              lm[UPPER_LIP_INDEX],
              lm[LOWER_LIP_INDEX],
            );
            setResult({
              ...snap,
              isDetecting: true,
              hasCamera: true,
              previewContainerId: containerId,
            });
          } else {
            setResult((r) => ({ ...r, unstable: true, confidence: 0.2, isDetecting: true, hasCamera: true }));
          }
        } catch {
          /* non-fatal */
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    (async () => {
      const ok = await initMediaPipe();
      if (!ok || cancelled) {
        setResult({ ...IDLE, error: 'Camera setup failed. Use Close / Open buttons.' });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        let container = document.getElementById(containerId);
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          container.style.cssText =
            'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;';
          document.body.appendChild(container);
        }
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.srcObject = stream;
        await video.play();
        videoRef.current = video;
        container.appendChild(video);
        setResult({ ...IDLE, isDetecting: true, hasCamera: true, previewContainerId: containerId });
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        setResult({ ...IDLE, error: 'Allow camera access, or use Close / Open buttons.' });
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      videoRef.current?.srcObject &&
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current = null;
      engineRef.current.reset();
    };
  }, [enabled]);

  return result;
}

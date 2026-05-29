import { LipTransitionEngine } from '@/components/game/speech/lip-closure/modules/LipTransitionEngine';
import type { LipTransitionSnapshot } from '@/components/game/speech/lip-closure/modules/lipTransitionTypes';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useNativeLipPoll } from '@/hooks/useNativeLipPoll';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { LipTransitionResult } from './useLipTransitionDetectionWeb';

let useLipTransitionDetectionWebHook: ((enabled: boolean) => LipTransitionResult) | null = null;

const IDLE: LipTransitionResult = {
  lipPose: 'NEUTRAL',
  confirmedPose: false,
  poseHoldDuration: 0,
  smoothedRound: 0,
  smoothedSpread: 0,
  confidence: 0,
  unstable: true,
  inGracePeriod: false,
  lastTransition: null,
  isDetecting: false,
  hasCamera: false,
};

export function useLipTransitionDetection(enabled: boolean): LipTransitionResult & {
  device: unknown;
  frameProcessor: unknown;
} {
  if (Platform.OS === 'web') {
    if (!useLipTransitionDetectionWebHook) {
      try {
        useLipTransitionDetectionWebHook = require('./useLipTransitionDetectionWeb').useLipTransitionDetectionWeb;
      } catch (e) {
        console.error('[lip transition] web hook load failed', e);
        return {
          ...IDLE,
          error: 'Lip transition camera unavailable on web.',
          device: null,
          frameProcessor: null,
        };
      }
    }
    const web = useLipTransitionDetectionWebHook!(enabled);
    return { ...web, device: null, frameProcessor: null };
  }

  return useLipTransitionDetectionNative(enabled);
}

function useLipTransitionDetectionNative(enabled: boolean) {
  const jaw = useJawDetection(enabled);
  const engineRef = useRef(new LipTransitionEngine());
  const [snap, setSnap] = useState<LipTransitionSnapshot>({
    lipPose: 'NEUTRAL',
    confirmedPose: false,
    poseHoldDuration: 0,
    smoothedRound: 0,
    smoothedSpread: 0,
    confidence: 0,
    unstable: true,
    inGracePeriod: false,
    lastTransition: null,
  });

  useEffect(() => {
    if (!enabled) engineRef.current.reset();
  }, [enabled]);

  const jawRef = useRef(jaw);
  jawRef.current = jaw;

  useNativeLipPoll(enabled, jaw.isDetecting, () => {
    const j = jawRef.current;
    const mar = Math.max(0.08, j.ratio);
    setSnap(engineRef.current.processRatios(mar, 1 / mar + (j.smileAmount ?? 0) * 1.5));
  });

  return {
    ...snap,
    isDetecting: jaw.isDetecting,
    hasCamera: jaw.hasCamera,
    error: jaw.error,
    device: jaw.device,
    frameProcessor: jaw.frameProcessor,
    previewContainerId: jaw.previewContainerId,
  };
}

export type { LipTransitionResult };

import { LipRoundnessEngine } from '@/components/game/speech/lip-closure/modules/LipRoundnessEngine';
import type { LipRoundSnapshot } from '@/components/game/speech/lip-closure/modules/lipRoundTypes';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useNativeLipPoll } from '@/hooks/useNativeLipPoll';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { LipRoundnessResult } from './useLipRoundnessDetectionWeb';

let useLipRoundnessDetectionWebHook: ((enabled: boolean) => LipRoundnessResult) | null = null;

const IDLE: LipRoundnessResult = {
  roundedLips: false,
  confirmedRounded: false,
  roundnessScore: 0,
  smoothedRatio: 0,
  holdDuration: 0,
  confidence: 0,
  unstable: true,
  inGracePeriod: false,
  isDetecting: false,
  hasCamera: false,
};

export function useLipRoundnessDetection(enabled: boolean): LipRoundnessResult & {
  device: unknown;
  frameProcessor: unknown;
} {
  if (Platform.OS === 'web') {
    if (!useLipRoundnessDetectionWebHook) {
      try {
        useLipRoundnessDetectionWebHook = require('./useLipRoundnessDetectionWeb').useLipRoundnessDetectionWeb;
      } catch (e) {
        console.error('[lip roundness] web hook load failed', e);
        return {
          ...IDLE,
          error: 'Lip roundness camera unavailable on web.',
          device: null,
          frameProcessor: null,
        };
      }
    }
    const web = useLipRoundnessDetectionWebHook!(enabled);
    return { ...web, device: null, frameProcessor: null };
  }

  return useLipRoundnessDetectionNative(enabled);
}

function useLipRoundnessDetectionNative(enabled: boolean) {
  const jaw = useJawDetection(enabled);
  const engineRef = useRef(new LipRoundnessEngine());
  const [snap, setSnap] = useState<LipRoundSnapshot>({
    roundedLips: false,
    confirmedRounded: false,
    roundnessScore: 0,
    smoothedRatio: 0,
    holdDuration: 0,
    confidence: 0,
    unstable: true,
    inGracePeriod: false,
  });

  useEffect(() => {
    if (!enabled) engineRef.current.reset();
  }, [enabled]);

  const ratioRef = useRef(jaw.ratio);
  ratioRef.current = jaw.ratio;

  useNativeLipPoll(enabled, jaw.isDetecting, () => {
    setSnap(engineRef.current.processRatio(ratioRef.current));
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

export type { LipRoundnessResult };

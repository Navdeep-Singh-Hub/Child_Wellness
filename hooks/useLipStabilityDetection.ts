import { LipStabilityEngine } from '@/components/game/speech/lip-closure/modules/LipStabilityEngine';
import type { LipStabilitySnapshot } from '@/components/game/speech/lip-closure/modules/lipHoldTypes';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useNativeLipPoll } from '@/hooks/useNativeLipPoll';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { LipStabilityResult } from './useLipStabilityDetectionWeb';

let useLipStabilityDetectionWebHook: ((enabled: boolean) => LipStabilityResult) | null = null;

const IDLE: LipStabilityResult = {
  stableHold: true,
  stabilityScore: 0,
  holdDuration: 0,
  confidence: 0,
  smoothedMovement: 99,
  unstable: true,
  inGracePeriod: false,
  isDetecting: false,
  hasCamera: false,
};

export function useLipStabilityDetection(enabled: boolean): LipStabilityResult & {
  device: unknown;
  frameProcessor: unknown;
} {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    if (!useLipStabilityDetectionWebHook) {
      try {
        useLipStabilityDetectionWebHook = require('./useLipStabilityDetectionWeb').useLipStabilityDetectionWeb;
      } catch (e) {
        console.error('[lip stability] web hook load failed', e);
        return {
          ...IDLE,
          error: 'Lip stability camera unavailable on web.',
          device: null,
          frameProcessor: null,
          hasCamera: false,
        };
      }
    }
    const web = useLipStabilityDetectionWebHook!(enabled);
    return { ...web, device: null, frameProcessor: null };
  }

  return useLipStabilityDetectionNative(enabled);
}

function useLipStabilityDetectionNative(enabled: boolean) {
  const jaw = useJawDetection(enabled);
  const engineRef = useRef(new LipStabilityEngine());
  const prevRatioRef = useRef<number | null>(null);
  const [snap, setSnap] = useState<LipStabilitySnapshot>({
    stableHold: true,
    stabilityScore: 0,
    holdDuration: 0,
    confidence: 0,
    smoothedMovement: 99,
    unstable: true,
    inGracePeriod: false,
  });

  useEffect(() => {
    if (!enabled) {
      engineRef.current.reset();
      prevRatioRef.current = null;
    }
  }, [enabled]);

  const jawRef = useRef(jaw);
  jawRef.current = jaw;

  useNativeLipPoll(enabled, jaw.isDetecting, () => {
    const j = jawRef.current;
    const prev = prevRatioRef.current;
    const delta = prev != null ? Math.abs(j.ratio - prev) * 1000 : 0;
    prevRatioRef.current = j.ratio;
    setSnap(engineRef.current.processMovementDelta(delta));
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

export type { LipStabilityResult };

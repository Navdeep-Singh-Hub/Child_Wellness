import { LipSpreadEngine } from '@/components/game/speech/lip-closure/modules/LipSpreadEngine';
import type { LipSpreadSnapshot } from '@/components/game/speech/lip-closure/modules/lipSpreadTypes';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useNativeLipPoll } from '@/hooks/useNativeLipPoll';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { LipSpreadResult } from './useLipSpreadDetectionWeb';

let useLipSpreadDetectionWebHook: ((enabled: boolean) => LipSpreadResult) | null = null;

const IDLE: LipSpreadResult = {
  lipsSpread: false,
  confirmedSpread: false,
  spreadScore: 0,
  smoothedSpread: 0,
  holdDuration: 0,
  confidence: 0,
  unstable: true,
  inGracePeriod: false,
  isDetecting: false,
  hasCamera: false,
};

export function useLipSpreadDetection(enabled: boolean): LipSpreadResult & {
  device: unknown;
  frameProcessor: unknown;
} {
  if (Platform.OS === 'web') {
    if (!useLipSpreadDetectionWebHook) {
      try {
        useLipSpreadDetectionWebHook = require('./useLipSpreadDetectionWeb').useLipSpreadDetectionWeb;
      } catch (e) {
        console.error('[lip spread] web hook load failed', e);
        return {
          ...IDLE,
          error: 'Lip spread camera unavailable on web.',
          device: null,
          frameProcessor: null,
        };
      }
    }
    const web = useLipSpreadDetectionWebHook!(enabled);
    return { ...web, device: null, frameProcessor: null };
  }

  return useLipSpreadDetectionNative(enabled);
}

function useLipSpreadDetectionNative(enabled: boolean) {
  const jaw = useJawDetection(enabled);
  const engineRef = useRef(new LipSpreadEngine());
  const [snap, setSnap] = useState<LipSpreadSnapshot>({
    lipsSpread: false,
    confirmedSpread: false,
    spreadScore: 0,
    smoothedSpread: 0,
    holdDuration: 0,
    confidence: 0,
    unstable: true,
    inGracePeriod: false,
  });

  useEffect(() => {
    if (!enabled) engineRef.current.reset();
  }, [enabled]);

  const jawRef = useRef(jaw);
  jawRef.current = jaw;

  useNativeLipPoll(enabled, jaw.isDetecting, () => {
    const j = jawRef.current;
    const mar = Math.max(0.08, j.ratio);
    setSnap(engineRef.current.processSpread(1 / mar + (j.smileAmount ?? 0) * 1.5));
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

export type { LipSpreadResult };

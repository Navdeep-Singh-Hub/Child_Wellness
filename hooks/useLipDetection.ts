import { LipDetectionEngine } from '@/components/game/speech/lip-closure/modules/LipDetectionEngine';
import type { LipDetectionSnapshot } from '@/components/game/speech/lip-closure/modules/types';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useNativeLipPoll } from '@/hooks/useNativeLipPoll';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { LipDetectionResult } from './useLipDetectionWeb';

let useLipDetectionWebHook: ((enabled: boolean) => LipDetectionResult) | null = null;

const IDLE: LipDetectionResult = {
  lipsClosed: false,
  holdDuration: 0,
  confidence: 0,
  smoothedGap: 99,
  unstable: true,
  isDetecting: false,
  hasCamera: false,
};

export function useLipDetection(enabled: boolean): LipDetectionResult & {
  device: unknown;
  frameProcessor: unknown;
} {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    if (!useLipDetectionWebHook) {
      try {
        useLipDetectionWebHook = require('./useLipDetectionWeb').useLipDetectionWeb;
      } catch (e) {
        console.error('[lip] web hook load failed', e);
        return { ...IDLE, error: 'Lip camera unavailable on web.', device: null, frameProcessor: null };
      }
    }
    const web = useLipDetectionWebHook!(enabled);
    return { ...web, device: null, frameProcessor: null };
  }

  return useLipDetectionNative(enabled);
}

function useLipDetectionNative(enabled: boolean) {
  const jaw = useJawDetection(enabled);
  const engineRef = useRef(new LipDetectionEngine());
  const [snap, setSnap] = useState<LipDetectionSnapshot>({
    lipsClosed: false,
    holdDuration: 0,
    confidence: 0,
    smoothedGap: 99,
    unstable: true,
  });

  useEffect(() => {
    if (!enabled) engineRef.current.reset();
  }, [enabled]);

  const ratioRef = useRef(jaw.ratio);
  ratioRef.current = jaw.ratio;

  useNativeLipPoll(enabled, jaw.isDetecting, () => {
    setSnap(engineRef.current.processGap(ratioRef.current * 1000));
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

export type { LipDetectionResult };

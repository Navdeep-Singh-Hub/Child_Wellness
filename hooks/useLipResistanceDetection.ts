import { LipResistanceEngine } from '@/components/game/speech/lip-closure/modules/LipResistanceEngine';
import type { LipResistanceSnapshot } from '@/components/game/speech/lip-closure/modules/lipResistanceTypes';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useNativeLipPoll } from '@/hooks/useNativeLipPoll';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { LipResistanceResult } from './useLipResistanceDetectionWeb';

let useLipResistanceDetectionWebHook: ((enabled: boolean) => LipResistanceResult) | null = null;

const IDLE: LipResistanceResult = {
  lipPose: 'NEUTRAL',
  stableHold: false,
  stabilityScore: 0,
  holdDuration: 0,
  resistanceScore: 0,
  confidence: 0,
  unstable: true,
  inGracePeriod: false,
  microBreaks: 0,
  isDetecting: false,
  hasCamera: false,
};

export function useLipResistanceDetection(enabled: boolean): LipResistanceResult & {
  device: unknown;
  frameProcessor: unknown;
} {
  if (Platform.OS === 'web') {
    if (!useLipResistanceDetectionWebHook) {
      try {
        useLipResistanceDetectionWebHook = require('./useLipResistanceDetectionWeb').useLipResistanceDetectionWeb;
      } catch (e) {
        console.error('[lip resistance] web hook load failed', e);
        return {
          ...IDLE,
          error: 'Lip resistance camera unavailable on web.',
          device: null,
          frameProcessor: null,
        };
      }
    }
    const web = useLipResistanceDetectionWebHook!(enabled);
    return { ...web, device: null, frameProcessor: null };
  }

  return useLipResistanceDetectionNative(enabled);
}

function useLipResistanceDetectionNative(enabled: boolean) {
  const jaw = useJawDetection(enabled);
  const engineRef = useRef(new LipResistanceEngine());
  const [snap, setSnap] = useState<LipResistanceSnapshot>({
    lipPose: 'NEUTRAL',
    stableHold: false,
    stabilityScore: 0,
    holdDuration: 0,
    resistanceScore: 0,
    confidence: 0,
    unstable: true,
    inGracePeriod: false,
    microBreaks: 0,
  });

  useEffect(() => {
    if (!enabled) engineRef.current.reset();
  }, [enabled]);

  const jawRef = useRef(jaw);
  jawRef.current = jaw;

  useNativeLipPoll(enabled, jaw.isDetecting, () => {
    const j = jawRef.current;
    const mar = Math.max(0.08, j.ratio);
    const lipGap = mar * 1000;
    const roundness = mar;
    const spread = 1 / mar + (j.smileAmount ?? 0) * 1.2;
    setSnap(
      engineRef.current.processMetrics(lipGap, roundness, spread, 100, lipGap / 10),
    );
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

export type { LipResistanceResult };

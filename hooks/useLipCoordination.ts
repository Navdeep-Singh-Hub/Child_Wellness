import { LipCoordinationEngine } from '@/components/game/speech/lip-closure/modules/LipCoordinationEngine';
import type { LipCoordinationSnapshot } from '@/components/game/speech/lip-closure/modules/lipCoordinationTypes';
import type { ResistancePose } from '@/components/game/speech/lip-closure/modules/ResistancePoseSystem';
import { useLipResistanceDetection } from '@/hooks/useLipResistanceDetection';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export interface LipCoordinationSense extends LipCoordinationSnapshot {
  isDetecting: boolean;
  hasCamera: boolean;
  error?: string;
  device: unknown;
  frameProcessor: unknown;
  faceTrackingAvailable: boolean;
  useCamera: boolean;
  glowColor: string;
  effectivePose: ResistancePose;
  tapClosed: () => void;
  tapRounded: () => void;
  tapSpread: () => void;
  tapNeutral: () => void;
}

export function useLipCoordination(
  enabled: boolean,
  engine?: LipCoordinationEngine,
): LipCoordinationSense {
  const engineRef = useRef(engine ?? new LipCoordinationEngine());
  if (engine && engineRef.current !== engine) {
    engineRef.current = engine;
  }

  const lip = useLipResistanceDetection(enabled);
  const [manualPose, setManualPose] = useState<ResistancePose>('NEUTRAL');
  const [snap, setSnap] = useState<LipCoordinationSnapshot>({
    lipPose: 'NEUTRAL',
    poseHoldMs: 0,
    poseConfirmed: false,
    coordinationScore: 0,
    sequenceProgress: 0,
    state: 'IDLE',
    confidence: 0,
    unstable: true,
    inGracePeriod: false,
    helpfulHint: 'Move lips with the beat',
    beatPulse: false,
    beatActive: false,
    pulsePhase: 0,
  });

  const faceTrackingAvailable = lip.hasCamera;
  const useCamera =
    enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const effectivePose = useCamera ? lip.lipPose : manualPose;

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      const poseOverride = useCamera ? lip.lipPose : manualPose;
      const lipGap = useCamera ? 12 : manualPose === 'CLOSED' ? 5 : manualPose === 'ROUNDED' ? 14 : 18;
      const roundness = manualPose === 'ROUNDED' ? 0.62 : manualPose === 'SPREAD' ? 0.35 : 0.45;
      const spread = manualPose === 'SPREAD' ? 3.8 : manualPose === 'ROUNDED' ? 2.2 : 2.5;

      setSnap(
        engineRef.current.process(lipGap, roundness, spread, 100, lipGap / 10, poseOverride),
      );
    }, 50);

    return () => clearInterval(id);
  }, [enabled, useCamera, manualPose, lip.lipPose]);

  let glowColor = '#E2E8F0';
  if (effectivePose === 'ROUNDED') glowColor = '#93C5FD';
  if (effectivePose === 'SPREAD') glowColor = '#FDE047';
  if (effectivePose === 'CLOSED') glowColor = '#CBD5E1';
  if (snap.poseConfirmed) glowColor = effectivePose === 'SPREAD' ? '#FBBF24' : '#60A5FA';
  if (snap.state === 'SUCCESS') glowColor = '#86EFAC';
  if (snap.beatPulse) glowColor = '#C4B5FD';

  return {
    ...snap,
    lipPose: effectivePose,
    isDetecting: lip.isDetecting,
    hasCamera: lip.hasCamera,
    error: lip.error,
    device: lip.device,
    frameProcessor: lip.frameProcessor,
    faceTrackingAvailable,
    useCamera,
    glowColor,
    effectivePose,
    tapClosed: () => setManualPose('CLOSED'),
    tapRounded: () => setManualPose('ROUNDED'),
    tapSpread: () => setManualPose('SPREAD'),
    tapNeutral: () => setManualPose('NEUTRAL'),
  };
}

export { LipCoordinationEngine };

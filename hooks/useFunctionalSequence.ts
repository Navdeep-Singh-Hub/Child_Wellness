import { FunctionalSequenceEngine } from '@/components/game/speech/lip-closure/modules/FunctionalSequenceEngine';
import type { FunctionalSequenceSnapshot } from '@/components/game/speech/lip-closure/modules/functionalSequenceTypes';
import type { ResistancePose } from '@/components/game/speech/lip-closure/modules/ResistancePoseSystem';
import { useLipResistanceDetection } from '@/hooks/useLipResistanceDetection';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export interface FunctionalSequenceSense extends FunctionalSequenceSnapshot {
  isDetecting: boolean;
  hasCamera: boolean;
  hasMic: boolean;
  micStatus: string;
  error?: string;
  device: unknown;
  frameProcessor: unknown;
  faceTrackingAvailable: boolean;
  useCamera: boolean;
  useMic: boolean;
  glowColor: string;
  effectivePose: ResistancePose;
  tapClosed: () => void;
  tapRounded: () => void;
  tapSpread: () => void;
  tapNeutral: () => void;
  tapBurst: () => void;
  tapBlow: () => void;
  tapStopBlow: () => void;
  manualBlowing: boolean;
}

export function useFunctionalSequence(
  enabled: boolean,
  engine?: FunctionalSequenceEngine,
): FunctionalSequenceSense {
  const engineRef = useRef(engine ?? new FunctionalSequenceEngine());
  if (engine && engineRef.current !== engine) {
    engineRef.current = engine;
  }

  const lip = useLipResistanceDetection(enabled);
  const voice = useVoiceLevel({ enabled, sensitivity: 1.2 });
  const [manualPose, setManualPose] = useState<ResistancePose>('NEUTRAL');
  const [manualBurst, setManualBurst] = useState(false);
  const [manualBlowing, setManualBlowing] = useState(false);
  const burstRef = useRef(0);
  const blowRef = useRef(0);

  const [snap, setSnap] = useState<FunctionalSequenceSnapshot>({
    lipPose: 'NEUTRAL',
    poseHoldMs: 0,
    poseConfirmed: false,
    lipsClosed: false,
    audioLevel: 0,
    audioSpike: false,
    airflowActive: false,
    airflowStrength: 0,
    sequenceProgress: 0,
    currentStep: null,
    state: 'IDLE',
    confidence: 0,
    unstable: true,
    inGracePeriod: false,
    helpfulHint: 'Follow the mouth path',
    transitionSmoothness: 0.5,
  });

  const faceTrackingAvailable = lip.hasCamera;
  const useCamera =
    enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const useMic = enabled && voice.status === 'active';
  const effectivePose = useCamera ? lip.lipPose : manualPose;

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      const poseOverride = useCamera ? lip.lipPose : manualPose;
      const lipGap = useCamera ? 12 : manualPose === 'CLOSED' ? 5 : manualPose === 'ROUNDED' ? 14 : 18;
      const roundness = manualPose === 'ROUNDED' ? 0.62 : manualPose === 'SPREAD' ? 0.35 : 0.45;
      const spread = manualPose === 'SPREAD' ? 3.8 : manualPose === 'ROUNDED' ? 2.2 : 2.5;

      let audioLevel = useMic ? voice.level : 0.04;
      if (!useMic && manualBurst && Date.now() - burstRef.current < 450) {
        audioLevel = 0.55;
      }
      if (!useMic && manualBlowing) {
        audioLevel = Math.min(0.38, 0.14 + (Date.now() - blowRef.current) / 3500);
      }

      setSnap(
        engineRef.current.process(
          lipGap,
          roundness,
          spread,
          100,
          lipGap / 10,
          audioLevel,
          poseOverride,
        ),
      );
      setManualBurst(false);
    }, 50);

    return () => clearInterval(id);
  }, [enabled, useCamera, useMic, manualPose, manualBurst, manualBlowing, lip.lipPose, voice.level]);

  let glowColor = '#E2E8F0';
  if (effectivePose === 'ROUNDED') glowColor = '#93C5FD';
  if (effectivePose === 'SPREAD') glowColor = '#FDE047';
  if (effectivePose === 'CLOSED') glowColor = '#CBD5E1';
  if (snap.poseConfirmed) glowColor = '#86EFAC';
  if (snap.state === 'SUCCESS') glowColor = '#4ADE80';
  if (snap.airflowActive) glowColor = '#BAE6FD';
  if (snap.audioSpike) glowColor = '#FDE047';

  return {
    ...snap,
    lipPose: effectivePose,
    isDetecting: lip.isDetecting || voice.status === 'active',
    hasCamera: lip.hasCamera,
    hasMic: voice.status === 'active' || voice.status === 'requesting',
    micStatus: voice.status,
    error: lip.error ?? voice.error ?? undefined,
    device: lip.device,
    frameProcessor: lip.frameProcessor,
    faceTrackingAvailable,
    useCamera,
    useMic,
    glowColor,
    effectivePose,
    tapClosed: () => setManualPose('CLOSED'),
    tapRounded: () => setManualPose('ROUNDED'),
    tapSpread: () => setManualPose('SPREAD'),
    tapNeutral: () => setManualPose('NEUTRAL'),
    tapBurst: () => {
      burstRef.current = Date.now();
      setManualBurst(true);
    },
    tapBlow: () => {
      blowRef.current = Date.now();
      setManualBlowing(true);
    },
    tapStopBlow: () => setManualBlowing(false),
    manualBlowing,
  };
}

export { FunctionalSequenceEngine };

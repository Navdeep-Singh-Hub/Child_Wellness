import { LipAirflowCoordinator } from '@/components/game/speech/lip-closure/modules/LipAirflowCoordinator';
import type { LipAirflowSnapshot } from '@/components/game/speech/lip-closure/modules/lipAirflowTypes';
import type { ResistancePose } from '@/components/game/speech/lip-closure/modules/ResistancePoseSystem';
import { useLipResistanceDetection } from '@/hooks/useLipResistanceDetection';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export interface LipAirflowSense extends LipAirflowSnapshot {
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
  particles: boolean;
  tapRounded: () => void;
  tapSpread: () => void;
  tapNeutral: () => void;
  tapBlow: () => void;
  tapStopBlow: () => void;
  manualBlowing: boolean;
}

export function useLipAirflow(enabled: boolean, coordinator?: LipAirflowCoordinator): LipAirflowSense {
  const coordRef = useRef(coordinator ?? new LipAirflowCoordinator());
  if (coordinator && coordRef.current !== coordinator) {
    coordRef.current = coordinator;
  }

  const lip = useLipResistanceDetection(enabled);
  const voice = useVoiceLevel({ enabled, sensitivity: 1.1 });
  const [snap, setSnap] = useState<LipAirflowSnapshot>({
    lipPose: 'NEUTRAL',
    mouthWidth: 0,
    mouthHeight: 0,
    airflowStrength: 0,
    airflowStability: 0,
    airflowDuration: 0,
    airflowActive: false,
    isShout: false,
    coordinationScore: 0,
    accumulatedMs: 0,
    state: 'IDLE',
    confidence: 0,
    unstable: true,
    helpfulHint: 'Blow gently',
  });
  const [manualPose, setManualPose] = useState<ResistancePose>('ROUNDED');
  const [manualBlowing, setManualBlowing] = useState(false);
  const [particles, setParticles] = useState(false);
  const blowStartRef = useRef(0);

  const faceTrackingAvailable = lip.hasCamera;
  const useCamera =
    enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const useMic = enabled && voice.status === 'active';

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      const poseOverride = useCamera ? lip.lipPose : manualPose;
      const lipGap = useCamera ? 12 : manualPose === 'CLOSED' ? 5 : manualPose === 'ROUNDED' ? 14 : 18;
      const roundness = manualPose === 'ROUNDED' ? 0.62 : manualPose === 'SPREAD' ? 0.35 : 0.45;
      const spread = manualPose === 'SPREAD' ? 3.8 : manualPose === 'ROUNDED' ? 2.2 : 2.5;

      let audioLevel = useMic ? voice.level : 0.04;
      if (!useMic && manualBlowing) {
        const elapsed = Date.now() - blowStartRef.current;
        audioLevel = Math.min(0.38, 0.12 + elapsed / 4000);
      }

      const next = coordRef.current.process(
        lipGap,
        roundness,
        spread,
        100,
        lipGap / 10,
        audioLevel,
        poseOverride,
      );
      setSnap(next);

      if (next.airflowActive && next.coordinationScore > 0.15) {
        setParticles(true);
      } else if (!next.airflowActive) {
        setParticles(false);
      }
    }, 50);

    return () => clearInterval(id);
  }, [enabled, useCamera, useMic, manualPose, manualBlowing, lip.lipPose, voice.level]);

  let glowColor = '#E2E8F0';
  if (snap.lipPose === 'ROUNDED') glowColor = '#93C5FD';
  else if (snap.lipPose === 'SPREAD') glowColor = '#FDE68A';
  if (snap.airflowActive && !snap.isShout) glowColor = '#86EFAC';
  if (particles) glowColor = '#BAE6FD';
  if (snap.state === 'SUCCESS' || snap.state === 'REWARDING') glowColor = '#4ADE80';

  return {
    ...snap,
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
    particles,
    tapRounded: () => setManualPose('ROUNDED'),
    tapSpread: () => setManualPose('SPREAD'),
    tapNeutral: () => setManualPose('NEUTRAL'),
    tapBlow: () => {
      blowStartRef.current = Date.now();
      setManualBlowing(true);
    },
    tapStopBlow: () => setManualBlowing(false),
    manualBlowing,
  };
}

export { LipAirflowCoordinator };

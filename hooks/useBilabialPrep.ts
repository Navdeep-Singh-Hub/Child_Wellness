import { BilabialEngine } from '@/components/game/speech/lip-closure/modules/BilabialEngine';
import type { BilabialPrepSnapshot } from '@/components/game/speech/lip-closure/modules/lipBilabialTypes';
import { useLipDetection } from '@/hooks/useLipDetection';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export interface BilabialPrepSense extends BilabialPrepSnapshot {
  isDetecting: boolean;
  hasCamera: boolean;
  hasMic: boolean;
  micStatus: string;
  error?: string;
  device: unknown;
  frameProcessor: unknown;
  tapClose: () => void;
  tapOpen: () => void;
  tapBurst: () => void;
  faceTrackingAvailable: boolean;
  manualClosed: boolean;
  manualBurst: boolean;
  useCamera: boolean;
  useMic: boolean;
  glowColor: string;
  spark: boolean;
}

export function useBilabialPrep(enabled: boolean, engine?: BilabialEngine): BilabialPrepSense {
  const engineRef = useRef(engine ?? new BilabialEngine());
  if (engine && engineRef.current !== engine) {
    engineRef.current = engine;
  }
  const lip = useLipDetection(enabled);
  const voice = useVoiceLevel({ enabled, sensitivity: 1.3 });
  const [snap, setSnap] = useState<BilabialPrepSnapshot>({
    lipsClosed: false,
    audioLevel: 0,
    audioSpike: false,
    state: 'IDLE',
    lastEvent: null,
    confidence: 0,
    unstable: true,
  });
  const [manualClosed, setManualClosed] = useState(false);
  const [manualBurst, setManualBurst] = useState(false);
  const [spark, setSpark] = useState(false);
  const burstTapRef = useRef(0);

  const faceTrackingAvailable = lip.hasCamera;
  const useCamera =
    enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const useMic = enabled && voice.status === 'active';

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      const lipsOverride = useCamera ? null : manualClosed;
      const gap = useCamera ? lip.smoothedGap : manualClosed ? 4 : 18;
      let audioLevel = useMic ? voice.level : manualBurst ? 0.5 : 0.05;

      if (!useMic && manualBurst && Date.now() - burstTapRef.current < 450) {
        audioLevel = 0.55;
      }

      const next = engineRef.current.process(gap, audioLevel, lipsOverride);
      setSnap(next);

      if (next.audioSpike) {
        setSpark(true);
        setTimeout(() => setSpark(false), 350);
      }
      setManualBurst(false);
    }, 50);

    return () => clearInterval(id);
  }, [
    enabled,
    useCamera,
    useMic,
    manualClosed,
    manualBurst,
    lip.smoothedGap,
    lip.lipsClosed,
    voice.level,
  ]);

  let glowColor = '#E2E8F0';
  if (snap.lipsClosed) glowColor = '#93C5FD';
  if (spark || snap.audioSpike) glowColor = '#FDE047';
  if (snap.state === 'SUCCESS' || snap.state === 'REWARDING') glowColor = '#86EFAC';

  return {
    ...snap,
    isDetecting: lip.isDetecting || voice.status === 'active',
    hasCamera: lip.hasCamera,
    hasMic: voice.status === 'active' || voice.status === 'requesting',
    micStatus: voice.status,
    error: lip.error ?? voice.error ?? undefined,
    device: lip.device,
    frameProcessor: lip.frameProcessor,
    tapClose: () => setManualClosed(true),
    tapOpen: () => setManualClosed(false),
    tapBurst: () => {
      burstTapRef.current = Date.now();
      setManualBurst(true);
    },
    faceTrackingAvailable,
    manualClosed,
    manualBurst,
    useCamera,
    useMic,
    glowColor,
    spark,
  };
}

export { BilabialEngine };

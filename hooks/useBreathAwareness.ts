import { BreathAwarenessEngine } from '@/components/game/speech/breath-awareness/modules/BreathAwarenessEngine';
import type { BreathDifficulty, BreathSnapshot } from '@/components/game/speech/breath-awareness/modules/breathAwarenessTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface BreathAwarenessSense extends BreathSnapshot {
  micStatus: VoiceLevelStatus;
  micError: string | null;
  /** Raw mic level 0–1 (for meter UI) */
  micLevel: number;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  tapBreath: () => void;
  consumePulse: () => boolean;
  engine: BreathAwarenessEngine;
}

export function useBreathAwareness(
  enabled: boolean,
  difficulty: BreathDifficulty = 'easy',
): BreathAwarenessSense {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'breath',
    sensitivity: 2.2,
    autoStart: false,
  });
  const engineRef = useRef(new BreathAwarenessEngine());
  const [snap, setSnap] = useState<BreathSnapshot>({
    breathDetected: false,
    breathPulse: false,
    intensity: 0,
    duration: 0,
    confidence: 0,
    state: 'IDLE',
    smoothedLevel: 0,
    calibrated: false,
  });

  useEffect(() => {
    engineRef.current.configure(difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.reset();
      setSnap({
        breathDetected: false,
        breathPulse: false,
        intensity: 0,
        duration: 0,
        confidence: 0,
        state: 'IDLE',
        smoothedLevel: 0,
        calibrated: false,
      });
      return;
    }
    const id = setInterval(() => {
      const level = voice.status === 'active' ? voice.level : 0;
      setSnap(engineRef.current.process(level));
    }, 50);
    return () => clearInterval(id);
  }, [enabled, voice.level, voice.status]);

  useEffect(() => () => voice.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const tapBreath = useCallback(() => {
    engineRef.current.simulateBreath(0.4);
    setSnap(engineRef.current.process(0.4));
  }, []);

  const consumePulse = useCallback(() => engineRef.current.consumeBreathPulse(), []);

  return {
    ...snap,
    micStatus: voice.status,
    micError: voice.error,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startMic: voice.start,
    stopMic: voice.stop,
    tapBreath,
    consumePulse,
    engine: engineRef.current,
  };
}

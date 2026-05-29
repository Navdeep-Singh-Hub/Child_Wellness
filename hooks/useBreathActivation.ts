import { BreathActivationEngine } from '@/components/game/speech/breath-activation/modules/BreathActivationEngine';
import type {
  BreathActivationDifficulty,
  BreathActivationSnapshot,
} from '@/components/game/speech/breath-activation/modules/breathActivationTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface BreathActivationSense extends BreathActivationSnapshot {
  micStatus: VoiceLevelStatus;
  micError: string | null;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  tapStartStop: () => void;
  consumeCycle: () => boolean;
  engine: BreathActivationEngine;
}

export function useBreathActivation(
  enabled: boolean,
  difficulty: BreathActivationDifficulty = 'easy',
): BreathActivationSense {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'breath',
    sensitivity: 2.0,
    autoStart: false,
  });
  const engineRef = useRef(new BreathActivationEngine());
  const [snap, setSnap] = useState<BreathActivationSnapshot>(() =>
    engineRef.current.process(0),
  );

  useEffect(() => {
    engineRef.current.configure(difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.reset();
      setSnap(engineRef.current.process(0));
      return;
    }
    const id = setInterval(() => {
      const level = voice.status === 'active' ? voice.level : 0;
      setSnap(engineRef.current.process(level));
    }, 50);
    return () => clearInterval(id);
  }, [enabled, voice.level, voice.status]);

  const tapStartStop = useCallback(() => {
    engineRef.current.simulateStartStop(0.45);
    setSnap(engineRef.current.process(0.45));
  }, []);

  const consumeCycle = useCallback(() => engineRef.current.consumeCyclePulse(), []);

  useEffect(() => () => voice.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...snap,
    micStatus: voice.status,
    micError: voice.error,
    startMic: voice.start,
    stopMic: voice.stop,
    tapStartStop,
    consumeCycle,
    engine: engineRef.current,
  };
}

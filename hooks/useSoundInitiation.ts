import { SoundInitiationEngine } from '@/components/game/speech/sound-initiation/modules/SoundInitiationEngine';
import type {
  SoundInitiationDifficulty,
  SoundInitiationSnapshot,
} from '@/components/game/speech/sound-initiation/modules/soundInitiationTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SoundInitiationSense extends SoundInitiationSnapshot {
  micStatus: VoiceLevelStatus;
  micError: string | null;
  micLevel: number;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  tapSound: () => void;
  consumePulse: () => boolean;
  engine: SoundInitiationEngine;
}

export function useSoundInitiation(
  enabled: boolean,
  difficulty: SoundInitiationDifficulty = 'easy',
): SoundInitiationSense {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'default',
    sensitivity: 1.95,
    autoStart: false,
  });
  const engineRef = useRef(new SoundInitiationEngine());
  const [snap, setSnap] = useState<SoundInitiationSnapshot>({
    state: 'IDLE',
    soundDetected: false,
    soundPulse: false,
    intensity: 0,
    duration: 0,
    confidence: 0,
    vocalAttempt: 0,
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
        state: 'IDLE',
        soundDetected: false,
        soundPulse: false,
        intensity: 0,
        duration: 0,
        confidence: 0,
        vocalAttempt: 0,
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

  const tapSound = useCallback(() => {
    engineRef.current.simulateSound(0.48);
    setSnap(engineRef.current.process(0.48));
  }, []);

  const consumePulse = useCallback(() => engineRef.current.consumeSoundPulse(), []);

  return {
    ...snap,
    micStatus: voice.status,
    micError: voice.error,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startMic: voice.start,
    stopMic: voice.stop,
    tapSound,
    consumePulse,
    engine: engineRef.current,
  };
}

import { SoundStabilityEngine } from '@/components/game/speech/sound-stability/modules/SoundStabilityEngine';
import type {
  SoundStabilityDifficulty,
  SoundStabilitySnapshot,
} from '@/components/game/speech/sound-stability/modules/soundStabilityTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SoundStabilitySense extends SoundStabilitySnapshot {
  micStatus: VoiceLevelStatus;
  micError: string | null;
  micLevel: number;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  tapGoodTry: () => void;
  consumeStabilityPulse: () => boolean;
  engine: SoundStabilityEngine;
}

export function useSoundStability(
  enabled: boolean,
  difficulty: SoundStabilityDifficulty = 'easy',
) {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'default',
    sensitivity: 1.88,
    autoStart: false,
  });
  const engineRef = useRef(new SoundStabilityEngine());
  const [snap, setSnap] = useState<SoundStabilitySnapshot>({
    state: 'IDLE',
    soundActive: false,
    stabilityPulse: false,
    intensity: 0,
    sustainedDuration: 0,
    vocalAttempt: 0,
    stabilityAttempt: 0,
    engagementLevel: 0.2,
    rewardState: 'NONE',
    sustainGlow: 0,
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
        soundActive: false,
        stabilityPulse: false,
        intensity: 0,
        sustainedDuration: 0,
        vocalAttempt: 0,
        stabilityAttempt: 0,
        engagementLevel: 0.2,
        rewardState: 'NONE',
        sustainGlow: 0,
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

  const tapGoodTry = useCallback(() => {
    engineRef.current.simulateSustain();
    setSnap(engineRef.current.process(0.45));
  }, []);

  const consumeStabilityPulse = useCallback(() => engineRef.current.consumeStabilityPulse(), []);

  return {
    ...snap,
    micStatus: voice.status,
    micError: voice.error,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startMic: voice.start,
    stopMic: voice.stop,
    tapGoodTry,
    consumeStabilityPulse,
    engine: engineRef.current,
  };
}

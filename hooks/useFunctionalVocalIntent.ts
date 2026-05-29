import { FunctionalVocalIntentEngine } from '@/components/game/speech/functional-vocal-intent/modules/FunctionalVocalIntentEngine';
import type {
  FunctionalVocalIntentDifficulty,
  FunctionalVocalIntentSnapshot,
} from '@/components/game/speech/functional-vocal-intent/modules/functionalVocalIntentTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface FunctionalVocalIntentSense extends FunctionalVocalIntentSnapshot {
  micStatus: VoiceLevelStatus;
  micError: string | null;
  micLevel: number;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  tapResponse: () => void;
  consumePulse: () => boolean;
  engine: FunctionalVocalIntentEngine;
}

export function useFunctionalVocalIntent(
  enabled: boolean,
  difficulty: FunctionalVocalIntentDifficulty = 'easy',
) {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'default',
    sensitivity: 1.9,
    autoStart: false,
  });
  const engineRef = useRef(new FunctionalVocalIntentEngine());
  const [snap, setSnap] = useState<FunctionalVocalIntentSnapshot>({
    state: 'IDLE',
    responseDetected: false,
    responsePulse: false,
    intensity: 0,
    duration: 0,
    vocalAttempt: 0,
    interactionAttempt: 0,
    communicationIntent: 0.3,
    engagementLevel: 0.2,
    rewardState: 'NONE',
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
        responseDetected: false,
        responsePulse: false,
        intensity: 0,
        duration: 0,
        vocalAttempt: 0,
        interactionAttempt: 0,
        communicationIntent: 0.3,
        engagementLevel: 0.2,
        rewardState: 'NONE',
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

  const tapResponse = useCallback(() => {
    engineRef.current.simulateResponse(0.48);
    setSnap(engineRef.current.process(0.48));
  }, []);

  const consumePulse = useCallback(() => engineRef.current.consumeResponsePulse(), []);

  return {
    ...snap,
    micStatus: voice.status,
    micError: voice.error,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startMic: voice.start,
    stopMic: voice.stop,
    tapResponse,
    consumePulse,
    engine: engineRef.current,
  };
}

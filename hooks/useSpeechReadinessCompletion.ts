import { SpeechReadinessCompletionEngine } from '@/components/game/speech/speech-readiness-completion/modules/SpeechReadinessCompletionEngine';
import type {
  SpeechReadinessCompletionDifficulty,
  SpeechReadinessCompletionSnapshot,
} from '@/components/game/speech/speech-readiness-completion/modules/speechReadinessCompletionTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechReadinessCompletionSense extends SpeechReadinessCompletionSnapshot {
  micStatus: VoiceLevelStatus;
  micError: string | null;
  micLevel: number;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  tapResponse: () => void;
  tapImitation: () => void;
  showPrompt: (durationMs?: number) => void;
  consumeParticipationPulse: () => boolean;
  engine: SpeechReadinessCompletionEngine;
}

export function useSpeechReadinessCompletion(
  enabled: boolean,
  difficulty: SpeechReadinessCompletionDifficulty = 'easy',
) {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'default',
    sensitivity: 1.85,
    autoStart: false,
  });
  const engineRef = useRef(new SpeechReadinessCompletionEngine());
  const [snap, setSnap] = useState<SpeechReadinessCompletionSnapshot>({
    state: 'IDLE',
    responseDetected: false,
    participationPulse: false,
    participationType: null,
    intensity: 0,
    duration: 0,
    vocalAttempt: 0,
    imitationAttempt: 0,
    participationLevel: 0.3,
    sequenceProgress: 0,
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
        participationPulse: false,
        participationType: null,
        intensity: 0,
        duration: 0,
        vocalAttempt: 0,
        imitationAttempt: 0,
        participationLevel: 0.3,
        sequenceProgress: 0,
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

  const tapImitation = useCallback(() => {
    engineRef.current.simulateImitation(0.42);
    setSnap(engineRef.current.process(0.42));
  }, []);

  const showPrompt = useCallback((durationMs?: number) => {
    engineRef.current.showPrompt(durationMs);
    setSnap((s) => ({ ...s, state: 'SHOWING_PROMPT' }));
  }, []);

  const consumeParticipationPulse = useCallback(
    () => engineRef.current.consumeParticipationPulse(),
    [],
  );

  return {
    ...snap,
    micStatus: voice.status,
    micError: voice.error,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startMic: voice.start,
    stopMic: voice.stop,
    tapResponse,
    tapImitation,
    showPrompt,
    consumeParticipationPulse,
    engine: engineRef.current,
  };
}

import { MultiStepCoordinationEngine } from '@/components/game/speech/multi-step-coordination/modules/MultiStepCoordinationEngine';
import { multiStepRoundDifficulty } from '@/components/game/speech/multi-step-coordination/modules/MultiStepCoordinationSessionManager';
import type {
  MultiStepCoordinationDifficulty,
  MultiStepCoordinationGameId,
  MultiStepCoordinationSnapshot,
} from '@/components/game/speech/multi-step-coordination/modules/multiStepCoordinationTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type MultiStepCoordinationSense = MultiStepCoordinationSnapshot & {
  engine: MultiStepCoordinationEngine;
  difficulty: MultiStepCoordinationDifficulty;
  micStatus: VoiceLevelStatus;
  micError: string | null;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  coordinate: () => void;
  goodTry: () => void;
  consumeCoordinationPulse: () => boolean;
};

export function useMultiStepCoordination(
  enabled: boolean,
  gameId: MultiStepCoordinationGameId,
  round: number,
) {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'breath',
    sensitivity: 2.0,
    autoStart: false,
  });

  const difficulty = multiStepRoundDifficulty(round);
  const engineRef = useRef(new MultiStepCoordinationEngine(gameId));
  const [snap, setSnap] = useState<MultiStepCoordinationSnapshot>(() => engineRef.current.process(0));

  useEffect(() => {
    engineRef.current.configure(difficulty);
    engineRef.current.showPrompt();
  }, [difficulty, gameId]);

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

  const coordinate = useCallback(() => {
    engineRef.current.coordinate();
    setSnap(engineRef.current.process(0.25));
  }, []);

  const goodTry = useCallback(() => {
    engineRef.current.goodTry();
    setSnap(engineRef.current.process(0.2));
  }, []);

  const consumeCoordinationPulse = useCallback(
    () => engineRef.current.consumeCoordinationPulse(),
    [],
  );

  useEffect(() => () => voice.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...snap,
    engine: engineRef.current,
    difficulty,
    micStatus: voice.status,
    micError: voice.error,
    startMic: voice.start,
    stopMic: voice.stop,
    coordinate,
    goodTry,
    consumeCoordinationPulse,
  } satisfies MultiStepCoordinationSense;
}

import { BreathJawCoordinationEngine } from '@/components/game/speech/breath-jaw-coordination/modules/BreathJawCoordinationEngine';
import { breathJawRoundDifficulty } from '@/components/game/speech/breath-jaw-coordination/modules/BreathJawCoordinationSessionManager';
import type {
  BreathJawCoordinationDifficulty,
  BreathJawCoordinationGameId,
  BreathJawCoordinationSnapshot,
} from '@/components/game/speech/breath-jaw-coordination/modules/breathJawCoordinationTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type BreathJawCoordinationSense = BreathJawCoordinationSnapshot & {
  engine: BreathJawCoordinationEngine;
  difficulty: BreathJawCoordinationDifficulty;
  micStatus: VoiceLevelStatus;
  micError: string | null;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  coordinate: () => void;
  goodTry: () => void;
  consumeCoordinationPulse: () => boolean;
};

export function useBreathJawCoordination(
  enabled: boolean,
  gameId: BreathJawCoordinationGameId,
  round: number,
) {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'breath',
    sensitivity: 2.0,
    autoStart: false,
  });

  const difficulty = breathJawRoundDifficulty(round);
  const engineRef = useRef(new BreathJawCoordinationEngine(gameId));
  const [snap, setSnap] = useState<BreathJawCoordinationSnapshot>(() => engineRef.current.process(0));

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
  } satisfies BreathJawCoordinationSense;
}

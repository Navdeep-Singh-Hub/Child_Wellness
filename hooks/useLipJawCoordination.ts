import { LipJawCoordinationEngine } from '@/components/game/speech/lip-jaw-coordination/modules/LipJawCoordinationEngine';
import { lipJawRoundDifficulty } from '@/components/game/speech/lip-jaw-coordination/modules/LipJawCoordinationSessionManager';
import type {
  LipJawCoordinationDifficulty,
  LipJawCoordinationGameId,
  LipJawCoordinationSnapshot,
} from '@/components/game/speech/lip-jaw-coordination/modules/lipJawCoordinationTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export type LipJawCoordinationSense = LipJawCoordinationSnapshot & {
  engine: LipJawCoordinationEngine;
  difficulty: LipJawCoordinationDifficulty;
  coordinate: () => void;
  goodTry: () => void;
  consumeCoordinationPulse: () => boolean;
};

export function useLipJawCoordination(
  enabled: boolean,
  gameId: LipJawCoordinationGameId,
  round: number,
) {
  const difficulty = lipJawRoundDifficulty(round);
  const engineRef = useRef(new LipJawCoordinationEngine(gameId));
  const [snap, setSnap] = useState<LipJawCoordinationSnapshot>(() => engineRef.current.tick());

  useEffect(() => {
    engineRef.current.configure(difficulty);
    engineRef.current.showPrompt();
  }, [difficulty, gameId]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.reset();
      setSnap(engineRef.current.tick());
      return;
    }
    const id = setInterval(() => {
      setSnap(engineRef.current.tick());
    }, 50);
    return () => clearInterval(id);
  }, [enabled]);

  const coordinate = useCallback(() => {
    engineRef.current.coordinate();
    setSnap(engineRef.current.tick());
  }, []);

  const goodTry = useCallback(() => {
    engineRef.current.coordinate();
    engineRef.current.triggerReward('SPARKLE');
    setSnap(engineRef.current.tick());
  }, []);

  const consumeCoordinationPulse = useCallback(
    () => engineRef.current.consumeCoordinationPulse(),
    [],
  );

  return {
    ...snap,
    engine: engineRef.current,
    difficulty,
    coordinate,
    goodTry,
    consumeCoordinationPulse,
  } satisfies LipJawCoordinationSense;
}

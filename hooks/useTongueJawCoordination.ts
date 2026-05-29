import { TongueJawCoordinationEngine } from '@/components/game/speech/tongue-jaw-coordination/modules/TongueJawCoordinationEngine';
import { tongueJawRoundDifficulty } from '@/components/game/speech/tongue-jaw-coordination/modules/TongueJawCoordinationSessionManager';
import type {
  TongueJawCoordinationDifficulty,
  TongueJawCoordinationGameId,
  TongueJawCoordinationSnapshot,
} from '@/components/game/speech/tongue-jaw-coordination/modules/tongueJawCoordinationTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TongueJawCoordinationSense = TongueJawCoordinationSnapshot & {
  engine: TongueJawCoordinationEngine;
  difficulty: TongueJawCoordinationDifficulty;
  coordinate: () => void;
  goodTry: () => void;
  consumeCoordinationPulse: () => boolean;
};

export function useTongueJawCoordination(
  enabled: boolean,
  gameId: TongueJawCoordinationGameId,
  round: number,
) {
  const difficulty = tongueJawRoundDifficulty(round);
  const engineRef = useRef(new TongueJawCoordinationEngine(gameId));
  const [snap, setSnap] = useState<TongueJawCoordinationSnapshot>(() => engineRef.current.tick());

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
  } satisfies TongueJawCoordinationSense;
}


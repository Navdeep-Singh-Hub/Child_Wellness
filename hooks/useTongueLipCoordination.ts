import { TongueLipCoordinationEngine } from '@/components/game/speech/tongue-lip-coordination/modules/TongueLipCoordinationEngine';
import { tongueLipRoundDifficulty } from '@/components/game/speech/tongue-lip-coordination/modules/TongueLipCoordinationSessionManager';
import type {
  TongueLipCoordinationDifficulty,
  TongueLipCoordinationGameId,
  TongueLipCoordinationSnapshot,
} from '@/components/game/speech/tongue-lip-coordination/modules/tongueLipCoordinationTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TongueLipCoordinationSense = TongueLipCoordinationSnapshot & {
  engine: TongueLipCoordinationEngine;
  difficulty: TongueLipCoordinationDifficulty;
  coordinate: () => void;
  goodTry: () => void;
  consumeCoordinationPulse: () => boolean;
};

export function useTongueLipCoordination(
  enabled: boolean,
  gameId: TongueLipCoordinationGameId,
  round: number,
) {
  const difficulty = tongueLipRoundDifficulty(round);
  const engineRef = useRef(new TongueLipCoordinationEngine(gameId));
  const [snap, setSnap] = useState<TongueLipCoordinationSnapshot>(() => engineRef.current.tick());

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
  } satisfies TongueLipCoordinationSense;
}

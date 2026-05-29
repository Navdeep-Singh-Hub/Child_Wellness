import { TongueAwarenessEngine } from '@/components/game/speech/tongue-awareness/modules/TongueAwarenessEngine';
import { tongueAwarenessRoundDifficulty } from '@/components/game/speech/tongue-awareness/modules/TongueAwarenessSessionManager';
import type {
  TongueAwarenessDifficulty,
  TongueAwarenessGameId,
  TongueAwarenessSnapshot,
} from '@/components/game/speech/tongue-awareness/modules/tongueAwarenessTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TongueAwarenessSense = TongueAwarenessSnapshot & {
  engine: TongueAwarenessEngine;
  difficulty: TongueAwarenessDifficulty;
  interact: () => void;
  goodTry: () => void;
  consumeReward: () => boolean;
};

export function useTongueAwareness(enabled: boolean, gameId: TongueAwarenessGameId, round: number) {
  const difficulty = tongueAwarenessRoundDifficulty(round);
  const engineRef = useRef(new TongueAwarenessEngine(gameId));
  const [snap, setSnap] = useState<TongueAwarenessSnapshot>(() => engineRef.current.tick());

  useEffect(() => {
    engineRef.current.configure(difficulty);
    engineRef.current.showPrompt();
  }, [difficulty]);

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

  const interact = useCallback(() => {
    engineRef.current.interact();
    setSnap(engineRef.current.tick());
  }, []);

  const goodTry = useCallback(() => {
    engineRef.current.interact();
    engineRef.current.triggerReward('SPARKLE');
    setSnap(engineRef.current.tick());
  }, []);

  const consumeReward = useCallback(() => engineRef.current.consumeRewardPulse(), []);

  return {
    ...snap,
    engine: engineRef.current,
    difficulty,
    interact,
    goodTry,
    consumeReward,
  } satisfies TongueAwarenessSense;
}

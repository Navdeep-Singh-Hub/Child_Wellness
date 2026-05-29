import { MouthAttentionEngine } from '@/components/game/speech/mouth-attention/modules/MouthAttentionEngine';
import { mouthAttentionRoundDifficulty } from '@/components/game/speech/mouth-attention/modules/MouthAttentionSessionManager';
import type {
  MouthAttentionDifficulty,
  MouthAttentionGameId,
  MouthAttentionSnapshot,
} from '@/components/game/speech/mouth-attention/modules/mouthAttentionTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export type MouthAttentionSense = MouthAttentionSnapshot & {
  engine: MouthAttentionEngine;
  difficulty: MouthAttentionDifficulty;
  interact: () => void;
  goodTry: () => void;
  consumeReward: () => boolean;
};

export function useMouthAttention(enabled: boolean, gameId: MouthAttentionGameId, round: number) {
  const difficulty = mouthAttentionRoundDifficulty(round);
  const engineRef = useRef(new MouthAttentionEngine(gameId));
  const [snap, setSnap] = useState<MouthAttentionSnapshot>(() => engineRef.current.tick());

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
  } satisfies MouthAttentionSense;
}


import { SpeechOralImitationEngine } from '@/components/game/speech/speech-oral-imitation/modules/SpeechOralImitationEngine';
import { speechOralImitationRoundDifficulty } from '@/components/game/speech/speech-oral-imitation/modules/SpeechOralImitationSessionManager';
import type {
  SpeechOralImitationDifficulty,
  SpeechOralImitationGameId,
  SpeechOralImitationSnapshot,
} from '@/components/game/speech/speech-oral-imitation/modules/speechOralImitationTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechOralImitationSense = SpeechOralImitationSnapshot & {
  engine: SpeechOralImitationEngine;
  difficulty: SpeechOralImitationDifficulty;
  imitate: () => void;
  goodTry: () => void;
  consumeReward: () => boolean;
};

export function useSpeechOralImitation(
  enabled: boolean,
  gameId: SpeechOralImitationGameId,
  round: number,
) {
  const difficulty = speechOralImitationRoundDifficulty(round);
  const engineRef = useRef(new SpeechOralImitationEngine(gameId));
  const [snap, setSnap] = useState<SpeechOralImitationSnapshot>(() => engineRef.current.tick());

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

  const imitate = useCallback(() => {
    engineRef.current.imitate();
    setSnap(engineRef.current.tick());
  }, []);

  const goodTry = useCallback(() => {
    engineRef.current.imitate();
    engineRef.current.triggerReward('SPARKLE');
    setSnap(engineRef.current.tick());
  }, []);

  const consumeReward = useCallback(() => engineRef.current.consumeRewardPulse(), []);

  return {
    ...snap,
    engine: engineRef.current,
    difficulty,
    imitate,
    goodTry,
    consumeReward,
  } satisfies SpeechOralImitationSense;
}

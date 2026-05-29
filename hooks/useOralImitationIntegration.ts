import { OralImitationIntegrationEngine } from '@/components/game/speech/oral-imitation-integration/modules/OralImitationIntegrationEngine';
import { oralImitationRoundDifficulty } from '@/components/game/speech/oral-imitation-integration/modules/OralImitationSessionManager';
import type {
  OralImitationDifficulty,
  OralImitationGameId,
  OralImitationSnapshot,
} from '@/components/game/speech/oral-imitation-integration/modules/oralImitationTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export type OralImitationSense = OralImitationSnapshot & {
  engine: OralImitationIntegrationEngine;
  difficulty: OralImitationDifficulty;
  interact: () => void;
  goodTry: () => void;
  consumeReward: () => boolean;
};

export function useOralImitationIntegration(
  enabled: boolean,
  gameId: OralImitationGameId,
  round: number,
) {
  const difficulty = oralImitationRoundDifficulty(round);
  const engineRef = useRef(new OralImitationIntegrationEngine(gameId));
  const [snap, setSnap] = useState<OralImitationSnapshot>(() => engineRef.current.tick());

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
  } satisfies OralImitationSense;
}

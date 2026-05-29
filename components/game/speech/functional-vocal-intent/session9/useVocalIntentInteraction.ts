import {
  VOCAL_INTENT_INTERACTIONS_PER_ROUND,
  hapticVocalIntentSuccess,
  useVocalIntentPulseCounter,
} from '@/components/game/speech/functional-vocal-intent/shared/functionalVocalIntentShared';
import type { FunctionalVocalIntentSessionManager } from '@/components/game/speech/functional-vocal-intent/modules/FunctionalVocalIntentSessionManager';
import type { FunctionalVocalIntentSense } from '@/hooks/useFunctionalVocalIntent';
import { useCallback, type Dispatch, type SetStateAction } from 'react';

export function useVocalIntentInteraction(
  sense: FunctionalVocalIntentSense,
  active: boolean,
  childTurn: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: FunctionalVocalIntentSessionManager,
  onRoundComplete: () => void,
) {
  const onResponse = useCallback(
    (intensity: number, duration: number) => {
      manager.recordInteraction(intensity, duration);
      setHits((h) => {
        const next = h + 1;
        if (next >= VOCAL_INTENT_INTERACTIONS_PER_ROUND) {
          setTimeout(() => onRoundComplete(), 800);
        }
        return next;
      });
    },
    [manager, onRoundComplete, setHits],
  );

  useVocalIntentPulseCounter(active && childTurn, sense, onResponse);

  return { onResponse };
}

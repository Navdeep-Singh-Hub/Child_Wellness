import {
  STABILITY_INTERACTIONS_PER_ROUND,
  useStabilityPulseCounter,
} from '@/components/game/speech/sound-stability/shared/soundStabilityShared';
import type { SoundStabilitySessionManager } from '@/components/game/speech/sound-stability/modules/SoundStabilitySessionManager';
import type { SoundStabilitySense } from '@/hooks/useSoundStability';
import { useCallback, type Dispatch, type SetStateAction } from 'react';

export function useStabilityInteraction(
  sense: SoundStabilitySense,
  active: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: SoundStabilitySessionManager,
  onRoundComplete: () => void,
) {
  const onStability = useCallback(
    (sustainMs: number, intensity: number) => {
      manager.recordStability(sustainMs, intensity);
      setHits((h) => {
        const next = h + 1;
        if (next >= STABILITY_INTERACTIONS_PER_ROUND) {
          setTimeout(() => onRoundComplete(), 800);
        }
        return next;
      });
    },
    [manager, onRoundComplete, setHits],
  );

  useStabilityPulseCounter(active, sense, onStability);

  return { onStability };
}

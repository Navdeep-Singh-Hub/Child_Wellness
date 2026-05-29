import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useLevel6MatchOnce,
  useLevel6MouthTarget,
  type Level6MouthSense,
  type Level6Target,
} from '@/components/game/speech/level6/shared/Level6MouthShell';
import type { VowelShape } from '@/components/game/speech/vowel-shaping/modules/vowelShapingTypes';
import {
  VOWEL_SHAPING_INTERACTIONS_PER_ROUND,
  useVowelRewardCounter,
} from '@/components/game/speech/vowel-shaping/shared/vowelShapingShared';
import type { VowelShapingSessionManager } from '@/components/game/speech/vowel-shaping/modules/VowelShapingSessionManager';
import type { VowelShapingSense } from '@/hooks/useVowelShaping';
import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

export function vowelShapeToTarget(shape: VowelShape): Level6Target {
  switch (shape) {
    case 'aaa':
      return 'aaa';
    case 'ooo':
      return 'ooo';
    case 'eee':
      return 'eee';
    default:
      return 'face_present';
  }
}

export function useVowelShapeAttempt(
  sense: VowelShapingSense,
  active: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: VowelShapingSessionManager,
  onRoundComplete: () => void,
  targetShape: VowelShape = 'watch',
) {
  const target = vowelShapeToTarget(targetShape);
  const mouth = useLevel6MouthTarget(active, target);

  const onReward = useCallback(() => {
    const vocal = sense.optionalMicOn && sense.micLevel > 0.1;
    manager.recordImitation(sense.vowelExposure, vocal);
    setHits((h) => {
      const next = h + 1;
      if (next >= VOWEL_SHAPING_INTERACTIONS_PER_ROUND) {
        setTimeout(() => onRoundComplete(), 800);
      }
      return next;
    });
  }, [manager, onRoundComplete, sense.micLevel, sense.optionalMicOn, sense.vowelExposure, setHits]);

  useVowelRewardCounter(sense, active, onReward);

  const lastFiredHitsRef = useRef(-1);
  const triggerImitate = useCallback(
    (vocalHint?: boolean) => {
      const vocal = vocalHint ?? (sense.optionalMicOn && sense.micLevel > 0.1);
      sense.imitate(vocal);
    },
    [sense],
  );

  useLevel6MatchOnce(mouth, active && target !== 'face_present', hits, () => {
    if (lastFiredHitsRef.current === hits) return;
    lastFiredHitsRef.current = hits;
    triggerImitate(true);
  });

  const tryShape = useCallback(() => {
    lastFiredHitsRef.current = hits;
    triggerImitate();
  }, [hits, triggerImitate]);

  return { tryShape, hits, mouth, target } as {
    tryShape: () => void;
    hits: number;
    mouth: Level6MouthSense;
    target: Level6Target;
  };
}

export { Level6CameraLayer, Level6MirrorPreview, Level6StatusPill };

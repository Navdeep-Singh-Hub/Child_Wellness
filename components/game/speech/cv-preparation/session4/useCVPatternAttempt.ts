import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useLevel6MatchOnce,
  useLevel6MouthTarget,
  type Level6MouthSense,
  type Level6Target,
} from '@/components/game/speech/level6/shared/Level6MouthShell';
import {
  CV_PREPARATION_INTERACTIONS_PER_ROUND,
  useCVRewardCounter,
} from '@/components/game/speech/cv-preparation/shared/cvPreparationShared';
import type { CVPreparationSessionManager } from '@/components/game/speech/cv-preparation/modules/CVPreparationSessionManager';
import type { CVPattern } from '@/components/game/speech/cv-preparation/modules/cvPreparationTypes';
import type { CVPreparationSense } from '@/hooks/useCVPreparation';
import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

/** Maps a CV pattern to its dominant mouth target. ma/pa/ba use a single
 *  close→open pulse; moo/bee use the corresponding vowel mouth shape. */
export function cvPatternToTarget(pattern: CVPattern | undefined): Level6Target {
  switch (pattern) {
    case 'ma':
      return 'ma';
    case 'pa':
      return 'pa';
    case 'ba':
      return 'ba';
    case 'moo':
      return 'ooo';
    case 'bee':
      return 'eee';
    default:
      return 'face_present';
  }
}

export function useCVPatternAttempt(
  sense: CVPreparationSense,
  active: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: CVPreparationSessionManager,
  onRoundComplete: () => void,
  pattern?: CVPattern,
) {
  const target = cvPatternToTarget(pattern);
  const mouth = useLevel6MouthTarget(active, target);

  const onReward = useCallback(() => {
    const vocal = sense.optionalMicOn && sense.micLevel > 0.1;
    manager.recordAttempt(sense.patternExposure, vocal, sense.sequenceProgress);
    setHits((h) => {
      const next = h + 1;
      if (next >= CV_PREPARATION_INTERACTIONS_PER_ROUND) {
        setTimeout(() => onRoundComplete(), 800);
      }
      return next;
    });
  }, [
    manager,
    onRoundComplete,
    sense.micLevel,
    sense.optionalMicOn,
    sense.patternExposure,
    sense.sequenceProgress,
    setHits,
  ]);

  useCVRewardCounter(sense, active, onReward);

  const lastFiredRef = useRef(-1);

  const triggerAttempt = useCallback(
    (vocalHint?: boolean) => {
      const vocal = vocalHint ?? (sense.optionalMicOn && sense.micLevel > 0.1);
      sense.tryPattern({ withVocal: vocal, pattern });
    },
    [pattern, sense],
  );

  useLevel6MatchOnce(mouth, active && target !== 'face_present', hits, () => {
    if (lastFiredRef.current === hits) return;
    lastFiredRef.current = hits;
    triggerAttempt(true);
    mouth.resetTarget();
  });

  const tryPattern = useCallback(() => {
    lastFiredRef.current = hits;
    triggerAttempt();
  }, [hits, triggerAttempt]);

  return { tryPattern, hits, mouth, target } as {
    tryPattern: () => void;
    hits: number;
    mouth: Level6MouthSense;
    target: Level6Target;
  };
}

export { Level6CameraLayer, Level6MirrorPreview, Level6StatusPill };

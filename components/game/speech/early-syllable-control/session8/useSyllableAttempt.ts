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
  EARLY_SYLLABLE_INTERACTIONS_PER_ROUND,
  useEarlySyllableRewardCounter,
} from '@/components/game/speech/early-syllable-control/shared/earlySyllableControlShared';
import type { EarlySyllableControlSessionManager } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlSessionManager';
import type { EarlySyllable } from '@/components/game/speech/early-syllable-control/modules/earlySyllableControlTypes';
import type { EarlySyllableControlSense } from '@/hooks/useEarlySyllableControl';
import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

/** Map an early syllable to a Level 6 close→open / vowel target. */
export function syllableToTarget(syllable: EarlySyllable | undefined): Level6Target {
  switch (syllable) {
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
    case 'aaa':
      return 'aaa';
    default:
      return 'face_present';
  }
}

export function useSyllableAttempt(
  sense: EarlySyllableControlSense,
  active: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: EarlySyllableControlSessionManager,
  onRoundComplete: () => void,
  syllable?: EarlySyllable,
) {
  const target = syllableToTarget(syllable);
  const mouth = useLevel6MouthTarget(active, target);

  const onReward = useCallback(() => {
    const vocal = sense.optionalMicOn && sense.micLevel > 0.1;
    manager.recordSyllableAttempt(sense.syllableExposure, vocal, sense.sequenceProgress);
    setHits((h) => {
      const next = h + 1;
      if (next >= EARLY_SYLLABLE_INTERACTIONS_PER_ROUND) {
        setTimeout(() => onRoundComplete(), 800);
      }
      return next;
    });
  }, [
    manager,
    onRoundComplete,
    sense.micLevel,
    sense.optionalMicOn,
    sense.sequenceProgress,
    sense.syllableExposure,
    setHits,
  ]);

  useEarlySyllableRewardCounter(sense, active, onReward);

  const lastFiredRef = useRef(-1);

  const triggerAttempt = useCallback(
    (vocalHint?: boolean) => {
      const vocal = vocalHint ?? (sense.optionalMicOn && sense.micLevel > 0.1);
      sense.trySyllable({ withVocal: vocal, syllable });
    },
    [sense, syllable],
  );

  useLevel6MatchOnce(mouth, active && target !== 'face_present', hits, () => {
    if (lastFiredRef.current === hits) return;
    lastFiredRef.current = hits;
    triggerAttempt(true);
    mouth.resetTarget();
  });

  const trySyllable = useCallback(() => {
    lastFiredRef.current = hits;
    triggerAttempt();
  }, [hits, triggerAttempt]);

  return { trySyllable, hits, mouth, target } as {
    trySyllable: () => void;
    hits: number;
    mouth: Level6MouthSense;
    target: Level6Target;
  };
}

export { Level6CameraLayer, Level6MirrorPreview, Level6StatusPill };

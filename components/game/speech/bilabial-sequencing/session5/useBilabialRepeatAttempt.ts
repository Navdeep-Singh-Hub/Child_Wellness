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
  BILABIAL_SEQUENCING_INTERACTIONS_PER_ROUND,
  useBilabialRewardCounter,
} from '@/components/game/speech/bilabial-sequencing/shared/bilabialSequencingShared';
import type { BilabialSequencingSessionManager } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingSessionManager';
import type { BilabialRepeat } from '@/components/game/speech/bilabial-sequencing/modules/bilabialSequencingTypes';
import type { BilabialSequencingSense } from '@/hooks/useBilabialSequencing';
import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

export function bilabialRepeatToTarget(repeat: BilabialRepeat | undefined): Level6Target {
  switch (repeat) {
    case 'ma_ma':
      return 'mama';
    case 'pa_pa':
      return 'papa';
    case 'ba_ba':
      return 'baba';
    case 'mmm':
      return 'mm';
    default:
      return 'face_present';
  }
}

export function useBilabialRepeatAttempt(
  sense: BilabialSequencingSense,
  active: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: BilabialSequencingSessionManager,
  onRoundComplete: () => void,
  repeat?: BilabialRepeat,
) {
  const target = bilabialRepeatToTarget(repeat);
  const mouth = useLevel6MouthTarget(active, target);

  const onReward = useCallback(() => {
    const vocal = sense.optionalMicOn && sense.micLevel > 0.1;
    manager.recordRepetition(sense.repeatExposure, vocal, sense.sequenceProgress);
    setHits((h) => {
      const next = h + 1;
      if (next >= BILABIAL_SEQUENCING_INTERACTIONS_PER_ROUND) {
        setTimeout(() => onRoundComplete(), 800);
      }
      return next;
    });
  }, [
    manager,
    onRoundComplete,
    sense.micLevel,
    sense.optionalMicOn,
    sense.repeatExposure,
    sense.sequenceProgress,
    setHits,
  ]);

  useBilabialRewardCounter(sense, active, onReward);

  const lastFiredRef = useRef(-1);

  const triggerAttempt = useCallback(
    (vocalHint?: boolean) => {
      const vocal = vocalHint ?? (sense.optionalMicOn && sense.micLevel > 0.1);
      sense.tryRepeat({ withVocal: vocal, repeat });
    },
    [repeat, sense],
  );

  useLevel6MatchOnce(mouth, active && target !== 'face_present', hits, () => {
    if (lastFiredRef.current === hits) return;
    lastFiredRef.current = hits;
    triggerAttempt(true);
    mouth.resetTarget();
  });

  const tryRepeat = useCallback(() => {
    lastFiredRef.current = hits;
    triggerAttempt();
  }, [hits, triggerAttempt]);

  return { tryRepeat, hits, mouth, target } as {
    tryRepeat: () => void;
    hits: number;
    mouth: Level6MouthSense;
    target: Level6Target;
  };
}

export { Level6CameraLayer, Level6MirrorPreview, Level6StatusPill };

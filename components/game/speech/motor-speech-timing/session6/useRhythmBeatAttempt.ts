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
  MOTOR_SPEECH_TIMING_INTERACTIONS_PER_ROUND,
  useMotorSpeechRewardCounter,
} from '@/components/game/speech/motor-speech-timing/shared/motorSpeechTimingShared';
import type { MotorSpeechTimingSessionManager } from '@/components/game/speech/motor-speech-timing/modules/MotorSpeechTimingSessionManager';
import type { RhythmBeat } from '@/components/game/speech/motor-speech-timing/modules/motorSpeechTimingTypes';
import type { MotorSpeechTimingSense } from '@/hooks/useMotorSpeechTiming';
import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

/** Map a rhythm beat (e.g. MA … MA) to the unified Level 6 target. The
 *  multi-pulse / vowel targets accept matches within a ~2.5s window which is
 *  the natural slow-speech rhythm for this session. */
export function rhythmToTarget(rhythm: RhythmBeat | undefined): Level6Target {
  switch (rhythm) {
    case 'ma_pause_ma':
      return 'mama';
    case 'pa_pause_pa':
      return 'papa';
    case 'aaa_pause_aaa':
      return 'aaa';
    case 'oo_pause_oo':
      return 'ooo';
    default:
      return 'face_present';
  }
}

export function useRhythmBeatAttempt(
  sense: MotorSpeechTimingSense,
  active: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: MotorSpeechTimingSessionManager,
  onRoundComplete: () => void,
  rhythm?: RhythmBeat,
) {
  const target = rhythmToTarget(rhythm);
  const mouth = useLevel6MouthTarget(active, target);

  const onReward = useCallback(() => {
    const vocal = sense.optionalMicOn && sense.micLevel > 0.1;
    manager.recordRhythmAttempt(sense.rhythmExposure, vocal, sense.sequenceProgress);
    setHits((h) => {
      const next = h + 1;
      if (next >= MOTOR_SPEECH_TIMING_INTERACTIONS_PER_ROUND) {
        setTimeout(() => onRoundComplete(), 800);
      }
      return next;
    });
  }, [
    manager,
    onRoundComplete,
    sense.micLevel,
    sense.optionalMicOn,
    sense.rhythmExposure,
    sense.sequenceProgress,
    setHits,
  ]);

  useMotorSpeechRewardCounter(sense, active, onReward);

  const lastFiredRef = useRef(-1);

  const triggerAttempt = useCallback(
    (vocalHint?: boolean) => {
      const vocal = vocalHint ?? (sense.optionalMicOn && sense.micLevel > 0.1);
      sense.tryRhythm({ withVocal: vocal, rhythm });
    },
    [rhythm, sense],
  );

  useLevel6MatchOnce(mouth, active && target !== 'face_present', hits, () => {
    if (lastFiredRef.current === hits) return;
    lastFiredRef.current = hits;
    triggerAttempt(true);
    mouth.resetTarget();
  });

  const tryRhythm = useCallback(() => {
    lastFiredRef.current = hits;
    triggerAttempt();
  }, [hits, triggerAttempt]);

  return { tryRhythm, hits, mouth, target } as {
    tryRhythm: () => void;
    hits: number;
    mouth: Level6MouthSense;
    target: Level6Target;
  };
}

export { Level6CameraLayer, Level6MirrorPreview, Level6StatusPill };

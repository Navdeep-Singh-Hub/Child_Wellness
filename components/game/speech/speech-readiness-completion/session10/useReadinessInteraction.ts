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
  READINESS_INTERACTIONS_PER_ROUND,
  useReadinessParticipationPulse,
} from '@/components/game/speech/speech-readiness-completion/shared/speechReadinessCompletionShared';
import type { SpeechReadinessCompletionSessionManager } from '@/components/game/speech/speech-readiness-completion/modules/SpeechReadinessCompletionSessionManager';
import type { ParticipationType } from '@/components/game/speech/speech-readiness-completion/modules/speechReadinessCompletionTypes';
import type { SpeechReadinessCompletionSense } from '@/hooks/useSpeechReadinessCompletion';
import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

export function useReadinessInteraction(
  sense: SpeechReadinessCompletionSense,
  active: boolean,
  hits: number,
  setHits: Dispatch<SetStateAction<number>>,
  manager: SpeechReadinessCompletionSessionManager,
  onRoundComplete: () => void,
  target: Level6Target = 'face_present',
): { mouth: Level6MouthSense; target: Level6Target } {
  const mouth = useLevel6MouthTarget(active, target);
  const lastFiredRef = useRef(-1);

  const onParticipation = useCallback(
    (type: ParticipationType, intensity: number, duration: number) => {
      manager.recordParticipation(type, intensity, duration);
      setHits((h) => {
        const next = h + 1;
        if (next >= READINESS_INTERACTIONS_PER_ROUND) {
          setTimeout(() => onRoundComplete(), 800);
        }
        return next;
      });
    },
    [manager, onRoundComplete, setHits],
  );

  useReadinessParticipationPulse(active, sense, onParticipation);

  useLevel6MatchOnce(mouth, active && target !== 'face_present', hits, () => {
    if (lastFiredRef.current === hits) return;
    lastFiredRef.current = hits;
    sense.tapImitation();
    mouth.resetTarget();
  });

  return { mouth, target };
}

export { Level6CameraLayer, Level6MirrorPreview, Level6StatusPill };

/**
 * Level 6 Session 1 helper — maps SpeechMouthShape to a Level6Target and
 * auto-fires sense.imitate() on a confirmed camera match exactly once per
 * `hits` value. Each game still owns its hits / round state.
 */

import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useLevel6MatchOnce,
  useLevel6MouthTarget,
  type Level6MouthSense,
  type Level6Target,
} from '@/components/game/speech/level6/shared/Level6MouthShell';
import type { SpeechMouthShape } from '@/components/game/speech/speech-oral-imitation/modules/speechOralImitationTypes';
import type { SpeechOralImitationSense } from '@/hooks/useSpeechOralImitation';
import { useCallback, useRef } from 'react';

export function speechShapeToTarget(shape: SpeechMouthShape): Level6Target {
  switch (shape) {
    case 'open':
      return 'open';
    case 'closed':
      return 'closed';
    case 'round':
    case 'ooo':
      return 'ooo';
    case 'smile':
      return 'smile';
    case 'eee':
    case 'spread':
      return 'eee';
    default:
      return 'face_present';
  }
}

export function useSpeechShapeCameraMatch(
  sense: SpeechOralImitationSense,
  active: boolean,
  hits: number,
  shape: SpeechMouthShape | undefined,
): { mouth: Level6MouthSense; target: Level6Target } {
  const target = speechShapeToTarget(shape ?? 'watch');
  const mouth = useLevel6MouthTarget(active, target);
  const lastFiredRef = useRef(-1);

  const onMatch = useCallback(() => {
    if (lastFiredRef.current === hits) return;
    lastFiredRef.current = hits;
    sense.imitate();
  }, [hits, sense]);

  useLevel6MatchOnce(mouth, active && target !== 'face_present', hits, onMatch);

  return { mouth, target };
}

export { Level6CameraLayer, Level6MirrorPreview, Level6StatusPill };

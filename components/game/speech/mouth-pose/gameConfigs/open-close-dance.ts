import type { MouthPoseTarget } from '@/components/game/speech/mouth-pose/modules/mouthPoseTypes';

/** Pilot thresholds — tune on APK tablet with real child. */
export const openCloseDanceConfig = {
  gameId: 'open-close-dance' as const,
  poses: ['open', 'close', 'open'] as MouthPoseTarget[],
  detectWindowMs: 12000,
  holdMs: 400,
};

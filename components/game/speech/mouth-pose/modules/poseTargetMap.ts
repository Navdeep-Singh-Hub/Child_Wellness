import type { OralImitationPrompt } from '@/components/game/speech/oral-imitation-integration/modules/oralImitationTypes';
import type { FacePose } from '@/components/game/speech/facial-imitation/modules/facialImitationTypes';
import type { JawPose } from '@/components/game/speech/jaw-awareness/modules/jawAwarenessTypes';
import type { LipPose } from '@/components/game/speech/lip-awareness/modules/lipAwarenessTypes';
import type { MouthPose } from '@/components/game/speech/mouth-imitation/modules/imitationTypes';
import type { MouthPoseTarget } from './mouthPoseTypes';

export function mouthPoseToTarget(pose: MouthPose): MouthPoseTarget {
  switch (pose) {
    case 'open':
    case 'wide':
      return 'open';
    case 'close':
    case 'small':
      return 'closed';
    case 'round':
      return 'round';
    case 'smile':
    case 'funny':
      return 'smile';
    default:
      return 'neutral';
  }
}

export function lipPoseToTarget(pose: LipPose): MouthPoseTarget {
  switch (pose) {
    case 'closed':
      return 'closed';
    case 'round':
    case 'kiss':
      return 'round';
    case 'smile-big':
    case 'smile-small':
    case 'funny':
      return 'smile';
    default:
      return 'spread';
  }
}

export function jawPoseToTarget(pose: JawPose): MouthPoseTarget {
  switch (pose) {
    case 'open':
    case 'yawn':
      return 'open';
    case 'close':
    case 'sleepy':
      return 'closed';
    default:
      return 'neutral';
  }
}

export function oralPromptToTarget(prompt: OralImitationPrompt): MouthPoseTarget {
  switch (prompt) {
    case 'open':
    case 'blow':
      return 'open';
    case 'close':
      return 'closed';
    case 'smile':
      return 'smile';
    case 'funny-lips':
      return 'round';
    case 'tongue-out':
      return 'tongue_hint';
    case 'watch':
    case 'tap':
      return 'face_present';
    default:
      return 'neutral';
  }
}

export function facePoseToTarget(pose: FacePose): MouthPoseTarget {
  switch (pose) {
    case 'open':
    case 'surprised':
      return 'open';
    case 'small':
    case 'sleepy':
      return 'closed';
    case 'smile-big':
    case 'happy':
    case 'funny':
    case 'silly':
      return 'smile';
    default:
      return 'neutral';
  }
}

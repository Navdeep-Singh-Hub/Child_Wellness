import type { OralImitationPrompt } from '@/components/game/speech/oral-imitation-integration/modules/oralImitationTypes';

export const POSE_EMOJI: Record<OralImitationPrompt, string> = {
  open: '😮',
  close: '😌',
  smile: '😊',
  'funny-lips': '😗',
  'tongue-out': '😛',
  blow: '🌬️',
  watch: '👀',
  tap: '✨',
};

export const FRIEND_POSES: { prompt: OralImitationPrompt; label: string }[] = [
  { prompt: 'open', label: 'Open mouth' },
  { prompt: 'close', label: 'Close mouth' },
  { prompt: 'funny-lips', label: 'Funny lips' },
  { prompt: 'smile', label: 'Smile' },
];

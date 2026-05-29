import type { SpeechMouthShape } from '@/components/game/speech/speech-oral-imitation/modules/speechOralImitationTypes';

export const SHAPE_EMOJI: Record<SpeechMouthShape, string> = {
  open: '😮',
  closed: '😌',
  round: '😯',
  smile: '😊',
  ooo: '😗',
  eee: '😁',
  spread: '😄',
  watch: '👀',
};

export const SHAPE_LABEL: Record<SpeechMouthShape, string> = {
  open: 'Open mouth',
  closed: 'Closed lips',
  round: 'Round mouth',
  smile: 'Smile mouth',
  ooo: 'OOO',
  eee: 'EEE',
  spread: 'Wide smile',
  watch: 'Watch',
};

export const COPY_SHAPES: { shape: SpeechMouthShape; label: string }[] = [
  { shape: 'open', label: 'Open mouth' },
  { shape: 'closed', label: 'Closed lips' },
  { shape: 'round', label: 'Round mouth' },
  { shape: 'smile', label: 'Smile mouth' },
];

export const ROBOT_SHAPES: { shape: SpeechMouthShape; label: string }[] = [
  { shape: 'ooo', label: 'OOO' },
  { shape: 'eee', label: 'EEE' },
  { shape: 'open', label: 'Open' },
  { shape: 'closed', label: 'Closed' },
];

export const PATTERN_SEQUENCES: { shapes: SpeechMouthShape[]; label: string }[] = [
  { shapes: ['open', 'closed'], label: 'Open → Closed' },
  { shapes: ['round', 'spread'], label: 'Round → Wide' },
  { shapes: ['ooo', 'eee'], label: 'OOO → EEE' },
];

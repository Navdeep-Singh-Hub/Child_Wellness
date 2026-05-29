import type { CVPattern } from '@/components/game/speech/cv-preparation/modules/cvPreparationTypes';

export const PATTERN_EMOJI: Record<CVPattern, string> = {
  ma: '👄',
  pa: '🫧',
  ba: '🐻',
  moo: '🐮',
  bee: '🐝',
  watch: '👀',
};

export const PATTERN_LABEL: Record<CVPattern, string> = {
  ma: 'MA — lips together, then open',
  pa: 'PA — soft pop feeling',
  ba: 'BA — gentle bounce sound',
  moo: 'MOO — round lips',
  bee: 'BEE — smile lips',
  watch: 'Watch the pattern',
};

export const PATTERN_SHORT: Record<CVPattern, string> = {
  ma: 'MA',
  pa: 'PA',
  ba: 'BA',
  moo: 'MOO',
  bee: 'BEE',
  watch: 'Watch',
};

export const CORE_CV: { pattern: CVPattern; label: string }[] = [
  { pattern: 'ma', label: 'MA' },
  { pattern: 'pa', label: 'PA' },
  { pattern: 'ba', label: 'BA' },
];

export const ANIMAL_CV: { pattern: CVPattern; animal: string; emoji: string }[] = [
  { pattern: 'ma', animal: 'Monkey', emoji: '🐵' },
  { pattern: 'pa', animal: 'Panda', emoji: '🐼' },
  { pattern: 'moo', animal: 'Cow', emoji: '🐮' },
];

export const TRAIN_SEQUENCES: { from: CVPattern; to: CVPattern; label: string }[] = [
  { from: 'ma', to: 'ma', label: 'MA → MA' },
  { from: 'pa', to: 'pa', label: 'PA → PA' },
  { from: 'moo', to: 'ma', label: 'MOO → MA' },
];

export const ROBOT_STEPS = ['Open mouth', 'Close lips', 'Try a sound'] as const;

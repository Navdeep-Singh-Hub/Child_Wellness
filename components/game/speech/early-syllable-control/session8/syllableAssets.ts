import type { EarlySyllable } from '@/components/game/speech/early-syllable-control/modules/earlySyllableControlTypes';
import { syllableToLabel } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlEngine';

export const SYLLABLE_EMOJI: Record<EarlySyllable, string> = {
  ma: '👄',
  pa: '🫧',
  ba: '🐻',
  moo: '🐮',
  bee: '🐝',
  aaa: '😮',
  watch: '👀',
};

export const SYLLABLE_LABEL: Record<EarlySyllable, string> = {
  ma: syllableToLabel('ma'),
  pa: syllableToLabel('pa'),
  ba: syllableToLabel('ba'),
  moo: syllableToLabel('moo'),
  bee: syllableToLabel('bee'),
  aaa: syllableToLabel('aaa'),
  watch: 'Watch',
};

export const CORE_SYLLABLES: { syllable: EarlySyllable; label: string }[] = [
  { syllable: 'ma', label: 'MA' },
  { syllable: 'pa', label: 'PA' },
  { syllable: 'ba', label: 'BA' },
];

export const ANIMAL_SYLLABLES: { syllable: EarlySyllable; animal: string; emoji: string }[] = [
  { syllable: 'moo', animal: 'Cow', emoji: '🐮' },
  { syllable: 'bee', animal: 'Bee', emoji: '🐝' },
  { syllable: 'ma', animal: 'Monkey', emoji: '🐵' },
];

export const ROBOT_STEPS: { syllable: EarlySyllable; label: string }[] = [
  { syllable: 'ma', label: 'MA' },
  { syllable: 'pa', label: 'PA' },
  { syllable: 'moo', label: 'OO' },
];

import type { VowelShape } from '@/components/game/speech/vowel-shaping/modules/vowelShapingTypes';

export const VOWEL_EMOJI: Record<VowelShape, string> = {
  aaa: '😮',
  ooo: '😗',
  eee: '😁',
  watch: '👀',
};

export const VOWEL_LABEL: Record<VowelShape, string> = {
  aaa: 'AAA — open mouth',
  ooo: 'OOO — round mouth',
  eee: 'EEE — smile mouth',
  watch: 'Watch the shape',
};

export const VOWEL_SHORT: Record<VowelShape, string> = {
  aaa: 'AAA',
  ooo: 'OOO',
  eee: 'EEE',
  watch: 'Watch',
};

export const CORE_VOWELS: { shape: VowelShape; label: string }[] = [
  { shape: 'aaa', label: 'Open AAA' },
  { shape: 'ooo', label: 'Round OOO' },
  { shape: 'eee', label: 'Smile EEE' },
];

export const ANIMAL_VOWELS: { shape: VowelShape; animal: string; emoji: string }[] = [
  { shape: 'ooo', animal: 'Owl', emoji: '🦉' },
  { shape: 'eee', animal: 'Sheep', emoji: '🐑' },
  { shape: 'aaa', animal: 'Lion', emoji: '🦁' },
];

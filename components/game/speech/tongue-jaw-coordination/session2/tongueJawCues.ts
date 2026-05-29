import type { TongueApproximation } from '@/components/game/speech/tongue-jaw-coordination/modules/tongueJawCoordinationTypes';

export type TongueJawCue = {
  tongueApproximation: TongueApproximation;
  label: string;
  tongueLabel: string;
  jawLabel: string;
  emoji: string;
  tts: string;
};

export const EXPLORER_CUES: TongueJawCue[] = [
  {
    tongueApproximation: 'TONGUE_OUT_APPROX',
    label: 'Open + tongue out',
    tongueLabel: 'Tongue out (any try)',
    jawLabel: 'Jaw open',
    emoji: '😛',
    tts: 'Open mouth and try tongue out. Any try counts!',
  },
  {
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Open + tongue up',
    tongueLabel: 'Tongue up/visible (any try)',
    jawLabel: 'Jaw open',
    emoji: '👅',
    tts: 'Open mouth and try tongue up. Any try counts!',
  },
  {
    tongueApproximation: 'NONE',
    label: 'Close + tongue in',
    tongueLabel: 'Tongue in / rest',
    jawLabel: 'Jaw closed or relaxed',
    emoji: '😌',
    tts: 'Close mouth gently. Tongue rests inside.',
  },
];

export const MONSTER_CUES: TongueJawCue[] = [
  {
    tongueApproximation: 'TONGUE_OUT_APPROX',
    label: 'Monster tongue out!',
    tongueLabel: 'Tongue out (any try)',
    jawLabel: 'Jaw open',
    emoji: '👾',
    tts: 'Silly monster! Try tongue out with open mouth.',
  },
  {
    tongueApproximation: 'NONE',
    label: 'Monster mouth open',
    tongueLabel: 'Tongue in / rest',
    jawLabel: 'Jaw open',
    emoji: '😮',
    tts: 'Monster mouth open. Tongue can stay inside.',
  },
  {
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Monster tongue in',
    tongueLabel: 'Tongue up/visible (any try)',
    jawLabel: 'Jaw open',
    emoji: '😋',
    tts: 'Tongue moves back in. Any try counts.',
  },
];

export const TUNNEL_PAIRS: { a: TongueJawCue; b: TongueJawCue }[] = [
  {
    a: {
      tongueApproximation: 'TONGUE_VISIBLE_APPROX',
      label: 'OPEN',
      tongueLabel: 'Tongue visible (any try)',
      jawLabel: 'Jaw open',
      emoji: '😮',
      tts: 'First: open mouth.',
    },
    b: {
      tongueApproximation: 'TONGUE_OUT_APPROX',
      label: 'TONGUE OUT',
      tongueLabel: 'Tongue out (any try)',
      jawLabel: 'Jaw open',
      emoji: '😛',
      tts: 'Now: try tongue out.',
    },
  },
  {
    a: {
      tongueApproximation: 'TONGUE_VISIBLE_APPROX',
      label: 'OPEN',
      tongueLabel: 'Tongue visible (any try)',
      jawLabel: 'Jaw open',
      emoji: '😮',
      tts: 'First: open mouth.',
    },
    b: {
      tongueApproximation: 'NONE',
      label: 'CLOSED',
      tongueLabel: 'Tongue in / rest',
      jawLabel: 'Jaw closed or relaxed',
      emoji: '😌',
      tts: 'Now: close mouth softly.',
    },
  },
];

export const RHYTHM_CUES: TongueJawCue[] = [
  {
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Slow open',
    tongueLabel: 'Tongue visible (any try)',
    jawLabel: 'Jaw open',
    emoji: '🙂',
    tts: 'Slow rhythm. Open mouth gently.',
  },
  {
    tongueApproximation: 'TONGUE_OUT_APPROX',
    label: 'Slow tongue out',
    tongueLabel: 'Tongue out (any try)',
    jawLabel: 'Jaw open',
    emoji: '😛',
    tts: 'Slow rhythm. Tongue out try.',
  },
  {
    tongueApproximation: 'NONE',
    label: 'Slow rest',
    tongueLabel: 'Tongue in / rest',
    jawLabel: 'Jaw closed or relaxed',
    emoji: '😌',
    tts: 'Slow rhythm. Rest your mouth.',
  },
];

export const HERO_CUES: TongueJawCue[] = [
  {
    tongueApproximation: 'TONGUE_OUT_APPROX',
    label: 'Watch & tongue out',
    tongueLabel: 'Tongue out (any try)',
    jawLabel: 'Jaw open',
    emoji: '😛',
    tts: 'Hero step: open mouth and try tongue out.',
  },
  {
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Tongue visible',
    tongueLabel: 'Tongue up/visible (any try)',
    jawLabel: 'Jaw open',
    emoji: '👅',
    tts: 'Hero step: tongue visible. Any try counts.',
  },
  {
    tongueApproximation: 'NONE',
    label: 'Close & rest',
    tongueLabel: 'Tongue in / rest',
    jawLabel: 'Jaw closed or relaxed',
    emoji: '😌',
    tts: 'Hero step: close and rest.',
  },
];


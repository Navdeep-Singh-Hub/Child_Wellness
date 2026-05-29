import type {
  LipApproximation,
  TongueApproximation,
} from '@/components/game/speech/tongue-lip-coordination/modules/tongueLipCoordinationTypes';

export type TongueLipCue = {
  lipApproximation: LipApproximation;
  tongueApproximation: TongueApproximation;
  label: string;
  lipLabel: string;
  tongueLabel: string;
  emoji: string;
  tts: string;
};

export const TEAM_CUES: TongueLipCue[] = [
  {
    lipApproximation: 'ROUNDED',
    tongueApproximation: 'TONGUE_OUT_APPROX',
    label: 'Round lips + tongue out',
    lipLabel: 'Round lips softly',
    tongueLabel: 'Tongue out (any try)',
    emoji: '😛',
    tts: 'Round lips and try tongue out. Any try counts!',
  },
  {
    lipApproximation: 'SPREAD',
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Smile lips + tongue visible',
    lipLabel: 'Smile lips gently',
    tongueLabel: 'Tongue visible (any try)',
    emoji: '😁',
    tts: 'Smile lips and show a little tongue. Great trying!',
  },
  {
    lipApproximation: 'CLOSED',
    tongueApproximation: 'NONE',
    label: 'Closed lips + tongue in',
    lipLabel: 'Close lips softly',
    tongueLabel: 'Tongue relaxed',
    emoji: '😌',
    tts: 'Close lips and rest tongue inside.',
  },
];

export const MONSTER_CUES: TongueLipCue[] = [
  {
    lipApproximation: 'TONGUE_OUT_APPROX',
    tongueApproximation: 'TONGUE_OUT_APPROX',
    label: 'Monster tongue out',
    lipLabel: 'Open lips',
    tongueLabel: 'Tongue out try',
    emoji: '👾',
    tts: 'Monster tongue out! Any try counts.',
  },
  {
    lipApproximation: 'SPREAD',
    tongueApproximation: 'NONE',
    label: 'Funny monster lips',
    lipLabel: 'Smile lips',
    tongueLabel: 'Tongue relaxed',
    emoji: '😜',
    tts: 'Funny smile lips. Great effort!',
  },
  {
    lipApproximation: 'ROUNDED',
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Round monster lips',
    lipLabel: 'Round lips',
    tongueLabel: 'Tongue visible try',
    emoji: '😮',
    tts: 'Round monster lips and show a little tongue.',
  },
];

export const SWITCH_CUES: { a: TongueLipCue; b: TongueLipCue }[] = [
  {
    a: {
      lipApproximation: 'ROUNDED',
      tongueApproximation: 'NONE',
      label: 'ROUND',
      lipLabel: 'Round lips',
      tongueLabel: 'Tongue relaxed',
      emoji: '😮',
      tts: 'First, round lips.',
    },
    b: {
      lipApproximation: 'TONGUE_OUT_APPROX',
      tongueApproximation: 'TONGUE_OUT_APPROX',
      label: 'TONGUE OUT',
      lipLabel: 'Open lips',
      tongueLabel: 'Tongue out',
      emoji: '😛',
      tts: 'Now try tongue out.',
    },
  },
  {
    a: {
      lipApproximation: 'SPREAD',
      tongueApproximation: 'NONE',
      label: 'SMILE',
      lipLabel: 'Smile lips',
      tongueLabel: 'Tongue relaxed',
      emoji: '😁',
      tts: 'First, smile lips.',
    },
    b: {
      lipApproximation: 'CLOSED',
      tongueApproximation: 'NONE',
      label: 'CLOSED',
      lipLabel: 'Close lips softly',
      tongueLabel: 'Tongue relaxed',
      emoji: '😌',
      tts: 'Now close lips softly.',
    },
  },
  {
    a: {
      lipApproximation: 'TONGUE_VISIBLE_APPROX',
      tongueApproximation: 'TONGUE_VISIBLE_APPROX',
      label: 'TONGUE VISIBLE',
      lipLabel: 'Lips open',
      tongueLabel: 'Tongue visible',
      emoji: '👅',
      tts: 'First, show a little tongue.',
    },
    b: {
      lipApproximation: 'ROUNDED',
      tongueApproximation: 'NONE',
      label: 'ROUND',
      lipLabel: 'Round lips',
      tongueLabel: 'Tongue relaxed',
      emoji: '😮',
      tts: 'Now round lips.',
    },
  },
];

export const RHYTHM_CUES: TongueLipCue[] = [
  {
    lipApproximation: 'OPEN',
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Slow open + tongue',
    lipLabel: 'Lips open',
    tongueLabel: 'Tongue visible',
    emoji: '🙂',
    tts: 'Slow rhythm. Open lips with tongue visible.',
  },
  {
    lipApproximation: 'SPREAD',
    tongueApproximation: 'NONE',
    label: 'Slow smile',
    lipLabel: 'Smile lips',
    tongueLabel: 'Tongue relaxed',
    emoji: '😁',
    tts: 'Slow rhythm. Smile lips softly.',
  },
  {
    lipApproximation: 'ROUNDED',
    tongueApproximation: 'NONE',
    label: 'Slow round',
    lipLabel: 'Round lips',
    tongueLabel: 'Tongue relaxed',
    emoji: '😮',
    tts: 'Slow rhythm. Round lips gently.',
  },
];

export const HERO_CUES: TongueLipCue[] = [
  {
    lipApproximation: 'TONGUE_OUT_APPROX',
    tongueApproximation: 'TONGUE_OUT_APPROX',
    label: 'Watch and tongue out',
    lipLabel: 'Open lips',
    tongueLabel: 'Tongue out try',
    emoji: '😛',
    tts: 'Hero step: open lips and try tongue out.',
  },
  {
    lipApproximation: 'SPREAD',
    tongueApproximation: 'TONGUE_VISIBLE_APPROX',
    label: 'Smile + tongue visible',
    lipLabel: 'Smile lips',
    tongueLabel: 'Tongue visible try',
    emoji: '😁',
    tts: 'Hero step: smile lips and show tongue.',
  },
  {
    lipApproximation: 'CLOSED',
    tongueApproximation: 'NONE',
    label: 'Close and rest',
    lipLabel: 'Close lips softly',
    tongueLabel: 'Tongue relaxed',
    emoji: '😌',
    tts: 'Hero step: close and rest.',
  },
];

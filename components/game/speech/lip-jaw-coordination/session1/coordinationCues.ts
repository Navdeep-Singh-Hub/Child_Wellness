import type { MouthState } from '@/components/game/speech/lip-jaw-coordination/modules/lipJawCoordinationTypes';

export type CoordinationCue = {
  mouthState: MouthState;
  label: string;
  lipLabel: string;
  jawLabel: string;
  emoji: string;
  tts: string;
};

export const MOUTH_EMOJI: Record<MouthState, string> = {
  OPEN: '😮',
  CLOSED: '😌',
  ROUNDED: '⭕',
  SPREAD: '😁',
  PARTIAL_OPEN: '🙂',
};

export const TEAMWORK_CUES: CoordinationCue[] = [
  {
    mouthState: 'OPEN',
    label: 'Open wide team',
    lipLabel: 'Lips wide',
    jawLabel: 'Jaw open',
    emoji: '😮',
    tts: 'Open wide! Lips wide and jaw open together. Any try counts!',
  },
  {
    mouthState: 'CLOSED',
    label: 'Close team',
    lipLabel: 'Lips close',
    jawLabel: 'Jaw still',
    emoji: '😌',
    tts: 'Close your mouth gently. Lips and jaw close together!',
  },
];

export const ROBOT_CUES: CoordinationCue[] = [
  {
    mouthState: 'ROUNDED',
    label: 'Round + open',
    lipLabel: 'Round lips',
    jawLabel: 'Jaw open',
    emoji: '⭕',
    tts: 'Round lips and open jaw — like OOO with your mouth!',
  },
  {
    mouthState: 'SPREAD',
    label: 'Smile + open',
    lipLabel: 'Smile lips',
    jawLabel: 'Jaw open',
    emoji: '😁',
    tts: 'Smile lips and jaw open — big happy mouth!',
  },
];

export const SWITCH_CUES: { a: CoordinationCue; b: CoordinationCue }[] = [
  {
    a: {
      mouthState: 'OPEN',
      label: 'OPEN',
      lipLabel: 'Lips wide',
      jawLabel: 'Jaw open',
      emoji: '😮',
      tts: 'First: open mouth. Lips and jaw open!',
    },
    b: {
      mouthState: 'CLOSED',
      label: 'CLOSED',
      lipLabel: 'Lips close',
      jawLabel: 'Jaw still',
      emoji: '😌',
      tts: 'Now: close mouth. Lips and jaw close!',
    },
  },
  {
    a: {
      mouthState: 'ROUNDED',
      label: 'ROUND',
      lipLabel: 'Round lips',
      jawLabel: 'Jaw mid',
      emoji: '⭕',
      tts: 'Round lips — OOO shape!',
    },
    b: {
      mouthState: 'SPREAD',
      label: 'SMILE',
      lipLabel: 'Smile lips',
      jawLabel: 'Jaw open',
      emoji: '😁',
      tts: 'Smile lips wide — happy mouth!',
    },
  },
];

export const RHYTHM_CUES: CoordinationCue[] = [
  {
    mouthState: 'PARTIAL_OPEN',
    label: 'Slow open',
    lipLabel: 'Soft lips',
    jawLabel: 'Jaw a little',
    emoji: '🙂',
    tts: 'Slow face rhythm. Soft lips, jaw moves a little!',
  },
  {
    mouthState: 'OPEN',
    label: 'Slow wide',
    lipLabel: 'Lips wide',
    jawLabel: 'Jaw open',
    emoji: '😮',
    tts: 'Wide slow mouth — lips and jaw together!',
  },
  {
    mouthState: 'CLOSED',
    label: 'Slow close',
    lipLabel: 'Lips close',
    jawLabel: 'Jaw still',
    emoji: '😌',
    tts: 'Slow close — rest your mouth team!',
  },
];

export const HERO_CUES: CoordinationCue[] = [
  {
    mouthState: 'OPEN',
    label: 'Watch & open',
    lipLabel: 'Lips wide',
    jawLabel: 'Jaw open',
    emoji: '😮',
    tts: 'Hero step: watch, then open lips and jaw!',
  },
  {
    mouthState: 'ROUNDED',
    label: 'Round play',
    lipLabel: 'Round lips',
    jawLabel: 'Jaw mid',
    emoji: '⭕',
    tts: 'Round lips and jaw — playful try!',
  },
  {
    mouthState: 'CLOSED',
    label: 'Close play',
    lipLabel: 'Lips close',
    jawLabel: 'Jaw still',
    emoji: '😌',
    tts: 'Close mouth team — you did great!',
  },
];

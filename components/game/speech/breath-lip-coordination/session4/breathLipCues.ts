import type { LipApproximation } from '@/components/game/speech/breath-lip-coordination/modules/breathLipCoordinationTypes';

export type BreathLipCue = {
  lipApproximation: LipApproximation;
  label: string;
  lipLabel: string;
  airLabel: string;
  emoji: string;
  tts: string;
};

export const MAGIC_WIND_CUES: BreathLipCue[] = [
  {
    lipApproximation: 'ROUNDED',
    label: 'Round lips + soft blow',
    lipLabel: 'Round lips gently',
    airLabel: 'Soft blow',
    emoji: '😮‍💨',
    tts: 'Round lips and try a soft blow. Any try counts.',
  },
  {
    lipApproximation: 'OPEN',
    label: 'Open lips + airflow',
    lipLabel: 'Open lips',
    airLabel: 'Gentle air',
    emoji: '🙂',
    tts: 'Open lips and send gentle air.',
  },
  {
    lipApproximation: 'SPREAD',
    label: 'Smile lips + gentle air',
    lipLabel: 'Smile lips softly',
    airLabel: 'Light air or hum',
    emoji: '😁',
    tts: 'Smile lips and try gentle air. Humming air also counts.',
  },
];

export const BALLOON_CUES: BreathLipCue[] = [
  {
    lipApproximation: 'ROUNDED',
    label: 'Balloon breath',
    lipLabel: 'Round lips',
    airLabel: 'Any airflow',
    emoji: '🎈',
    tts: 'Blow for the balloon. Weak air still counts.',
  },
  {
    lipApproximation: 'PARTIAL_OPEN',
    label: 'Little air puff',
    lipLabel: 'Partly open lips',
    airLabel: 'Small puff',
    emoji: '🌬️',
    tts: 'Small puffs are great too.',
  },
];

export const ROBOT_SWITCH_CUES: { a: BreathLipCue; b: BreathLipCue }[] = [
  {
    a: {
      lipApproximation: 'ROUNDED',
      label: 'ROUND',
      lipLabel: 'Round lips',
      airLabel: 'Prepare air',
      emoji: '🤖',
      tts: 'Robot says round lips.',
    },
    b: {
      lipApproximation: 'ROUNDED',
      label: 'BLOW',
      lipLabel: 'Keep rounded',
      airLabel: 'Soft blow',
      emoji: '💨',
      tts: 'Now soft blow.',
    },
  },
  {
    a: {
      lipApproximation: 'OPEN',
      label: 'OPEN',
      lipLabel: 'Open lips',
      airLabel: 'Air ready',
      emoji: '😮',
      tts: 'Open lips.',
    },
    b: {
      lipApproximation: 'OPEN',
      label: 'AIR',
      lipLabel: 'Open lips',
      airLabel: 'Gentle air',
      emoji: '🌬️',
      tts: 'Now send air.',
    },
  },
];

export const RHYTHM_CUES: BreathLipCue[] = [
  {
    lipApproximation: 'ROUNDED',
    label: 'Blow',
    lipLabel: 'Round lips',
    airLabel: 'Soft blow',
    emoji: '💨',
    tts: 'Blow softly.',
  },
  {
    lipApproximation: 'CLOSED',
    label: 'Pause',
    lipLabel: 'Close lips softly',
    airLabel: 'Pause air',
    emoji: '⏸️',
    tts: 'Pause and rest.',
  },
  {
    lipApproximation: 'ROUNDED',
    label: 'Blow again',
    lipLabel: 'Round lips',
    airLabel: 'Soft blow',
    emoji: '🌬️',
    tts: 'Blow again. Great trying.',
  },
];

export const HERO_CUES: BreathLipCue[] = [
  {
    lipApproximation: 'ROUNDED',
    label: 'Watch and round',
    lipLabel: 'Round lips',
    airLabel: 'Try airflow',
    emoji: '🦸',
    tts: 'Hero step one: round lips and try air.',
  },
  {
    lipApproximation: 'OPEN',
    label: 'Open + air',
    lipLabel: 'Open lips',
    airLabel: 'Soft air',
    emoji: '🙂',
    tts: 'Hero step two: open lips and soft air.',
  },
  {
    lipApproximation: 'SPREAD',
    label: 'Smile + light air',
    lipLabel: 'Smile lips',
    airLabel: 'Light air or mouth movement',
    emoji: '😁',
    tts: 'Hero step three: smile lips and light air.',
  },
];

import type { JawApproximation } from '@/components/game/speech/breath-jaw-coordination/modules/breathJawCoordinationTypes';

export type BreathJawCue = {
  jawApproximation: JawApproximation;
  label: string;
  jawLabel: string;
  airLabel: string;
  emoji: string;
  tts: string;
};

export const MAGIC_WIND_CUES: BreathJawCue[] = [
  {
    jawApproximation: 'OPEN',
    label: 'Open mouth + soft blow',
    jawLabel: 'Open jaw gently',
    airLabel: 'Soft blow',
    emoji: '😮‍💨',
    tts: 'Open mouth and try soft blow. Any try counts.',
  },
  {
    jawApproximation: 'CLOSED',
    label: 'Close mouth + stop',
    jawLabel: 'Close jaw softly',
    airLabel: 'Stop air',
    emoji: '😌',
    tts: 'Close and pause air.',
  },
  {
    jawApproximation: 'OPEN',
    label: 'Open then airflow',
    jawLabel: 'Open jaw',
    airLabel: 'Gentle air',
    emoji: '💨',
    tts: 'Open and send gentle air.',
  },
];

export const DRAGON_CUES: BreathJawCue[] = [
  {
    jawApproximation: 'OPEN',
    label: 'Dragon breath',
    jawLabel: 'Open mouth',
    airLabel: 'Any airflow',
    emoji: '🐉',
    tts: 'Dragon wakes with any airflow attempt.',
  },
  {
    jawApproximation: 'PARTIAL_OPEN',
    label: 'Little dragon puff',
    jawLabel: 'Partly open mouth',
    airLabel: 'Small puff or hum',
    emoji: '🌬️',
    tts: 'Small puffs and hum air count too.',
  },
];

export const ROBOT_SWITCH_CUES: { a: BreathJawCue; b: BreathJawCue }[] = [
  {
    a: {
      jawApproximation: 'OPEN',
      label: 'OPEN',
      jawLabel: 'Open jaw',
      airLabel: 'Prepare air',
      emoji: '🤖',
      tts: 'Robot says open.',
    },
    b: {
      jawApproximation: 'OPEN',
      label: 'AIR',
      jawLabel: 'Keep open',
      airLabel: 'Soft air',
      emoji: '💨',
      tts: 'Now air.',
    },
  },
  {
    a: {
      jawApproximation: 'CLOSED',
      label: 'CLOSE',
      jawLabel: 'Close jaw softly',
      airLabel: 'Pause air',
      emoji: '😌',
      tts: 'Robot says close.',
    },
    b: {
      jawApproximation: 'CLOSED',
      label: 'STOP',
      jawLabel: 'Stay closed',
      airLabel: 'Stop air',
      emoji: '⏸️',
      tts: 'Now stop.',
    },
  },
];

export const TRAIN_RHYTHM_CUES: BreathJawCue[] = [
  {
    jawApproximation: 'OPEN',
    label: 'Blow',
    jawLabel: 'Open jaw',
    airLabel: 'Soft blow',
    emoji: '🚂',
    tts: 'Train blow.',
  },
  {
    jawApproximation: 'CLOSED',
    label: 'Pause',
    jawLabel: 'Close jaw',
    airLabel: 'Pause air',
    emoji: '⏸️',
    tts: 'Train pause.',
  },
  {
    jawApproximation: 'OPEN',
    label: 'Blow again',
    jawLabel: 'Open jaw',
    airLabel: 'Soft blow',
    emoji: '💨',
    tts: 'Train blow again.',
  },
];

export const HERO_CUES: BreathJawCue[] = [
  {
    jawApproximation: 'OPEN',
    label: 'Watch and open',
    jawLabel: 'Open jaw',
    airLabel: 'Try airflow',
    emoji: '🦸',
    tts: 'Hero step one: open and try airflow.',
  },
  {
    jawApproximation: 'PARTIAL_OPEN',
    label: 'Half open + soft air',
    jawLabel: 'Partly open jaw',
    airLabel: 'Soft air or hum',
    emoji: '🙂',
    tts: 'Hero step two: half open and soft air.',
  },
  {
    jawApproximation: 'CLOSED',
    label: 'Close and pause',
    jawLabel: 'Close jaw softly',
    airLabel: 'Pause',
    emoji: '😌',
    tts: 'Hero step three: close and pause.',
  },
];

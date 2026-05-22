import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  useVoiceGameSession,
  useSpeechHitCounter,
  createBurstDetector,
  tickSyllableMatch,
  SYLLABLE_MAMA,
  type SyllableCue,
} from '@/components/game/speech/level3/shared/syllableGameShared';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  useSpeechHitCounter,
  createBurstDetector,
};

export function useWordGameSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  return useVoiceGameSession(gameId, rounds);
}

export type WordCue = SyllableCue & { emoji: string };

export const tickWordMatch = tickSyllableMatch;

export const WORD_MORE: WordCue = {
  label: 'More',
  speak: 'More',
  words: ['more', 'moor', 'moh'],
  emoji: '➕',
  mode: 'hold',
};

export const WORD_MAMA: WordCue = {
  ...SYLLABLE_MAMA,
  emoji: '👩',
};

export const WORD_BALL: WordCue = {
  label: 'Ball',
  speak: 'Ball',
  words: ['ball', 'bal', 'bawl', 'bowl'],
  emoji: '⚽',
  mode: 'burst',
};

export const SNACK_CUES: WordCue[] = [
  {
    label: 'Apple',
    speak: 'Apple',
    words: ['apple', 'apuh', 'aple', 'appo'],
    emoji: '🍎',
    mode: 'hold',
  },
  {
    label: 'Milk',
    speak: 'Milk',
    words: ['milk', 'mill', 'muh', 'mee'],
    emoji: '🥛',
    mode: 'hold',
  },
  {
    label: 'Cookie',
    speak: 'Cookie',
    words: ['cookie', 'cook', 'kooky', 'coo kee'],
    emoji: '🍪',
    mode: 'hold',
  },
  {
    label: 'Banana',
    speak: 'Banana',
    words: ['banana', 'nana', 'buh nana', 'bana'],
    emoji: '🍌',
    mode: 'hold',
  },
];

export const TOY_CUES: WordCue[] = [
  {
    label: 'Bear',
    speak: 'Bear',
    words: ['bear', 'bare', 'ber', 'beer'],
    emoji: '🧸',
    mode: 'burst',
  },
  {
    label: 'Doll',
    speak: 'Doll',
    words: ['doll', 'dawl', 'dal', 'dole'],
    emoji: '🪆',
    mode: 'burst',
  },
  {
    label: 'Car',
    speak: 'Car',
    words: ['car', 'kar', 'cah', 'ca'],
    emoji: '🚗',
    mode: 'burst',
  },
];

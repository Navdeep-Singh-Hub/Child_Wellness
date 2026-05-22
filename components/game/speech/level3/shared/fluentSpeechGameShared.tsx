import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  useVoiceGameSession,
} from '@/components/game/speech/level3/shared/voiceGameShared';
import {
  matchStep,
  playSoundSequence,
  useSpeechHitCounter,
  createBurstDetector,
  SEQ_MA,
  SEQ_PA,
  SEQ_BA,
  SEQ_MOO,
  type SeqCue,
} from '@/components/game/speech/level3/shared/sequenceGameShared';
import {
  sustainedVoice,
  VOICE_ACTIVE_THRESHOLD,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import { WORD_MORE, WORD_BALL } from '@/components/game/speech/level3/shared/wordGameShared';
import { SYLLABLE_MAMA } from '@/components/game/speech/level3/shared/syllableGameShared';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  useVoiceGameSession,
  matchStep,
  playSoundSequence,
  useSpeechHitCounter,
  createBurstDetector,
  sustainedVoice,
  VOICE_ACTIVE_THRESHOLD,
  SEQ_MA,
  SEQ_PA,
  SEQ_BA,
  SEQ_MOO,
};

export function useFluentSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  return useVoiceGameSession(gameId, rounds);
}

/** Continuous syllable chain for connected speech */
export const TRAIN_SYLLABLE_CHAIN: SeqCue[] = [SEQ_MA, SEQ_PA, SEQ_MA, SEQ_BA, SEQ_MOO];

export type BuildPhrase = {
  label: string;
  emoji: string;
  parts: SeqCue[];
};

export const BUILD_PHRASES: BuildPhrase[] = [
  {
    label: 'I want more',
    emoji: '🙋',
    parts: [
      { label: 'I', speak: 'I', words: ['i', 'eye', 'hi'], mode: 'burst' },
      { label: 'Want', speak: 'Want', words: ['want', 'wont', 'what'], mode: 'burst' },
      WORD_MORE,
    ],
  },
  {
    label: 'Big ball',
    emoji: '⚽',
    parts: [
      { label: 'Big', speak: 'Big', words: ['big', 'bih'], mode: 'burst' },
      WORD_BALL,
    ],
  },
  {
    label: 'Hi mama',
    emoji: '👩',
    parts: [
      { label: 'Hi', speak: 'Hi', words: ['hi', 'high', 'hey'], mode: 'burst' },
      SYLLABLE_MAMA,
    ],
  },
];

export type AdventureScene = {
  title: string;
  story: string;
  speakPrompt: string;
  cue: SeqCue;
  emoji: string;
};

export const ADVENTURE_SCENES: AdventureScene[] = [
  {
    title: 'Forest path',
    story: 'You reach a forest path.',
    speakPrompt: 'Say go to walk!',
    cue: { label: 'Go', speak: 'Go', words: ['go', 'goh', 'no'], mode: 'burst' },
    emoji: '🌲',
  },
  {
    title: 'River bridge',
    story: 'A river blocks the way.',
    speakPrompt: 'Say help to cross!',
    cue: { label: 'Help', speak: 'Help', words: ['help', 'hel', 'up'], mode: 'burst' },
    emoji: '🌊',
  },
  {
    title: 'Mountain top',
    story: 'You climb the mountain!',
    speakPrompt: 'Say yay to celebrate!',
    cue: { label: 'Yay', speak: 'Yay', words: ['yay', 'ya', 'yeah', 'hooray'], mode: 'burst' },
    emoji: '⛰️',
  },
];

export type ConversationPrompt = {
  avatarLine: string;
  speak: string;
  words: string[];
  emoji: string;
  childHint: string;
};

export const CONVERSATION_PROMPTS: ConversationPrompt[] = [
  {
    avatarLine: 'What do you want?',
    speak: 'What do you want?',
    words: ['more', 'juice', 'ball', 'want', 'mama'],
    emoji: '🤔',
    childHint: 'Say what you want!',
  },
  {
    avatarLine: 'Who loves you?',
    speak: 'Who loves you?',
    words: ['mama', 'mom', 'dada', 'papa', 'you'],
    emoji: '❤️',
    childHint: 'Say Mama or Dada!',
  },
  {
    avatarLine: 'Want to play?',
    speak: 'Want to play?',
    words: ['yes', 'yeah', 'play', 'ball', 'yay'],
    emoji: '🎮',
    childHint: 'Say yes or play!',
  },
  {
    avatarLine: 'How do you feel?',
    speak: 'How do you feel?',
    words: ['happy', 'good', 'yay', 'fine', 'great'],
    emoji: '😊',
    childHint: 'Say happy or yay!',
  },
];

export const FLUENT_PHRASE: SeqCue = {
  label: 'I like trains',
  speak: 'I like trains',
  words: ['i like trains', 'like', 'trains', 'train', 'choo'],
  mode: 'hold',
};

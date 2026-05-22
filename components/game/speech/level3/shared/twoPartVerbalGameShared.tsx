import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  VOICE_ACTIVE_THRESHOLD,
  useVoiceGameSession,
  playSoundSequence,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  SEQ_MA,
  SEQ_PA,
  SEQ_BA,
  type SeqCue,
} from '@/components/game/speech/level3/shared/sequenceGameShared';
import { sustainedVoice } from '@/components/game/speech/level3/shared/syllableGameShared';
import { WORD_MORE, WORD_BALL } from '@/components/game/speech/level3/shared/wordGameShared';
import { SYLLABLE_MAMA } from '@/components/game/speech/level3/shared/syllableGameShared';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  VOICE_ACTIVE_THRESHOLD,
  useVoiceGameSession,
  playSoundSequence,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  sustainedVoice,
  SEQ_MA,
  SEQ_PA,
  SEQ_BA,
};

export function useTwoPartSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  return useVoiceGameSession(gameId, rounds);
}

export type TapTarget = {
  id: string;
  label: string;
  speak: string;
  words: string[];
  emoji: string;
};

export const TAP_TARGETS: TapTarget[] = [
  {
    id: 'ball',
    label: 'Ball',
    speak: 'Ball',
    words: ['ball', 'bal', 'bawl'],
    emoji: '⚽',
  },
  {
    id: 'apple',
    label: 'Apple',
    speak: 'Apple',
    words: ['apple', 'apuh', 'aple'],
    emoji: '🍎',
  },
  {
    id: 'bear',
    label: 'Bear',
    speak: 'Bear',
    words: ['bear', 'bare', 'ber'],
    emoji: '🧸',
  },
  {
    id: 'car',
    label: 'Car',
    speak: 'Car',
    words: ['car', 'kar', 'cah'],
    emoji: '🚗',
  },
];

export type PhraseCombo = {
  label: string;
  speak: string;
  words: string[];
  emoji: string;
};

export const PHRASE_COMBOS: PhraseCombo[] = [
  {
    label: 'More Juice',
    speak: 'More juice',
    words: ['more juice', 'more', 'juice', 'moor', 'jooce'],
    emoji: '🧃',
  },
  {
    label: 'Big Ball',
    speak: 'Big ball',
    words: ['big ball', 'big', 'ball', 'bih', 'bal'],
    emoji: '⚽',
  },
  {
    label: 'Hi Mama',
    speak: 'Hi mama',
    words: ['hi mama', 'hi', 'mama', 'high', 'mom'],
    emoji: '👩',
  },
  {
    label: 'More Cookie',
    speak: 'More cookie',
    words: ['more cookie', 'more', 'cookie', 'cook'],
    emoji: '🍪',
  },
];

export type TwoStepPhrase = {
  label: string;
  speak: string;
  steps: SeqCue[];
};

export const TWO_STEP_PHRASES: TwoStepPhrase[] = [
  {
    label: 'Ma then Pa',
    speak: 'Ma, then Pa',
    steps: [SEQ_MA, SEQ_PA],
  },
  {
    label: 'More then Ball',
    speak: 'More, then Ball',
    steps: [
      WORD_MORE,
      { label: 'Ball', speak: 'Ball', words: WORD_BALL.words, mode: 'burst' as const },
    ],
  },
  {
    label: 'Ma then Mama',
    speak: 'Ma, then Mama',
    steps: [SEQ_MA, SYLLABLE_MAMA],
  },
];

export type PathwayStep =
  | { type: 'open'; label: string; hint: string }
  | { type: 'sound'; cue: SeqCue }
  | { type: 'tap'; target: TapTarget };

export const SPEECH_PATHWAY: PathwayStep[] = [
  { type: 'open', label: 'Open', hint: 'Open mouth wide' },
  { type: 'sound', cue: SEQ_MA },
  { type: 'sound', cue: SEQ_PA },
  { type: 'tap', target: TAP_TARGETS[0] },
];

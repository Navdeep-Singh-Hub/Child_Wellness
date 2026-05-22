import React from 'react';
import {
  VoiceGameFrame,
  VoiceGameOverlays,
  VOICE_ACTIVE_THRESHOLD,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  useVoiceGameSession,
  useSpeechHitCounter,
  createBurstDetector,
  sustainedVoice,
} from '@/components/game/speech/level3/shared/bilabialGameShared';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  VOICE_ACTIVE_THRESHOLD,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  useSpeechHitCounter,
  createBurstDetector,
  sustainedVoice,
};

export function useSyllableGameSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  return useVoiceGameSession(gameId, rounds);
}

export type SyllableCue = {
  label: string;
  speak: string;
  words: string[];
  /** burst = short plosive syllable; hold = sustained vowel syllable */
  mode: 'burst' | 'hold';
};

export const SYLLABLE_MA: SyllableCue = {
  label: 'Ma',
  speak: 'Ma',
  words: ['ma', 'mah', 'mama'],
  mode: 'burst',
};

export const SYLLABLE_PA: SyllableCue = {
  label: 'Pa',
  speak: 'Pa',
  words: ['pa', 'pah', 'papa'],
  mode: 'burst',
};

export const SYLLABLE_BA: SyllableCue = {
  label: 'Ba',
  speak: 'Ba',
  words: ['ba', 'bah', 'buh'],
  mode: 'burst',
};

export const SYLLABLE_MOO: SyllableCue = {
  label: 'Moo',
  speak: 'Moo',
  words: ['moo', 'mu', 'moon'],
  mode: 'hold',
};

export const SYLLABLE_PEE: SyllableCue = {
  label: 'Pee',
  speak: 'Pee',
  words: ['pee', 'pea', 'p'],
  mode: 'hold',
};

export const SYLLABLE_MAMA: SyllableCue = {
  label: 'Mama',
  speak: 'Mama',
  words: ['mama', 'ma ma', 'mom', 'mum'],
  mode: 'hold',
};

/** Detect syllable: web speech first, else voice burst or hold */
export function tickSyllableMatch(
  cue: SyllableCue,
  voice: { level: number; active: boolean },
  speech: { useSpeech: boolean; consumeHit: () => boolean },
  burst: { tick: (l: number, a: boolean) => boolean },
  holdRef: React.MutableRefObject<number | null>,
  holdMs = 750,
): { progress: number; matched: boolean } {
  if (speech.useSpeech && speech.consumeHit()) {
    return { progress: 1, matched: true };
  }
  if (cue.mode === 'burst') {
    if (burst.tick(voice.level, voice.active)) return { progress: 1, matched: true };
    return { progress: 0, matched: false };
  }
  const { progress, done } = sustainedVoice(voice.level, voice.active, holdMs, holdRef, VOICE_ACTIVE_THRESHOLD);
  return { progress, matched: done };
}

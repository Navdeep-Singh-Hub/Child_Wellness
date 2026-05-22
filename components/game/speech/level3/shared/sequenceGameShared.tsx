import React from 'react';
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
  sustainedVoice,
  VOICE_ACTIVE_THRESHOLD,
  type SyllableCue,
  tickSyllableMatch,
  SYLLABLE_MA,
  SYLLABLE_PA,
  SYLLABLE_BA,
  SYLLABLE_MOO,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import { SOUND_MOO, SOUND_CHOO, type SoundCue } from '@/components/game/speech/level3/shared/animalSoundGameShared';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  useSpeechHitCounter,
  createBurstDetector,
  sustainedVoice,
  VOICE_ACTIVE_THRESHOLD,
  tickSyllableMatch,
  SYLLABLE_MA,
  SYLLABLE_PA,
  SYLLABLE_BA,
  SYLLABLE_MOO,
};

export function useSequenceSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  return useVoiceGameSession(gameId, rounds);
}

export type SeqCue = SyllableCue | SoundCue;

export function toSyllableCue(c: SeqCue): SyllableCue {
  if ('mode' in c && (c.mode === 'hold' || c.mode === 'fricative')) {
    return {
      label: c.label,
      speak: c.speak,
      words: c.words,
      mode: c.mode === 'fricative' ? 'hold' : c.mode,
    };
  }
  return c as SyllableCue;
}

/** Play a list of sounds, then call onChildTurn */
export function playSoundSequence(
  steps: SeqCue[],
  onChildTurn: () => void,
  gapMs = 750,
) {
  let i = 0;
  const next = () => {
    if (i >= steps.length) {
      scheduleGameSpeech('Your turn! Copy the sounds.', 500);
      setTimeout(onChildTurn, 600);
      return;
    }
    speakGame(steps[i].speak);
    i += 1;
    setTimeout(next, gapMs);
  };
  next();
}

export function matchStep(
  cue: SeqCue,
  voice: { level: number; active: boolean },
  speech: { useSpeech: boolean; consumeHit: () => boolean },
  burst: { tick: (l: number, a: boolean) => boolean },
  holdRef: React.MutableRefObject<number | null>,
  holdMs = 700,
) {
  return tickSyllableMatch(toSyllableCue(cue), voice, speech, burst, holdRef, holdMs);
}

export const SEQ_MA = SYLLABLE_MA;
export const SEQ_PA = SYLLABLE_PA;
export const SEQ_BA = SYLLABLE_BA;
export const SEQ_MOO = SYLLABLE_MOO;
export const SEQ_CHOO: SyllableCue = {
  label: 'Choo',
  speak: 'Choo',
  words: ['choo', 'chu', 'train'],
  mode: 'burst',
};

export const ONE_SOUND_POOL: SeqCue[] = [SEQ_MA, SEQ_PA, SEQ_BA, SEQ_MOO, SOUND_MOO];

export const TWO_SOUND_PAIRS: SeqCue[][] = [
  [SEQ_MA, SEQ_BA],
  [SEQ_MA, SEQ_PA],
  [SEQ_PA, SEQ_MOO],
  [SEQ_BA, SEQ_MA],
];

export const LIGHT_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#A855F7'];

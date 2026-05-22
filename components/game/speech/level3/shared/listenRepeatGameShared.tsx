import React from 'react';
import { Platform } from 'react-native';
import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  VOICE_ACTIVE_THRESHOLD,
  useSequenceSession,
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
  tickSyllableMatch,
  SYLLABLE_MAMA,
  type SyllableCue,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import { WORD_BALL, WORD_MORE } from '@/components/game/speech/level3/shared/wordGameShared';
import { vowelMatch, type VowelSense } from '@/components/game/speech/level3/shared/vowelGameShared';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  VOICE_ACTIVE_THRESHOLD,
  useSequenceSession,
  matchStep,
  playSoundSequence,
  useSpeechHitCounter,
  createBurstDetector,
  SEQ_MA,
  SEQ_PA,
  SEQ_BA,
  SEQ_MOO,
};

export function useListenRepeatSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  return useSequenceSession(gameId, rounds);
}

export type ListenPhase = 'listen' | 'say' | 'success';

/** Words & syllables for listen-then-repeat games */
export const LISTEN_WORD_POOL: SeqCue[] = [
  SEQ_MA,
  SEQ_PA,
  SEQ_BA,
  WORD_MORE,
  WORD_BALL,
  SYLLABLE_MAMA,
  SEQ_MOO,
];

export function playListenThenSay(cue: SeqCue, onChildTurn: () => void, gapMs = 450) {
  playSoundSequence([cue], onChildTurn, gapMs);
}

export type MouthTarget = {
  label: string;
  speak: string;
  words: string[];
  mouthEmoji: string;
  vowelShape: 'A' | 'E' | 'O';
  mode: 'burst' | 'hold';
};

export const MOUTH_TARGETS: MouthTarget[] = [
  {
    label: 'Ahh',
    speak: 'Ahh',
    words: ['ah', 'aaa', 'a', 'ma'],
    mouthEmoji: '😮',
    vowelShape: 'A',
    mode: 'hold',
  },
  {
    label: 'Eee',
    speak: 'Eee',
    words: ['ee', 'eee', 'e'],
    mouthEmoji: '😁',
    vowelShape: 'E',
    mode: 'hold',
  },
  {
    label: 'Ooo',
    speak: 'Ooo',
    words: ['oo', 'ooo', 'o', 'moo'],
    mouthEmoji: '😗',
    vowelShape: 'O',
    mode: 'hold',
  },
  {
    label: 'Ma',
    speak: 'Ma',
    words: ['ma', 'mah', 'mama'],
    mouthEmoji: '👄',
    vowelShape: 'A',
    mode: 'burst',
  },
];

export function tickMouthAndSoundMatch(
  target: MouthTarget,
  sense: VowelSense | null,
  voice: { level: number; active: boolean },
  speech: { useSpeech: boolean; consumeHit: () => boolean },
  burst: { tick: (l: number, a: boolean) => boolean },
  soundHoldRef: React.MutableRefObject<number | null>,
  mouthHoldRef: React.MutableRefObject<number | null>,
  soundHoldMs = 850,
): { progress: number; matched: boolean } {
  const cue: SyllableCue = {
    label: target.label,
    speak: target.speak,
    words: target.words,
    mode: target.mode,
  };
  const sound = tickSyllableMatch(
    cue,
    voice,
    speech,
    burst,
    soundHoldRef,
    target.mode === 'burst' ? 650 : soundHoldMs,
  );
  const useCamera = Platform.OS === 'web' && sense?.isDetecting;
  if (!useCamera || !sense) return sound;

  const mouth = vowelMatch(sense, target.vowelShape, soundHoldMs, mouthHoldRef);
  return {
    progress: (sound.progress + mouth.progress) / 2,
    matched: sound.matched && mouth.matched,
  };
}

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

export function useAnimalSoundSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  return useVoiceGameSession(gameId, rounds);
}

export type SoundCue = {
  id: string;
  label: string;
  speak: string;
  emoji: string;
  words: string[];
  /** hold = moo/vroom; fricative = sss (softer continuous); burst = choo */
  mode: 'hold' | 'fricative' | 'burst';
};

export const SOUND_MOO: SoundCue = {
  id: 'cow',
  label: 'Moo',
  speak: 'Moooo',
  emoji: '🐄',
  words: ['moo', 'mu', 'moon'],
  mode: 'hold',
};

export const SOUND_VROOM: SoundCue = {
  id: 'car',
  label: 'Vroom',
  speak: 'Vroom',
  emoji: '🚗',
  words: ['vroom', 'vrroom', 'room', 'rum'],
  mode: 'hold',
};

export const SOUND_HISS: SoundCue = {
  id: 'snake',
  label: 'Sss',
  speak: 'Sssss',
  emoji: '🐍',
  words: ['ss', 'hiss', 'snake', 'sss'],
  mode: 'fricative',
};

export const SOUND_CHOO: SoundCue = {
  id: 'train',
  label: 'Choo Choo',
  speak: 'Choo choo',
  emoji: '🚂',
  words: ['choo', 'chu', 'train', 'choo choo'],
  mode: 'burst',
};

export const MATCH_ANIMALS: SoundCue[] = [
  SOUND_MOO,
  SOUND_VROOM,
  SOUND_HISS,
  SOUND_CHOO,
  {
    id: 'dog',
    label: 'Woof',
    speak: 'Woof woof',
    emoji: '🐕',
    words: ['woof', 'bow', 'bow wow', 'dog'],
    mode: 'burst',
  },
];

export function tickSoundMatch(
  cue: SoundCue,
  voice: { level: number; active: boolean },
  speech: { useSpeech: boolean; consumeHit: () => boolean },
  burst: { tick: (l: number, a: boolean) => boolean },
  holdRef: React.MutableRefObject<number | null>,
  holdMs = 900,
): { progress: number; matched: boolean } {
  if (speech.useSpeech && speech.consumeHit()) {
    return { progress: 1, matched: true };
  }
  if (cue.mode === 'burst') {
    if (burst.tick(voice.level, voice.active)) return { progress: 1, matched: true };
    return { progress: 0, matched: false };
  }
  const minLevel =
    cue.mode === 'fricative' ? Math.max(0.12, VOICE_ACTIVE_THRESHOLD - 0.08) : VOICE_ACTIVE_THRESHOLD;
  const { progress, done } = sustainedVoice(voice.level, voice.active, holdMs, holdRef, minLevel);
  return { progress, matched: done };
}

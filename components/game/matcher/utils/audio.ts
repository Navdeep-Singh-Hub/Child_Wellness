// Audio utilities for The Matcher games
import { speak, stopTTS, clearScheduledSpeech } from '@/utils/tts';
import { Audio as ExpoAudio } from 'expo-av';
import { Platform } from 'react-native';

// Sound effect URLs
const SOUNDS = {
  correct: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
  incorrect: 'https://actions.google.com/sounds/v1/cartoon/boing.ogg',
  celebration: 'https://actions.google.com/sounds/v1/cartoon/success.ogg',
  click: 'https://actions.google.com/sounds/v1/cartoon/click.ogg',
};

// Phoneme to word mapping for pronunciation
const PHONEME_WORDS: Record<string, string> = {
  '/b/': 'buh',
  '/p/': 'puh',
  '/m/': 'muh',
  '/d/': 'duh',
  '/t/': 'tuh',
  '/n/': 'nuh',
  '/k/': 'kuh',
  '/g/': 'guh',
  '/f/': 'fuh',
  '/v/': 'vuh',
  '/s/': 'sss',
  '/z/': 'zzz',
  '/l/': 'luh',
  '/r/': 'ruh',
  '/w/': 'wuh',
  '/h/': 'huh',
  '/j/': 'juh',
  '/ch/': 'chuh',
  '/sh/': 'shh',
  '/th/': 'thuh',
  '/a/': 'ah',
  '/e/': 'eh',
  '/i/': 'ih',
  '/o/': 'oh',
  '/u/': 'uh',
};

let soundCache: Map<string, ExpoAudio.Sound> = new Map();

export async function playSoundEffect(type: 'correct' | 'incorrect' | 'celebration' | 'click'): Promise<void> {
  try {
    const uri = SOUNDS[type];
    
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).Audio) {
      const WebAudio = (window as any).Audio;
      const webSound = new WebAudio(uri);
      webSound.volume = type === 'celebration' ? 0.5 : 0.3;
      webSound.play().catch(() => {});
      return;
    }

    let sound = soundCache.get(uri);
    if (!sound) {
      const { sound: newSound } = await ExpoAudio.Sound.createAsync(
        { uri },
        { volume: type === 'celebration' ? 0.5 : 0.3, shouldPlay: false }
      );
      sound = newSound;
      soundCache.set(uri, sound);
    }

    await sound.replayAsync();
  } catch (error) {
    console.warn(`[Audio] Failed to play ${type} sound:`, error);
  }
}

export async function playPhoneme(phoneme: string): Promise<void> {
  // speak() already calls stopTTS() internally, so we don't need to stop here
  const normalized = phoneme.toLowerCase().trim();
  const word = PHONEME_WORDS[normalized] || PHONEME_WORDS[`/${normalized}/`] || normalized.replace(/[\/]/g, '');
  await speak(word, 0.6);
}

export async function playLetterSound(letter: string): Promise<void> {
  // speak() already calls stopTTS() internally, so we don't need to stop here
  const phoneme = `/${letter.toLowerCase()}/`;
  await playPhoneme(phoneme);
}

export async function playWord(word: string): Promise<void> {
  // speak() already calls stopTTS() internally, so we don't need to stop here
  await speak(word, 0.75);
}

export function stopAllAudio(): void {
  // Clear all scheduled speech first
  clearScheduledSpeech();
  // Stop TTS
  stopTTS();
  // Clear sound cache
  soundCache.forEach((sound) => {
    sound.unloadAsync().catch(() => {});
  });
  soundCache.clear();
}

export function speakFeedback(isCorrect: boolean): void {
  if (isCorrect) {
    speak('Great job!', 0.8);
    playSoundEffect('correct');
  } else {
    speak('Try again!', 0.8);
    playSoundEffect('incorrect');
  }
}

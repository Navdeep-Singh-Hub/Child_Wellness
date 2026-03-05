// Audio utilities for The Builder games
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { stopTTS } from '@/utils/tts';

let soundEffects: { [key: string]: Audio.Sound } = {};

// Initialize sound effects
export async function initializeAudio() {
  try {
    // Success sound
    const { sound: successSound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/success.mp3')
    );
    soundEffects.success = successSound;

    // Error sound (gentle)
    const { sound: errorSound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/error.mp3')
    );
    soundEffects.error = errorSound;

    // Celebration sound
    const { sound: celebrationSound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/celebration.mp3')
    );
    soundEffects.celebration = celebrationSound;
  } catch (error) {
    console.warn('[Builder Audio] Could not load sound effects:', error);
  }
}

// Play sound effect
export async function playSoundEffect(type: 'success' | 'error' | 'celebration') {
  try {
    const sound = soundEffects[type];
    if (sound) {
      await sound.replayAsync();
    }
  } catch (error) {
    console.warn(`[Builder Audio] Could not play ${type} sound:`, error);
  }
}

// Phoneme to word mapping for pronunciation
const PHONEME_WORDS: Record<string, string> = {
  '/b/': 'buh',
  '/p/': 'puh',
  '/m/': 'muh',
  '/d/': 'duh',
  '/t/': 'tuh',
  '/n/': 'nuh',
  '/k/': 'kuh',
  '/c/': 'kuh',
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

// Speak phoneme
export async function speakPhoneme(phoneme: string) {
  try {
    stopTTS();
    await Speech.speak(phoneme, {
      language: 'en-US',
      pitch: 1.2,
      rate: 0.7,
    });
  } catch (error) {
    console.warn('[Builder Audio] Could not speak phoneme:', error);
  }
}

// Play phoneme (with word mapping like Matcher)
export async function playPhoneme(phoneme: string) {
  try {
    stopTTS();
    const normalized = phoneme.toLowerCase().trim();
    const word = PHONEME_WORDS[normalized] || PHONEME_WORDS[`/${normalized}/`] || normalized.replace(/[\/]/g, '');
    await Speech.speak(word, {
      language: 'en-US',
      pitch: 1.2,
      rate: 0.7,
    });
  } catch (error) {
    console.warn('[Builder Audio] Could not play phoneme:', error);
  }
}

// Speak letter sound
export async function speakLetterSound(letter: string) {
  try {
    stopTTS();
    const sound = letter.toLowerCase();
    await Speech.speak(sound, {
      language: 'en-US',
      pitch: 1.2,
      rate: 0.7,
    });
  } catch (error) {
    console.warn('[Builder Audio] Could not speak letter sound:', error);
  }
}

// Play letter sound (converts letter to phoneme and plays it)
export async function playLetterSound(letter: string): Promise<void> {
  // stopTTS() is already called in playPhoneme, so we don't need to stop here
  const phoneme = `/${letter.toLowerCase()}/`;
  await playPhoneme(phoneme);
}

// Speak word
export async function speakWord(word: string) {
  try {
    stopTTS();
    await Speech.speak(word, {
      language: 'en-US',
      pitch: 1.1,
      rate: 0.8,
    });
  } catch (error) {
    console.warn('[Builder Audio] Could not speak word:', error);
  }
}

// Speak feedback
export async function speakFeedback(message: string) {
  try {
    stopTTS();
    await Speech.speak(message, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.75,
    });
  } catch (error) {
    console.warn('[Builder Audio] Could not speak feedback:', error);
  }
}

// Stop all audio
export async function stopAllAudio() {
  try {
    stopTTS();
    // Stop all sound effects
    for (const sound of Object.values(soundEffects)) {
      try {
        await sound.stopAsync();
      } catch (e) {
        // Ignore errors
      }
    }
  } catch (error) {
    console.warn('[Builder Audio] Error stopping audio:', error);
  }
}

// Cleanup
export async function cleanupAudio() {
  await stopAllAudio();
  for (const sound of Object.values(soundEffects)) {
    try {
      await sound.unloadAsync();
    } catch (e) {
      // Ignore errors
    }
  }
  soundEffects = {};
}

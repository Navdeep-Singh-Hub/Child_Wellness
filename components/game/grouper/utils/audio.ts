// Audio utilities for The Grouper games
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
    console.warn('[Grouper Audio] Could not load sound effects:', error);
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
    console.warn(`[Grouper Audio] Could not play ${type} sound:`, error);
  }
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
    console.warn('[Grouper Audio] Could not speak word:', error);
  }
}

// Speak word family ending
export async function speakFamilyEnding(family: string) {
  try {
    stopTTS();
    // Speak the ending sound (e.g., "at", "in", "un")
    const ending = family.replace('-', '');
    await Speech.speak(ending, {
      language: 'en-US',
      pitch: 1.2,
      rate: 0.7,
    });
  } catch (error) {
    console.warn('[Grouper Audio] Could not speak family ending:', error);
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
    console.warn('[Grouper Audio] Could not speak feedback:', error);
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
    console.warn('[Grouper Audio] Error stopping audio:', error);
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

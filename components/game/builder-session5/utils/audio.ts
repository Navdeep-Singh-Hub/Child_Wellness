// Audio utilities for The Builder Session 5 module
import { speak, stopTTS } from '@/utils/tts';
import { Audio as ExpoAudio } from 'expo-av';
import { Platform } from 'react-native';

const SOUNDS = {
  correct: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
  incorrect: 'https://actions.google.com/sounds/v1/cartoon/boing.ogg',
  celebration: 'https://actions.google.com/sounds/v1/cartoon/success.ogg',
  click: 'https://actions.google.com/sounds/v1/cartoon/click.ogg',
  letter: 'https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg',
};

let soundCache: Map<string, ExpoAudio.Sound> = new Map();

export async function playSoundEffect(type: 'correct' | 'incorrect' | 'celebration' | 'click' | 'letter'): Promise<void> {
  try {
    const soundUrl = SOUNDS[type];
    if (!soundUrl) return;

    // Check cache first
    if (soundCache.has(soundUrl)) {
      const sound = soundCache.get(soundUrl)!;
      try {
        await sound.replayAsync();
        return;
      } catch (e) {
        // If replay fails, continue to load new sound
      }
    }

    // Load and play new sound
    const { sound } = await ExpoAudio.Sound.createAsync(
      { uri: soundUrl },
      { shouldPlay: true, volume: 0.5 }
    );
    soundCache.set(soundUrl, sound);
  } catch (error) {
    console.warn('[Builder Session5 Audio] Error playing sound:', error);
  }
}

export async function speakLetter(letter: string): Promise<void> {
  try {
    await speak(letter, { rate: 0.8 });
  } catch (error) {
    console.warn('[Builder Session5 Audio] Error speaking letter:', error);
  }
}

export async function speakWord(word: string): Promise<void> {
  try {
    await speak(`This spells ${word}`, { rate: 0.8 });
  } catch (error) {
    console.warn('[Builder Session5 Audio] Error speaking word:', error);
  }
}

export async function speakInstruction(instruction: string): Promise<void> {
  try {
    await speak(instruction, { rate: 0.8 });
  } catch (error) {
    console.warn('[Builder Session5 Audio] Error speaking instruction:', error);
  }
}

export async function speakFeedback(message: string): Promise<void> {
  try {
    await speak(message, { rate: 0.8 });
  } catch (error) {
    console.warn('[Builder Session5 Audio] Error speaking feedback:', error);
  }
}

export async function stopAllAudio(): Promise<void> {
  try {
    stopTTS();
    for (const sound of soundCache.values()) {
      try {
        await sound.stopAsync();
      } catch (e) {
        // Ignore errors
      }
    }
  } catch (error) {
    console.warn('[Builder Session5 Audio] Error stopping audio:', error);
  }
}

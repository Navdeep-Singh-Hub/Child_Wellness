// Audio utilities for The Logic Lab games
import { speak, stopTTS } from '@/utils/tts';
import { Audio as ExpoAudio } from 'expo-av';
import { Platform } from 'react-native';

// Sound effect URLs
const SOUNDS = {
  correct: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
  incorrect: 'https://actions.google.com/sounds/v1/cartoon/boing.ogg',
  celebration: 'https://actions.google.com/sounds/v1/cartoon/success.ogg',
  click: 'https://actions.google.com/sounds/v1/cartoon/click.ogg',
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
    console.warn(`[Logic Lab Audio] Failed to play ${type} sound:`, error);
  }
}

// Speak instruction
export async function speakInstruction(instruction: string): Promise<void> {
  try {
    stopTTS();
    await speak(instruction, 0.75);
  } catch (error) {
    console.warn('[Logic Lab Audio] Could not speak instruction:', error);
  }
}

// Speak preposition
export async function speakPreposition(preposition: string): Promise<void> {
  try {
    stopTTS();
    await speak(preposition, 0.75);
  } catch (error) {
    console.warn('[Logic Lab Audio] Could not speak preposition:', error);
  }
}

// Speak feedback
export async function speakFeedback(message: string): Promise<void> {
  try {
    stopTTS();
    await speak(message, 0.75);
  } catch (error) {
    console.warn('[Logic Lab Audio] Could not speak feedback:', error);
  }
}

// Stop all audio
export async function stopAllAudio(): Promise<void> {
  try {
    stopTTS();
    // Stop all sound effects
    for (const sound of soundCache.values()) {
      try {
        await sound.stopAsync();
      } catch (e) {
        // Ignore errors
      }
    }
  } catch (error) {
    console.warn('[Logic Lab Audio] Error stopping audio:', error);
  }
}

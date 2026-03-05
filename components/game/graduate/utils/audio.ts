// Audio utilities for The Graduate games
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
    console.warn(`[Graduate Audio] Failed to play ${type} sound:`, error);
  }
}

// Speak story
export async function speakStory(storyParts: string[]): Promise<void> {
  try {
    stopTTS();
    for (const part of storyParts) {
      await speak(part, 0.75);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.warn('[Graduate Audio] Could not speak story:', error);
  }
}

// Speak dialogue
export async function speakDialogue(dialogue: string): Promise<void> {
  try {
    stopTTS();
    await speak(dialogue, 0.75);
  } catch (error) {
    console.warn('[Graduate Audio] Could not speak dialogue:', error);
  }
}

// Speak word problem
export async function speakWordProblem(problem: string): Promise<void> {
  try {
    stopTTS();
    await speak(problem, 0.75);
  } catch (error) {
    console.warn('[Graduate Audio] Could not speak word problem:', error);
  }
}

// Speak question
export async function speakQuestion(question: string): Promise<void> {
  try {
    stopTTS();
    await speak(question, 0.75);
  } catch (error) {
    console.warn('[Graduate Audio] Could not speak question:', error);
  }
}

// Speak feedback
export async function speakFeedback(message: string): Promise<void> {
  try {
    stopTTS();
    await speak(message, 0.75);
  } catch (error) {
    console.warn('[Graduate Audio] Could not speak feedback:', error);
  }
}

// Speak number
export async function speakNumber(number: number): Promise<void> {
  try {
    stopTTS();
    const numberWords: Record<number, string> = {
      1: 'one',
      2: 'two',
      3: 'three',
      4: 'four',
      5: 'five',
      6: 'six',
      7: 'seven',
      8: 'eight',
      9: 'nine',
      10: 'ten',
    };
    await speak(numberWords[number] || number.toString(), 0.75);
  } catch (error) {
    console.warn('[Graduate Audio] Could not speak number:', error);
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
    console.warn('[Graduate Audio] Error stopping audio:', error);
  }
}

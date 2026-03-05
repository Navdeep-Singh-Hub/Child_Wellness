// Audio utilities for The Clockwise games
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
    console.warn(`[Clockwise Audio] Failed to play ${type} sound:`, error);
  }
}

// Speak sentence
export async function speakSentence(sentence: string): Promise<void> {
  try {
    stopTTS();
    await speak(sentence, 0.75);
  } catch (error) {
    console.warn('[Clockwise Audio] Could not speak sentence:', error);
  }
}

// Speak story
export async function speakStory(story: string[]): Promise<void> {
  try {
    stopTTS();
    for (const line of story) {
      await speak(line, 0.75);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.warn('[Clockwise Audio] Could not speak story:', error);
  }
}

// Speak question
export async function speakQuestion(question: string): Promise<void> {
  try {
    stopTTS();
    await speak(question, 0.75);
  } catch (error) {
    console.warn('[Clockwise Audio] Could not speak question:', error);
  }
}

// Speak clock time
export async function speakClockTime(hour: number): Promise<void> {
  try {
    stopTTS();
    const timeWords: Record<number, string> = {
      1: 'One o\'clock',
      2: 'Two o\'clock',
      3: 'Three o\'clock',
      4: 'Four o\'clock',
      5: 'Five o\'clock',
      6: 'Six o\'clock',
      7: 'Seven o\'clock',
      8: 'Eight o\'clock',
      9: 'Nine o\'clock',
      10: 'Ten o\'clock',
      11: 'Eleven o\'clock',
      12: 'Twelve o\'clock',
    };
    await speak(timeWords[hour] || `${hour} o'clock`, 0.75);
  } catch (error) {
    console.warn('[Clockwise Audio] Could not speak clock time:', error);
  }
}

// Speak instruction
export async function speakInstruction(instruction: string): Promise<void> {
  try {
    stopTTS();
    await speak(instruction, 0.75);
  } catch (error) {
    console.warn('[Clockwise Audio] Could not speak instruction:', error);
  }
}

// Speak feedback
export async function speakFeedback(message: string): Promise<void> {
  try {
    stopTTS();
    await speak(message, 0.75);
  } catch (error) {
    console.warn('[Clockwise Audio] Could not speak feedback:', error);
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
    console.warn('[Clockwise Audio] Error stopping audio:', error);
  }
}

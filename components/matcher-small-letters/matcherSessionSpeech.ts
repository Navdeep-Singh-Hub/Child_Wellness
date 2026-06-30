import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

const TTS_RATE = 0.78;

export function speakMatcherHint(text: string) {
  try {
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = TTS_RATE;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    } else {
      Speech.speak(text, { rate: TTS_RATE, pitch: 1.05 });
    }
  } catch {
    /* ignore */
  }
}

export function speakLetter(letter: string) {
  speakMatcherHint(`This is the letter ${letter}. ${letter}.`);
}

export function stopMatcherSpeech() {
  try {
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  } catch {
    /* ignore */
  }
}

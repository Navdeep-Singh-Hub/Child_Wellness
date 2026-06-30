import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

const TTS_RATE = 0.78;

export function speakCounterHint(text: string) {
  try {
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = TTS_RATE;
      u.pitch = 1.02;
      window.speechSynthesis.speak(u);
    } else {
      Speech.speak(text, { rate: TTS_RATE, pitch: 1.02 });
    }
  } catch {
    /* ignore */
  }
}

export function speakCounterWord(word: string) {
  speakCounterHint(word);
}

export function stopCounterSpeech() {
  try {
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  } catch {
    /* ignore */
  }
}

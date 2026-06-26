import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

const TTS_RATE = 0.72;

export function speakGripHint(text: string) {
  try {
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = TTS_RATE;
      window.speechSynthesis.speak(u);
    } else {
      Speech.speak(text, { rate: TTS_RATE });
    }
  } catch {
    /* ignore */
  }
}

export function stopGripSpeech() {
  try {
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  } catch {
    /* ignore */
  }
}

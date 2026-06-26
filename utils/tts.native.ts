/**
 * Native TTS utility.
 *
 * Keep this separate from utils/tts.ts so Android/iOS production bundles do not
 * include the web-only speech-to-speech package, which depends on Node modules.
 */

import { configurePlaybackAudio } from '@/utils/configureAppAudio';
import * as Speech from 'expo-speech';

export const DEFAULT_TTS_RATE = 0.75;

let scheduledSpeechTimers: ReturnType<typeof setTimeout>[] = [];

export type SpeakOptions = {
  /** When true, do not stop current speech (e.g. stretched AAC phrases). */
  skipStop?: boolean;
};

export function stopTTS(): void {
  try {
    scheduledSpeechTimers.forEach((timer) => clearTimeout(timer));
    scheduledSpeechTimers = [];
    Speech.stop();
  } catch (e) {
    console.warn('[TTS] Error stopping native TTS:', e);
  }
}

export function clearScheduledSpeech(): void {
  scheduledSpeechTimers.forEach((timer) => clearTimeout(timer));
  scheduledSpeechTimers = [];
  stopTTS();
}

export async function speak(
  text: string,
  rate: number = DEFAULT_TTS_RATE,
  language?: string,
  options?: SpeakOptions,
): Promise<void> {
  if (!text || text.trim().length === 0) return;

  try {
    if (!options?.skipStop) {
      stopTTS();
    } else {
      scheduledSpeechTimers.forEach((timer) => clearTimeout(timer));
      scheduledSpeechTimers = [];
    }

    await configurePlaybackAudio();

    const safeRate = Math.max(0.4, Math.min(1.5, Number.isFinite(rate) ? rate : DEFAULT_TTS_RATE));
    await new Promise<void>((resolve) => {
      Speech.speak(text, {
        language,
        rate: safeRate,
        pitch: 1.02,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
    });
  } catch (e) {
    console.warn('[TTS] native speak error:', e);
  }
}

export function speakSequence(
  texts: string[],
  rate: number = DEFAULT_TTS_RATE,
  gapMs: number = 450,
): void {
  try {
    clearScheduledSpeech();
    if (!texts || texts.length === 0) return;

    void speak(texts[0], rate);

    for (let i = 1; i < texts.length; i += 1) {
      const timer = setTimeout(() => {
        void speak(texts[i], rate);
      }, gapMs * i);
      scheduledSpeechTimers.push(timer);
    }
  } catch (e) {
    console.warn('[TTS] native speakSequence error:', e);
  }
}

export async function cleanupTTS(): Promise<void> {
  stopTTS();
}

export async function preInitializeTTS(): Promise<void> {
  await configurePlaybackAudio();
}

export async function activateWebTTS(callback?: () => void): Promise<void> {
  await configurePlaybackAudio();
  callback?.();
}

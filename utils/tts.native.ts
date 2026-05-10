/**
 * Native TTS utility.
 *
 * Keep this separate from utils/tts.ts so Android/iOS production bundles do not
 * include the web-only speech-to-speech package, which depends on Node modules.
 */

import * as Speech from 'expo-speech';

export const DEFAULT_TTS_RATE = 0.75;

let scheduledSpeechTimers: ReturnType<typeof setTimeout>[] = [];
let speechOp: Promise<void> = Promise.resolve();

export function stopTTS(): void {
  try {
    scheduledSpeechTimers.forEach((timer) => clearTimeout(timer));
    scheduledSpeechTimers = [];
    speechOp = speechOp
      .catch(() => undefined)
      .then(() => Speech.stop())
      .catch((e) => {
        console.warn('[TTS] Error stopping native TTS:', e);
      });
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
): Promise<void> {
  if (!text || text.trim().length === 0) return;

  try {
    const safeRate = Math.max(0.4, Math.min(1.5, Number.isFinite(rate) ? rate : DEFAULT_TTS_RATE));
    speechOp = speechOp
      .catch(() => undefined)
      .then(async () => {
        await Speech.stop().catch(() => undefined);
        Speech.speak(text, {
          language,
          rate: safeRate,
          pitch: 1.02,
        });
      });
    await speechOp;
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

    speak(texts[0], rate);

    for (let i = 1; i < texts.length; i += 1) {
      const timer = setTimeout(() => {
        speak(texts[i], rate);
      }, gapMs * i);
      scheduledSpeechTimers.push(timer);
    }
  } catch (e) {
    console.warn('[TTS] native speakSequence error:', e);
  }
}

export async function cleanupTTS(): Promise<void> {
  stopTTS();
  await speechOp.catch(() => undefined);
}

export async function preInitializeTTS(): Promise<void> {
  // expo-speech does not need explicit native initialization.
}

export async function activateWebTTS(callback?: () => void): Promise<void> {
  callback?.();
}

import { Audio as ExpoAudio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { clearScheduledSpeech } from '@/utils/tts';

const HANDOFF_MS = Platform.OS === 'android' ? 500 : 200;

/**
 * Stop TTS/scheduled speech and configure the OS audio session for mic metering.
 */
export async function releaseAudioForMic(): Promise<void> {
  clearScheduledSpeech();

  if (Platform.OS === 'web') return;

  try {
    await Speech.stop();
  } catch {
    /* ignore */
  }

  await new Promise((resolve) => setTimeout(resolve, HANDOFF_MS));

  try {
    await ExpoAudio.setIsEnabledAsync(true);
  } catch {
    /* ignore */
  }

  await ExpoAudio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  });
}

export { configurePlaybackAudio, restoreAudioForPlayback } from '@/utils/configureAppAudio';

/**
 * Shared playback audio session for native (expo-av SFX + reliable TTS handoff).
 * Voice games switch to recording mode via releaseAudioForMic(); always restore here after.
 */
import { Audio as ExpoAudio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Platform } from 'react-native';

let playbackConfigured = false;
let configurePromise: Promise<void> | null = null;

export function isPlaybackAudioConfigured(): boolean {
  return playbackConfigured;
}

/** Configure OS audio session for game playback (SFX + speech). Safe to call repeatedly. */
export async function configurePlaybackAudio(force = false): Promise<void> {
  if (Platform.OS === 'web') return;
  if (playbackConfigured && !force) return;
  if (configurePromise) return configurePromise;

  configurePromise = (async () => {
    try {
      await ExpoAudio.setIsEnabledAsync(true);
      await ExpoAudio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      });
      playbackConfigured = true;
    } catch (e) {
      console.warn('[Audio] configurePlaybackAudio failed:', e);
      playbackConfigured = false;
    } finally {
      configurePromise = null;
    }
  })();

  return configurePromise;
}

/** Alias used after microphone metering stops. */
export const restoreAudioForPlayback = configurePlaybackAudio;

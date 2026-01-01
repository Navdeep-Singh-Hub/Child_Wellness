/**
 * Success Sound Utility
 * Plays success sound for round completions across platforms
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const SUCCESS_SOUND = require('@/assets/sounds/successed-295058.mp3');

let soundInstance: Audio.Sound | null = null;
let isInitialized = false;

/**
 * Initialize and play success sound
 * Works on both native and web platforms
 */
export async function playSuccessSound(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Web: Use expo-av which works on web too
      try {
        // Unload previous instance if exists
        if (soundInstance) {
          try {
            await soundInstance.unloadAsync();
          } catch {
            // Ignore errors
          }
        }

        // Load and play new sound
        const { sound } = await Audio.Sound.createAsync(SUCCESS_SOUND, {
          volume: 0.6,
          shouldPlay: true,
        });

        soundInstance = sound;

        // Clean up after sound finishes
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            soundInstance = null;
          }
        });
      } catch (webError) {
        // If expo-av fails on web, silently continue (sound is optional)
        console.warn('Web audio failed, continuing without sound:', webError);
      }
    } else {
      // Native: Use expo-av
      if (!isInitialized) {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        isInitialized = true;
      }

      // Unload previous instance if exists
      if (soundInstance) {
        try {
          await soundInstance.unloadAsync();
        } catch {
          // Ignore errors
        }
      }

      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(SUCCESS_SOUND, {
        volume: 0.6,
        shouldPlay: true,
      });

      soundInstance = sound;

      // Clean up after sound finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          soundInstance = null;
        }
      });
    }
  } catch (error) {
    // Silently fail - don't break game if sound doesn't play
    console.warn('Failed to play success sound:', error);
  }
}

/**
 * Cleanup function - call on app unmount
 */
export async function cleanupSuccessSound(): Promise<void> {
  if (soundInstance) {
    try {
      await soundInstance.unloadAsync();
      soundInstance = null;
    } catch {
      // Ignore errors
    }
  }
}


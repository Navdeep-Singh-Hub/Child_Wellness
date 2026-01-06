// Shared sound player utility for Session 3 games
import { Audio as ExpoAudio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { getSoundAsset, SOUND_MAP } from './soundAssets';

// Sound cache
const soundRefs = new Map<string, ExpoAudio.Sound | HTMLAudioElement>();

export const playSound = async (
  soundKey: keyof typeof SOUND_MAP,
  volume: number = 1.0,
  rate: number = 1.0
) => {
  const assetKey = SOUND_MAP[soundKey];
  if (!assetKey) {
    console.warn('Sound key not found in map:', soundKey);
    return;
  }

  const soundAsset = getSoundAsset(assetKey as any);
  if (!soundAsset) {
    console.warn('Sound asset not found:', soundKey);
    return;
  }

  try {
    if (Platform.OS === 'web') {
      // Web: Use HTML5 Audio - create new instance each time
      const audio = new Audio();
      // For web, we need to get the actual URI from the require
      const audioSrc = typeof soundAsset === 'string' 
        ? soundAsset 
        : (soundAsset as any).default || (soundAsset as any).uri || '';
      audio.src = audioSrc;
      audio.volume = Math.max(0, Math.min(1, volume)); // Clamp volume
      audio.playbackRate = Math.max(0.5, Math.min(2, rate)); // Clamp rate
      audio.play().catch((e) => console.warn('Web audio play error:', e));
    } else {
      // Native: Use expo-av
      let sound = soundRefs.get(assetKey) as ExpoAudio.Sound | undefined;
      
      if (!sound) {
        const { sound: newSound } = await ExpoAudio.Sound.createAsync(
          soundAsset,
          { volume: Math.max(0, Math.min(1, volume)), shouldPlay: false, rate: Math.max(0.5, Math.min(2, rate)) }
        );
        sound = newSound;
        soundRefs.set(assetKey, sound);
      } else {
        await sound.setRateAsync(Math.max(0.5, Math.min(2, rate)), true);
        await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
      
      await sound.replayAsync();
    }
  } catch (e) {
    console.warn('Error playing sound:', soundKey, e);
  }
};

// Cleanup function
export const cleanupSounds = () => {
  soundRefs.forEach((sound) => {
    if (Platform.OS !== 'web' && sound instanceof ExpoAudio.Sound) {
      sound.unloadAsync().catch(() => {});
    }
  });
  soundRefs.clear();
};

// Aggressively stop all TTS speech
export const stopAllSpeech = () => {
  try {
    // Call stop multiple times to ensure it stops
    Speech.stop();
    Speech.stop();
    Speech.stop();
    // Also try to stop after a small delay in case speech is queued
    setTimeout(() => {
      try {
        Speech.stop();
        Speech.stop();
      } catch (e) {
        // Ignore errors
      }
    }, 10);
  } catch (e) {
    // Ignore errors
  }
};






























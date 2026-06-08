// Shared sound player utility for Session 3 games
import { Audio as ExpoAudio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { getSoundAsset, SOUND_MAP } from './soundAssets';

// Sound cache
const soundRefs = new Map<string, ExpoAudio.Sound | HTMLAudioElement>();
let audioReady = false;

const ensureAudioReady = async () => {
  if (audioReady) return;
  if (Platform.OS !== 'web') {
    try {
      await ExpoAudio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (e) {
      console.warn('Failed to set audio mode:', e);
    }
  }
  audioReady = true;
};

// Audio context unlocker for mobile browsers
let audioContextUnlocked = false;
const unlockAudioContext = () => {
  if (Platform.OS === 'web' && !audioContextUnlocked) {
    try {
      // Create a silent audio and play it to unlock audio context
      // This is required for mobile browsers to allow audio playback
      const unlockAudio = new Audio();
      unlockAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      unlockAudio.volume = 0.01;
      unlockAudio.play().then(() => {
        audioContextUnlocked = true;
      }).catch(() => {
        // If unlock fails, try again on next play
      });
    } catch (e) {
      // Ignore errors
    }
  }
};

// Unlock audio context on any user interaction (for mobile browsers)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const unlockOnInteraction = () => {
    unlockAudioContext();
    // Remove listeners after first unlock
    document.removeEventListener('touchstart', unlockOnInteraction);
    document.removeEventListener('click', unlockOnInteraction);
    document.removeEventListener('touchend', unlockOnInteraction);
  };
  document.addEventListener('touchstart', unlockOnInteraction, { once: true });
  document.addEventListener('click', unlockOnInteraction, { once: true });
  document.addEventListener('touchend', unlockOnInteraction, { once: true });
}

// Preload audio for web (mobile browsers need preloading)
const preloadedAudios = new Map<string, HTMLAudioElement>();

export const preloadSounds = async () => {
  await ensureAudioReady();

  if (Platform.OS === 'web') {
    unlockAudioContext();

    Object.keys(SOUND_MAP).forEach((soundKey) => {
      const assetKey = SOUND_MAP[soundKey as keyof typeof SOUND_MAP];
      const soundAsset = getSoundAsset(assetKey as any);
      if (soundAsset) {
        const audioSrc = typeof soundAsset === 'string'
          ? soundAsset
          : (soundAsset as any).default || (soundAsset as any).uri || '';

        if (audioSrc && !preloadedAudios.has(assetKey)) {
          const audio = new Audio();
          audio.src = audioSrc;
          audio.preload = 'auto';
          audio.volume = 0.01;
          audio.load();
          preloadedAudios.set(assetKey, audio);
        }
      }
    });
    return;
  }

  const uniqueAssets = new Set(Object.values(SOUND_MAP));
  await Promise.all(
    [...uniqueAssets].map(async (assetKey) => {
      if (soundRefs.has(assetKey)) return;
      const soundAsset = getSoundAsset(assetKey as any);
      if (!soundAsset) return;
      try {
        const { sound } = await ExpoAudio.Sound.createAsync(
          soundAsset,
          { volume: 1, shouldPlay: false },
        );
        soundRefs.set(assetKey, sound);
      } catch (e) {
        console.warn('Failed to preload sound:', assetKey, e);
      }
    }),
  );
};

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
    await ensureAudioReady();

    if (Platform.OS === 'web') {
      // Unlock audio context if not already unlocked
      unlockAudioContext();
      
      // Get or create preloaded audio
      let audio = preloadedAudios.get(assetKey);
      
      if (!audio) {
        // Fallback: create new audio if not preloaded
        audio = new Audio();
        const audioSrc = typeof soundAsset === 'string' 
          ? soundAsset 
          : (soundAsset as any).default || (soundAsset as any).uri || '';
        audio.src = audioSrc;
        audio.preload = 'auto';
        preloadedAudios.set(assetKey, audio);
      }
      
      // Clone the audio for immediate playback (allows overlapping sounds)
      const playAudio = audio.cloneNode() as HTMLAudioElement;
      playAudio.volume = Math.max(0, Math.min(1, volume)); // Clamp volume
      playAudio.playbackRate = Math.max(0.5, Math.min(2, rate)); // Clamp rate
      
      // Reset to start and play immediately
      playAudio.currentTime = 0;
      
      // Ensure audio is loaded before playing (critical for mobile)
      if (playAudio.readyState < 2) {
        // Audio not loaded yet, wait for it
        playAudio.addEventListener('canplaythrough', () => {
          playAudio.play().catch((e) => {
            console.warn('Web audio play error after load:', e);
            unlockAudioContext();
          });
        }, { once: true });
        playAudio.load();
      } else {
        // Audio already loaded, play immediately
        const playPromise = playAudio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn('Web audio play error:', e);
            // If play fails, try unlocking audio context again
            unlockAudioContext();
            // Retry once after a short delay
            setTimeout(() => {
              playAudio.play().catch(() => {});
            }, 50);
          });
        }
      }
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
      
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (e) {
    console.warn('Error playing sound:', soundKey, e);
  }
};

let loopingSoundRef: ExpoAudio.Sound | HTMLAudioElement | null = null;

export const playLoopingSound = async (
  soundKey: keyof typeof SOUND_MAP,
  volume: number = 0.7,
) => {
  const assetKey = SOUND_MAP[soundKey];
  const soundAsset = getSoundAsset(assetKey as any);
  if (!soundAsset) {
    console.warn('Looping sound asset not found:', soundKey);
    return;
  }

  await stopLoopingSound();
  await ensureAudioReady();

  try {
    if (Platform.OS === 'web') {
      unlockAudioContext();
      const audioSrc = typeof soundAsset === 'string'
        ? soundAsset
        : (soundAsset as any).default || (soundAsset as any).uri || '';
      const audio = new Audio();
      audio.src = audioSrc;
      audio.loop = true;
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.preload = 'auto';
      await audio.play();
      loopingSoundRef = audio;
    } else {
      const { sound } = await ExpoAudio.Sound.createAsync(
        soundAsset,
        { volume: Math.max(0, Math.min(1, volume)), shouldPlay: true, isLooping: true },
      );
      loopingSoundRef = sound;
    }
  } catch (e) {
    console.warn('Error playing looping sound:', soundKey, e);
    loopingSoundRef = null;
  }
};

export const stopLoopingSound = async () => {
  if (!loopingSoundRef) return;

  try {
    if (Platform.OS === 'web') {
      const audio = loopingSoundRef as HTMLAudioElement;
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    } else {
      const sound = loopingSoundRef as ExpoAudio.Sound;
      await sound.stopAsync();
      await sound.setIsLoopingAsync(false);
      await sound.unloadAsync();
    }
  } catch (e) {
    console.warn('Error stopping looping sound:', e);
  }

  loopingSoundRef = null;
};

// Cleanup function
export const cleanupSounds = () => {
  void stopLoopingSound();
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



































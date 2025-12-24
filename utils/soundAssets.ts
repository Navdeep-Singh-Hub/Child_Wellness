// Sound asset paths for Session 3 games
// Note: File names may have .mp3.mp3 extension - adjust paths if needed

// Import sound assets - using the actual file names from assets folder
const bellSound = require('@/assets/sounds/session3/bell.mp3.mp3');
const drumSound = require('@/assets/sounds/session3/drum.mp3');
const clapSound = require('@/assets/sounds/session3/clap.mp3');
const beepSound = require('@/assets/sounds/session3/beep.mp3.mp3');
const dogBarkSound = require('@/assets/sounds/session3/dog-bark.mp3.mp3');
const carBeepSound = require('@/assets/sounds/session3/car-beep.p3.mp3');
const waterSplashSound = require('@/assets/sounds/session3/water-splash.mp3.mp3');

export const SOUND_ASSETS = {
  // Game 1: Sound → Tap
  bell: bellSound,
  drum: drumSound,
  clap: clapSound,
  beep: beepSound,
  
  // Game 3: Find Sound Source
  'dog-bark': dogBarkSound,
  'car-beep': carBeepSound,
  'water-splash': waterSplashSound,
  
  // Game 4: Stop When Sound Stops (using beep as continuous)
  'beep-continuous': beepSound,
};

// Helper function to get sound asset
export const getSoundAsset = (soundName: keyof typeof SOUND_ASSETS) => {
  return SOUND_ASSETS[soundName] || null;
};

// Sound mapping for games
export const SOUND_MAP = {
  bell: 'bell',
  drum: 'drum',
  clap: 'clap',
  beep: 'beep',
  bark: 'dog-bark',
  'car-beep': 'car-beep',
  splash: 'water-splash',
  'water-splash': 'water-splash',
};

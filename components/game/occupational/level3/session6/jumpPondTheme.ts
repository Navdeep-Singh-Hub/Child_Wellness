/**
 * Leap Lily Pad Kingdom — OT Level 3 Session 6 theme tokens.
 */

export const POND_CHARACTERS = {
  freddy: { id: 'freddy', name: 'Freddy Frog', emoji: '🐸', color: '#22C55E' },
  hopper: { id: 'hopper', name: 'Hopper Bunny', emoji: '🐰', color: '#F472B6' },
  cricket: { id: 'cricket', name: 'Cricket Coach', emoji: '🦗', color: '#84CC16' },
  rocky: { id: 'rocky', name: 'Rocky Boulder', emoji: '🪨', color: '#78716C' },
  owl: { id: 'owl', name: 'Wise Owl Guide', emoji: '🦉', color: '#8B5CF6' },
} as const;

export const POND_GRADIENT: [string, string, string, string] = [
  '#ECFDF5',
  '#D1FAE5',
  '#6EE7B7',
  '#059669',
];

export const POND_SHELL = {
  gradient: POND_GRADIENT,
  backText: '#166534',
  backBorder: 'rgba(5,150,105,0.25)',
  titleColor: '#14532D',
  subtitleColor: '#15803D',
  statLabel: '#059669',
  statValue: '#14532D',
  statBorder: 'rgba(5,150,105,0.2)',
  playBorder: 'rgba(5,150,105,0.28)',
  playBg: 'rgba(255,255,255,0.42)',
  sparkleColor: '#34D399',
  accent: '#10B981',
  accentDark: '#047857',
  coinColor: '#F59E0B',
};

export const GAME_THEMES = {
  frogJump: {
    title: 'Leap Frog',
    subtitle: 'Help Freddy hop across lily pads!',
    emoji: '🐸',
    voiceIntro: 'Tap twice quickly to make Freddy jump!',
    voiceComplete: 'Amazing leaping! Pond champion!',
    congrats: 'Leap Frog Hero!',
    hintText: 'Tap tap to jump!',
  },
  jumpCount: {
    title: 'Two Jump',
    subtitle: 'Jump only when you see number 2!',
    emoji: '🔢',
    voiceIntro: 'Watch the numbers. Jump only on number 2!',
    voiceComplete: 'Great inhibition and counting!',
    congrats: 'Two Jump Star!',
    hintText: 'Jump on 2 only!',
  },
  doubleTapOnly: {
    title: 'Double Only',
    subtitle: 'Single taps are ignored — double tap to hop!',
    emoji: '👆',
    voiceIntro: 'Only double taps count! Single taps are ignored.',
    voiceComplete: 'Perfect double tap control!',
    congrats: 'Double Tap Pro!',
    hintText: 'Double tap only!',
  },
  rhythmJump: {
    title: 'Beat Jump',
    subtitle: 'Listen to tap-tap, then copy the rhythm!',
    emoji: '🎵',
    voiceIntro: 'Listen to the beat, then tap the same rhythm!',
    voiceComplete: 'Rhythm jump master!',
    congrats: 'Beat Jump Champion!',
    hintText: 'Copy the beat!',
  },
  obstacleJump: {
    title: 'Rock Hop',
    subtitle: 'Double tap to hop over the rock!',
    emoji: '🪨',
    voiceIntro: 'When the rock comes, double tap to hop over it!',
    voiceComplete: 'Rock hopping champion!',
    congrats: 'Rock Hop Ranger!',
    hintText: 'Hop the rock!',
  },
} as const;

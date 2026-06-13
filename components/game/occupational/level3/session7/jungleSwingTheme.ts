/**
 * Jungle Swing Adventure — OT Level 3 Session 7 theme tokens.
 */

export const JUNGLE_CHARACTERS = {
  milo: { id: 'milo', name: 'Milo Monkey', emoji: '🐵', color: '#F59E0B' },
  polly: { id: 'polly', name: 'Polly Parrot', emoji: '🦜', color: '#22C55E' },
  sammy: { id: 'sammy', name: 'Sammy Sloth', emoji: '🦥', color: '#84CC16' },
  captain: { id: 'captain', name: 'Captain Vine', emoji: '🪢', color: '#EF4444' },
  wizard: { id: 'wizard', name: 'Spin Wizard', emoji: '🌀', color: '#8B5CF6' },
} as const;

export const JUNGLE_GRADIENT: [string, string, string, string] = [
  '#ECFDF5',
  '#BBF7D0',
  '#4ADE80',
  '#15803D',
];

export const JUNGLE_SHELL = {
  gradient: JUNGLE_GRADIENT,
  backText: '#14532D',
  backBorder: 'rgba(21,128,61,0.25)',
  titleColor: '#14532D',
  subtitleColor: '#15803D',
  statLabel: '#16A34A',
  statValue: '#14532D',
  statBorder: 'rgba(22,163,74,0.2)',
  playBorder: 'rgba(22,163,74,0.28)',
  playBg: 'rgba(255,255,255,0.42)',
  sparkleColor: '#34D399',
  accent: '#22C55E',
  accentDark: '#15803D',
  coinColor: '#F59E0B',
};

export const GAME_THEMES = {
  pendulumCopy: {
    title: 'Copy Swing',
    subtitle: 'Watch the rope, then copy the side-to-side swing!',
    emoji: '🔄',
    voiceIntro: 'Watch the swing demo, then copy the same left-right motion!',
    voiceComplete: 'Awesome swing copying! Motion master!',
    congrats: 'Copy Swing Star!',
    hintText: '⬅️ ➡️ Copy the swing!',
  },
  monkeySwing: {
    title: 'Vine Swing',
    subtitle: 'Help Milo swing with diagonal vine swipes!',
    emoji: '🐵',
    voiceIntro: 'Swipe diagonally to help Milo swing between jungle vines!',
    voiceComplete: 'Amazing vine swinging!',
    congrats: 'Vine Swing Hero!',
    hintText: '↗️ ↘️ Diagonal swings!',
  },
  fanMotion: {
    title: 'Spin Flow',
    subtitle: 'Trace a full circle around the magic wheel!',
    emoji: '🌀',
    voiceIntro: 'Trace a smooth circle around the spinning object!',
    voiceComplete: 'Perfect circular motion!',
    congrats: 'Spin Flow Champion!',
    hintText: '🌀 Trace the circle!',
  },
  ropeTiming: {
    title: 'Peak Swipe',
    subtitle: 'Swipe when the rope reaches its highest point!',
    emoji: '🪢',
    voiceIntro: 'Watch the rope swing and swipe at the peak!',
    voiceComplete: 'Peak timing champion!',
    congrats: 'Peak Swipe Pro!',
    hintText: '⬆️ Swipe at the peak!',
  },
  musicSwing: {
    title: 'Beat Swing',
    subtitle: 'Swing left and right on every music beat!',
    emoji: '🎵',
    voiceIntro: 'Listen to the beats, then swing on each one!',
    voiceComplete: 'Rhythm swing master!',
    congrats: 'Beat Swing Star!',
    hintText: '🎵 Swing on the beat!',
  },
} as const;

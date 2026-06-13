/**
 * Giant vs Tiny Kingdom — OT Level 3 Session 2 theme tokens.
 */

export const KINGDOM_CHARACTERS = {
  gogo: { id: 'gogo', name: 'Gogo', role: 'Giant Dino', emoji: '🦖', color: '#16A34A' },
  mimi: { id: 'mimi', name: 'Mimi', role: 'Tiny Mouse', emoji: '🐭', color: '#A78BFA' },
  bobo: { id: 'bobo', name: 'Bobo', role: 'Balloon Wizard', emoji: '🎈', color: '#F97316' },
  king: { id: 'king', name: 'King Scale', role: 'Ruler', emoji: '🏰', color: '#EAB308' },
} as const;

export const KINGDOM_GRADIENT: [string, string, string, string] = [
  '#FFFBEB',
  '#FEF3C7',
  '#FCD34D',
  '#D97706',
];

export const KINGDOM_SHELL = {
  gradient: KINGDOM_GRADIENT,
  backText: '#92400E',
  backBorder: 'rgba(217,119,6,0.25)',
  titleColor: '#78350F',
  subtitleColor: '#B45309',
  statLabel: '#D97706',
  statValue: '#78350F',
  statBorder: 'rgba(217,119,6,0.2)',
  playBorder: 'rgba(217,119,6,0.3)',
  playBg: 'rgba(255,255,255,0.42)',
  sparkleColor: '#FBBF24',
  accent: '#F59E0B',
  accentDark: '#B45309',
  coinColor: '#F59E0B',
  giantColor: '#2563EB',
  tinyColor: '#EC4899',
  bigGlow: '#FDE047',
  smallGlow: '#C4B5FD',
};

export const GAME_THEMES = {
  tap: {
    title: 'Size Tap',
    subtitle: 'Gogo & Mimi need you to tap the right size!',
    emoji: '👆',
    voiceIntro: 'Tap the BIG circle when you hear BIG, and the SMALL circle when you hear SMALL!',
    voiceComplete: 'Fantastic size tapping! The kingdom celebrates!',
    congrats: 'Size Tap Hero!',
    hintText: 'Listen for BIG or SMALL, then tap the matching circle!',
    creature: '🦖',
  },
  swipe: {
    title: 'Swipe Scale',
    subtitle: 'Match your swipe size to King Scale\'s command!',
    emoji: '↔️',
    voiceIntro: 'Make a BIG swipe for giant moves, a SMALL swipe for tiny moves!',
    voiceComplete: 'Excellent swipe control! Great motor planning!',
    congrats: 'Swipe Scale Master!',
    hintText: 'Long swipe = BIG. Short swipe = SMALL.',
    creature: '🏰',
  },
  pinch: {
    title: 'Pinch & Stretch',
    subtitle: 'Help Bobo resize the magical dragon!',
    emoji: '🤏',
    voiceIntro: 'Stretch with two fingers to make the dragon BIG. Pinch to make it SMALL!',
    voiceComplete: 'Wonderful finger control! The dragon is happy!',
    congrats: 'Pinch & Stretch Pro!',
    hintText: 'Use two fingers — stretch BIG, pinch SMALL!',
    creature: '🐉',
    objectEmoji: '🐉',
  },
  throw: {
    title: 'Throw Range',
    subtitle: 'Control how far the ball flies!',
    emoji: '⚾',
    voiceIntro: 'Drag far for a BIG throw to the far basket. Drag short for a SMALL throw nearby!',
    voiceComplete: 'Great force control! Perfect throwing!',
    congrats: 'Throw Range Champion!',
    hintText: 'Drag the ball and release — power controls distance!',
    creature: '⚾',
    objectEmoji: '⚾',
  },
  path: {
    title: 'Road Trace',
    subtitle: 'Drive through wide and narrow kingdom roads!',
    emoji: '🛤️',
    voiceIntro: 'Trace the wide road or the narrow road. Stay on the path!',
    voiceComplete: 'Super tracing! The kingdom roads are restored!',
    congrats: 'Road Trace Ranger!',
    hintText: 'Follow the road from green start to red finish!',
    creature: '🚗',
  },
} as const;

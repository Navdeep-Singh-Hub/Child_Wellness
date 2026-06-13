/**
 * Adventure Road Kingdom — OT Level 3 Session 5 theme tokens.
 */

export const ROAD_CHARACTERS = {
  rocky: { id: 'rocky', name: 'Rocky Racer', emoji: '🚗', color: '#3B82F6' },
  dash: { id: 'dash', name: 'Dash the Dog', emoji: '🐕', color: '#F59E0B' },
  finn: { id: 'finn', name: 'Finn the Fox', emoji: '🦊', color: '#F97316' },
  bounce: { id: 'bounce', name: 'Bounce Ball', emoji: '⚽', color: '#22C55E' },
  owl: { id: 'owl', name: 'Wise Owl Guide', emoji: '🦉', color: '#8B5CF6' },
} as const;

export const ROAD_GRADIENT: [string, string, string, string] = [
  '#FFFBEB',
  '#FEF3C7',
  '#FDE68A',
  '#D97706',
];

export const ROAD_SHELL = {
  gradient: ROAD_GRADIENT,
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
  leftColor: '#3B82F6',
  rightColor: '#EF4444',
};

export const GAME_THEMES = {
  carTurn: {
    title: 'Road Turn',
    subtitle: 'Help Rocky Racer follow the winding road!',
    emoji: '🚗',
    voiceIntro: 'Swipe LEFT or RIGHT to keep the car on the road!',
    voiceComplete: 'Awesome driving! Road master!',
    congrats: 'Road Turn Champion!',
    hintText: 'Follow the road bend!',
  },
  arrowMatch: {
    title: 'Arrow Sync',
    subtitle: 'Swipe the same way the arrow points!',
    emoji: '⬅️',
    voiceIntro: 'Watch the arrow and swipe LEFT or RIGHT quickly!',
    voiceComplete: 'Perfect arrow sync!',
    congrats: 'Arrow Sync Star!',
    hintText: 'Match the arrow!',
  },
  animalRun: {
    title: 'Pet Dash',
    subtitle: 'Send Dash the Dog to the correct side!',
    emoji: '🐕',
    voiceIntro: 'Listen and send the pet LEFT or RIGHT!',
    voiceComplete: 'Great pet dashing!',
    congrats: 'Pet Dash Hero!',
    hintText: 'Send Dash the right way!',
  },
  mirrorSwipe: {
    title: 'Flip Side',
    subtitle: 'Mirror mode — swipe flips the direction!',
    emoji: '🪞',
    voiceIntro: 'In mirror mode, your swipe moves the object the opposite way!',
    voiceComplete: 'Amazing mirror mastery!',
    congrats: 'Flip Side Pro!',
    hintText: 'Think opposite!',
  },
  catchBall: {
    title: 'Quick Catch',
    subtitle: 'Catch balls from the correct side!',
    emoji: '⚽',
    voiceIntro: 'Catch balls from LEFT or RIGHT — swipe toward them!',
    voiceComplete: 'Quick catch champion!',
    congrats: 'Quick Catch Ranger!',
    hintText: 'Swipe toward the ball!',
  },
} as const;

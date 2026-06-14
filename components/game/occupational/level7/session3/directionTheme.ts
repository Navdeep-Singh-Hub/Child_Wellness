/**
 * OT Level 7 · Session 3 — "Direction Changes"
 * Compass-maze palette (deep teal → emerald → violet → gold).
 */

export type DirectionMode =
  | 'directionSwitch'
  | 'goLeftGoRight'
  | 'pirateTurnHunt'
  | 'turnAroundQuest'
  | 'followTheArrow';

export const DIRECTION_SHELL = {
  gradient: ['#042F2E', '#115E59', '#5B21B6', '#CA8A04'] as [string, string, string, string],
  backText: '#A7F3D0',
  backBorder: 'rgba(167,243,208,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#6EE7B7',
  statLabel: '#34D399',
  statValue: '#FEF3C7',
  statBorder: 'rgba(52,211,153,0.4)',
  stageBorder: 'rgba(52,211,153,0.45)',
  stageBg: 'rgba(4,47,46,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#6EE7B7',
} as const;

export type DirectionGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  collectible: string;
  trafficStyle?: boolean;
};

export const DIRECTION_GAME_THEMES: Record<DirectionMode, DirectionGameTheme> = {
  directionSwitch: {
    title: 'Direction Switch',
    subtitle: 'Follow magical arrows — instantly change direction when they switch!',
    emoji: '↔️',
    hero: '🧭',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.55)',
    hintText: 'Watch the arrow — shift or step the moment it changes!',
    voiceIntro: 'Magical maze ahead! Follow the arrows and switch direction instantly!',
    voiceComplete: 'You mastered every direction switch! Amazing adaptation!',
    congrats: 'Direction Switch Champion!',
    collectible: '✨',
  },
  goLeftGoRight: {
    title: 'Go Left Go Right',
    subtitle: 'Navigate the busy traffic — move left or right on the signal!',
    emoji: '🚦',
    hero: '🚗',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Green arrow left or right — move that way with balance!',
    voiceIntro: 'Traffic is busy! Go left or go right when the signal says so!',
    voiceComplete: 'Perfect traffic navigation! Great left-right control!',
    congrats: 'Traffic Navigator Hero!',
    collectible: '🚦',
    trafficStyle: true,
  },
  pirateTurnHunt: {
    title: 'Pirate Turn Hunt',
    subtitle: 'Search for hidden pirate treasure in every direction!',
    emoji: '🏴‍☠️',
    hero: '💰',
    accent: '#F59E0B',
    accentDeep: '#B45309',
    glow: 'rgba(245,158,11,0.55)',
    hintText: 'Treasure spotted! Turn and move toward it!',
    voiceIntro: 'Ahoy! Hunt for pirate treasure — turn and move each way!',
    voiceComplete: 'All treasure found! Bold pirate explorer!',
    congrats: 'Pirate Treasure Hunter!',
    collectible: '💎',
  },
  turnAroundQuest: {
    title: 'Turn Around Quest',
    subtitle: 'Explore the kingdom — perform 90° and 180° turns to find objects!',
    emoji: '🔄',
    hero: '🏰',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    hintText: 'Turn 90 degrees or all the way around — stay balanced!',
    voiceIntro: 'Kingdom quest! Turn ninety degrees and all the way around to discover hidden objects!',
    voiceComplete: 'Every turn completed! Royal explorer!',
    congrats: 'Turn Around Master!',
    collectible: '👑',
  },
  followTheArrow: {
    title: 'Follow The Arrow',
    subtitle: 'Follow the sequence of magical arrows in order!',
    emoji: '🎯',
    hero: '🏹',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.5)',
    hintText: 'Follow each arrow in sequence — plan your next move!',
    voiceIntro: 'Magical arrows guide the way! Follow every direction in order!',
    voiceComplete: 'Sequence complete! Master direction follower!',
    congrats: 'Arrow Sequence Champion!',
    collectible: '🎯',
  },
};

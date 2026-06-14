/**
 * OT Level 6 · Session 7 — "Aurora Twist (Trunk Rotation & Reaching)"
 * Visual tokens. A jewel-toned aurora palette (deep cyan-night → teal → violet →
 * magenta) — vivid and twisty, distinct from S1 violet, S2 forest, S3 navy,
 * S4 lagoon-teal, S5 sunset-magenta, S6 autumn-trail.
 */

export type RotateMode = 'applePicker' | 'pirateTreasure' | 'turnTouch' | 'crossBodyCatch' | 'twistingStarHunt';

export const AURORA_SHELL = {
  gradient: ['#083344', '#0E7490', '#7E22CE', '#DB2777'] as [string, string, string, string],
  backText: '#CFFAFE',
  backBorder: 'rgba(207,250,254,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#A5F3FC',
  statLabel: '#67E8F9',
  statValue: '#FDE68A',
  statBorder: 'rgba(103,232,249,0.35)',
  stageBorder: 'rgba(217,70,239,0.45)',
  stageBg: 'rgba(8,51,68,0.5)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#E879F9',
} as const;

export type RotateGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  collectible: string;
  /** Whether this game requires a cross-midline reach (opposite hand). */
  requireCross: boolean;
  /** Whether this game requires visible trunk rotation. */
  requireTurn: boolean;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const ROTATE_GAME_THEMES: Record<RotateMode, RotateGameTheme> = {
  applePicker: {
    title: 'Apple Picker',
    subtitle: 'Rotate and reach left and right to pick the apples!',
    emoji: '🍎',
    hero: '🍎',
    accent: '#EF4444',
    accentDeep: '#991B1B',
    glow: 'rgba(239,68,68,0.55)',
    collectible: '🍎',
    requireCross: false,
    requireTurn: false,
    hintText: 'Turn your body and reach your hand to the glowing apple!',
    voiceIntro: 'Rotate and reach to pick the apples on each side!',
    voiceComplete: 'Your basket is full of apples! Wonderful reaching!',
    congrats: 'Apple Picker Champion!',
  },
  pirateTreasure: {
    title: 'Pirate Treasure Reach',
    subtitle: 'Reach across your body to grab hidden treasure!',
    emoji: '🏴‍☠️',
    hero: '💰',
    accent: '#F59E0B',
    accentDeep: '#92400E',
    glow: 'rgba(245,158,11,0.5)',
    collectible: '💎',
    requireCross: true,
    requireTurn: false,
    hintText: 'Reach your far hand ACROSS your body to the treasure!',
    voiceIntro: 'Reach across your body to grab the pirate treasure, matey!',
    voiceComplete: 'A whole chest of treasure! Brilliant cross-body reaching!',
    congrats: 'Treasure Reaching Captain!',
  },
  turnTouch: {
    title: 'Turn & Touch',
    subtitle: 'Turn your body and touch the magical targets!',
    emoji: '🎯',
    hero: '🎯',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    collectible: '🎯',
    requireCross: false,
    requireTurn: true,
    hintText: 'Twist your body around and reach to touch the target!',
    voiceIntro: 'Turn your body and touch the targets all around you!',
    voiceComplete: 'You touched every target! Amazing twisting!',
    congrats: 'Turn & Touch Hero!',
  },
  crossBodyCatch: {
    title: 'Cross-Body Catch',
    subtitle: 'Catch the energy balls by reaching across your body!',
    emoji: '🤾',
    hero: '🟣',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    collectible: '🔮',
    requireCross: true,
    requireTurn: false,
    hintText: 'Quick! Reach your far hand across to catch the energy ball!',
    voiceIntro: 'Catch the energy balls — reach across your body fast!',
    voiceComplete: 'Great catches! Super cross-body coordination!',
    congrats: 'Cross-Body Catch Star!',
  },
  twistingStarHunt: {
    title: 'Twisting Star Hunt',
    subtitle: 'Rotate and reach in every direction to collect the stars!',
    emoji: '⭐',
    hero: '✨',
    accent: '#E879F9',
    accentDeep: '#A21CAF',
    glow: 'rgba(232,121,249,0.55)',
    collectible: '⭐',
    requireCross: false,
    requireTurn: true,
    hintText: 'Twist and reach all around to gather the glowing stars!',
    voiceIntro: 'Twist and reach in every direction to find the stars!',
    voiceComplete: 'You found a galaxy of stars! Wonderful twisting and reaching!',
    congrats: 'Twisting Star Champion!',
  },
};

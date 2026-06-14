/**
 * OT Level 6 · Session 5 — "Sunset Adventure (Weight Shifting)"
 * Visual tokens. A warm twilight-adventure palette (deep plum → royal purple →
 * magenta → sunset amber) — energetic and playful, distinct from S1 violet,
 * S2 forest, S3 space-navy, S4 lagoon-teal.
 */

export type ShiftMode = 'appleReach' | 'sideStar' | 'treasureLean' | 'bridge' | 'magicScale';

export const ADVENTURE_SHELL = {
  gradient: ['#2E1065', '#6D28D9', '#DB2777', '#FB923C'] as [string, string, string, string],
  backText: '#FCE7F3',
  backBorder: 'rgba(252,231,243,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#FBCFE8',
  statLabel: '#FDA4AF',
  statValue: '#FDE68A',
  statBorder: 'rgba(251,146,60,0.4)',
  stageBorder: 'rgba(251,146,60,0.45)',
  stageBg: 'rgba(46,16,101,0.5)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#FBBF24',
} as const;

export type ShiftGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  collectible: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const SHIFT_GAME_THEMES: Record<ShiftMode, ShiftGameTheme> = {
  appleReach: {
    title: 'Apple Reach',
    subtitle: 'Lean left and right to pick juicy apples — keep your balance!',
    emoji: '🍎',
    hero: '🍎',
    accent: '#EF4444',
    accentDeep: '#991B1B',
    glow: 'rgba(239,68,68,0.55)',
    collectible: '🍎',
    hintText: 'Shift your weight to the glowing side to pick the apple!',
    voiceIntro: 'Reach left and right to pick the apples! Stay balanced.',
    voiceComplete: 'You filled your basket with apples! Wonderful reaching!',
    congrats: 'Apple Picking Champion!',
  },
  sideStar: {
    title: 'Side Star Catch',
    subtitle: 'Shift side to side to catch the falling stars!',
    emoji: '⭐',
    hero: '🧺',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.5)',
    collectible: '⭐',
    hintText: 'Lean toward the falling star to catch it — then come back to center!',
    voiceIntro: 'Catch the falling stars by leaning side to side!',
    voiceComplete: 'You caught a sky full of stars! Amazing control!',
    congrats: 'Star Catcher Hero!',
  },
  treasureLean: {
    title: 'Treasure Lean',
    subtitle: 'Lean to reach pirate treasure — then steady yourself!',
    emoji: '🏴‍☠️',
    hero: '💰',
    accent: '#F59E0B',
    accentDeep: '#92400E',
    glow: 'rgba(245,158,11,0.5)',
    collectible: '💎',
    hintText: 'Lean far toward the treasure, hold, then return to the middle!',
    voiceIntro: 'Lean to grab the treasure, then steady yourself, matey!',
    voiceComplete: 'A whole chest of treasure! Steady as a captain!',
    congrats: 'Treasure Hunter Captain!',
  },
  bridge: {
    title: 'Bridge Balance',
    subtitle: 'Shift your weight to step across the magic bridge!',
    emoji: '🌉',
    hero: '🧙',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    collectible: '🪵',
    hintText: 'Shift onto the glowing stepping stone to cross the bridge!',
    voiceIntro: 'Shift your weight onto each stone to cross the magic bridge!',
    voiceComplete: 'You crossed the bridge safely! Beautiful balance!',
    congrats: 'Bridge Master!',
  },
  magicScale: {
    title: 'Magic Scale',
    subtitle: 'Shift your weight to make the magic scale balance level!',
    emoji: '⚖️',
    hero: '⚖️',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    collectible: '🔮',
    hintText: 'Shift gently until the scale is perfectly level — then hold!',
    voiceIntro: 'Shift your weight to make the magic scale balance!',
    voiceComplete: 'Perfectly level! You mastered the magic scale!',
    congrats: 'Scale Balancing Wizard!',
  },
};

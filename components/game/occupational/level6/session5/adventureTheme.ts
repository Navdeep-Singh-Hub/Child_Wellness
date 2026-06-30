/**
 * OT Level 6 · Session 5 — Per-game visual identity tokens
 * Each weight-shifting game has a unique twilight palette, backdrop, and shell.
 */

export type ShiftMode = 'appleReach' | 'sideStar' | 'treasureLean' | 'bridge' | 'magicScale';

export type ShiftBackdropId = 'orchardSlope' | 'starfallMeadow' | 'captainsCove' | 'moonlitCrossing' | 'alchemistsPan';

export type ShiftShell = {
  gradient: readonly [string, string, string, string];
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  stageBorder: string;
  stageBg: string;
  gold: string;
  good: string;
  warn: string;
  sparkleColor: string;
  glassBg: string;
  glassBorder: string;
  realmLabel: string;
};

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
  chips: string[];
  startLabel: string;
  backdrop: ShiftBackdropId;
  shell: ShiftShell;
};

export const SHIFT_GAME_THEMES: Record<ShiftMode, ShiftGameTheme> = {
  appleReach: {
    title: 'Orchard Slope',
    subtitle: 'Lean along the hillside to pick juicy apples!',
    emoji: '🍎',
    hero: '🍎',
    accent: '#EF4444',
    accentDeep: '#991B1B',
    glow: 'rgba(239,68,68,0.55)',
    collectible: '🍎',
    hintText: 'Shift your weight to the glowing side to pick the apple!',
    voiceIntro: 'Reach left and right to pick the apples! Stay balanced.',
    voiceComplete: 'You filled your basket with apples! Wonderful reaching!',
    congrats: 'Orchard Slope Champion!',
    chips: ['🍎 Reach', '↔️ Lean', '🧺 Pick'],
    startLabel: '🍎 Enter Orchard',
    backdrop: 'orchardSlope',
    shell: {
      gradient: ['#450A0A', '#7F1D1D', '#B91C1C', '#EF4444'],
      backText: '#FEE2E2', backBorder: 'rgba(239,68,68,0.35)',
      titleColor: '#FFF1F2', subtitleColor: '#FECACA',
      statLabel: '#FCA5A5', statValue: '#FDE68A', statBorder: 'rgba(239,68,68,0.35)',
      stageBorder: 'rgba(239,68,68,0.45)', stageBg: 'rgba(69,10,10,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FCA5A5',
      glassBg: 'rgba(127,29,29,0.35)', glassBorder: 'rgba(239,68,68,0.4)',
      realmLabel: '🍎 ORCHARD SLOPE',
    },
  },
  sideStar: {
    title: 'Starfall Meadow',
    subtitle: 'Shift side to side to catch falling stars!',
    emoji: '⭐',
    hero: '🧺',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.5)',
    collectible: '⭐',
    hintText: 'Lean toward the falling star to catch it — then come back to center!',
    voiceIntro: 'Catch the falling stars by leaning side to side!',
    voiceComplete: 'You caught a sky full of stars! Amazing control!',
    congrats: 'Starfall Meadow Hero!',
    chips: ['⭐ Catch', '↔️ Shift', '🌙 Meadow'],
    startLabel: '⭐ Enter Meadow',
    backdrop: 'starfallMeadow',
    shell: {
      gradient: ['#422006', '#713F12', '#B45309', '#FBBF24'],
      backText: '#FEF9C3', backBorder: 'rgba(251,191,36,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(251,191,36,0.35)',
      stageBorder: 'rgba(251,191,36,0.45)', stageBg: 'rgba(66,32,6,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(113,63,18,0.35)', glassBorder: 'rgba(251,191,36,0.4)',
      realmLabel: '⭐ STARFALL MEADOW',
    },
  },
  treasureLean: {
    title: "Captain's Cove",
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
    congrats: "Captain's Cove Hunter!",
    chips: ['💎 Treasure', '↔️ Lean', '🏴‍☠️ Cove'],
    startLabel: '🏴‍☠️ Set Sail',
    backdrop: 'captainsCove',
    shell: {
      gradient: ['#1C1917', '#44403C', '#92400E', '#F59E0B'],
      backText: '#FEF3C7', backBorder: 'rgba(245,158,11,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(245,158,11,0.35)',
      stageBorder: 'rgba(245,158,11,0.45)', stageBg: 'rgba(28,25,23,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(68,64,60,0.35)', glassBorder: 'rgba(245,158,11,0.4)',
      realmLabel: "🏴‍☠️ CAPTAIN'S COVE",
    },
  },
  bridge: {
    title: 'Moonlit Crossing',
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
    congrats: 'Moonlit Crossing Master!',
    chips: ['🌉 Step', '🪵 Stones', '🌙 Moon'],
    startLabel: '🌉 Begin Crossing',
    backdrop: 'moonlitCrossing',
    shell: {
      gradient: ['#0C4A6E', '#075985', '#0369A1', '#38BDF8'],
      backText: '#E0F2FE', backBorder: 'rgba(56,189,248,0.35)',
      titleColor: '#F0F9FF', subtitleColor: '#BAE6FD',
      statLabel: '#7DD3FC', statValue: '#38BDF8', statBorder: 'rgba(56,189,248,0.35)',
      stageBorder: 'rgba(56,189,248,0.45)', stageBg: 'rgba(12,74,110,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#7DD3FC',
      glassBg: 'rgba(7,89,133,0.35)', glassBorder: 'rgba(56,189,248,0.4)',
      realmLabel: '🌉 MOONLIT CROSSING',
    },
  },
  magicScale: {
    title: "Alchemist's Pan",
    subtitle: 'Shift your weight to balance the magic scale!',
    emoji: '⚖️',
    hero: '⚖️',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    collectible: '🔮',
    hintText: 'Shift gently until the scale is perfectly level — then hold!',
    voiceIntro: 'Shift your weight to make the magic scale balance!',
    voiceComplete: 'Perfectly level! You mastered the magic scale!',
    congrats: "Alchemist's Pan Wizard!",
    chips: ['⚖️ Balance', '🔮 Magic', '✨ Level'],
    startLabel: '⚖️ Open Pan',
    backdrop: 'alchemistsPan',
    shell: {
      gradient: ['#2E1065', '#4C1D95', '#6D28D9', '#A78BFA'],
      backText: '#EDE9FE', backBorder: 'rgba(167,139,250,0.35)',
      titleColor: '#F5F3FF', subtitleColor: '#DDD6FE',
      statLabel: '#C4B5FD', statValue: '#A78BFA', statBorder: 'rgba(167,139,250,0.35)',
      stageBorder: 'rgba(167,139,250,0.45)', stageBg: 'rgba(46,16,101,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#C4B5FD',
      glassBg: 'rgba(76,29,149,0.35)', glassBorder: 'rgba(167,139,250,0.4)',
      realmLabel: "⚖️ ALCHEMIST'S PAN",
    },
  },
};

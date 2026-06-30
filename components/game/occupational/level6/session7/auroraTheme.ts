/**
 * OT Level 6 · Session 7 — Per-game visual identity tokens
 * Each trunk-rotation game has a unique aurora palette, backdrop, and shell.
 */

export type RotateMode = 'applePicker' | 'pirateTreasure' | 'turnTouch' | 'crossBodyCatch' | 'twistingStarHunt';

export type AuroraBackdropId = 'crimsonGrove' | 'corsairCache' | 'targetSpiral' | 'orbCascade' | 'polarisSweep';

export type AuroraShell = {
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

export type RotateGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  collectible: string;
  requireCross: boolean;
  requireTurn: boolean;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  chips: string[];
  startLabel: string;
  backdrop: AuroraBackdropId;
  shell: AuroraShell;
};

export const ROTATE_GAME_THEMES: Record<RotateMode, RotateGameTheme> = {
  applePicker: {
    title: 'Crimson Grove',
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
    congrats: 'Crimson Grove Champion!',
    chips: ['🍎 Pick', '🔄 Rotate', '🧺 Reach'],
    startLabel: '🍎 Enter Grove',
    backdrop: 'crimsonGrove',
    shell: {
      gradient: ['#450A0A', '#7F1D1D', '#B91C1C', '#EF4444'],
      backText: '#FEE2E2', backBorder: 'rgba(239,68,68,0.35)',
      titleColor: '#FFF1F2', subtitleColor: '#FECACA',
      statLabel: '#FCA5A5', statValue: '#FDE68A', statBorder: 'rgba(239,68,68,0.35)',
      stageBorder: 'rgba(239,68,68,0.45)', stageBg: 'rgba(69,10,10,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FCA5A5',
      glassBg: 'rgba(127,29,29,0.35)', glassBorder: 'rgba(239,68,68,0.4)',
      realmLabel: '🍎 CRIMSON GROVE',
    },
  },
  pirateTreasure: {
    title: 'Corsair Cache',
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
    congrats: 'Corsair Cache Captain!',
    chips: ['💎 Cross', '🏴‍☠️ Reach', '💰 Loot'],
    startLabel: '🏴‍☠️ Raid Cache',
    backdrop: 'corsairCache',
    shell: {
      gradient: ['#1C1917', '#44403C', '#92400E', '#F59E0B'],
      backText: '#FEF3C7', backBorder: 'rgba(245,158,11,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(245,158,11,0.35)',
      stageBorder: 'rgba(245,158,11,0.45)', stageBg: 'rgba(28,25,23,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(68,64,60,0.35)', glassBorder: 'rgba(245,158,11,0.4)',
      realmLabel: '🏴‍☠️ CORSAIR CACHE',
    },
  },
  turnTouch: {
    title: 'Target Spiral',
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
    congrats: 'Target Spiral Hero!',
    chips: ['🎯 Touch', '🌀 Twist', '✨ Spiral'],
    startLabel: '🎯 Enter Spiral',
    backdrop: 'targetSpiral',
    shell: {
      gradient: ['#164E63', '#155E75', '#0E7490', '#22D3EE'],
      backText: '#CFFAFE', backBorder: 'rgba(34,211,238,0.35)',
      titleColor: '#ECFEFF', subtitleColor: '#A5F3FC',
      statLabel: '#67E8F9', statValue: '#22D3EE', statBorder: 'rgba(34,211,238,0.35)',
      stageBorder: 'rgba(34,211,238,0.45)', stageBg: 'rgba(22,78,99,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#67E8F9',
      glassBg: 'rgba(21,94,117,0.35)', glassBorder: 'rgba(34,211,238,0.4)',
      realmLabel: '🎯 TARGET SPIRAL',
    },
  },
  crossBodyCatch: {
    title: 'Orb Cascade',
    subtitle: 'Catch energy orbs by reaching across your body!',
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
    congrats: 'Orb Cascade Star!',
    chips: ['🔮 Catch', '↔️ Cross', '⚡ Orbs'],
    startLabel: '🔮 Catch Orbs',
    backdrop: 'orbCascade',
    shell: {
      gradient: ['#2E1065', '#4C1D95', '#6D28D9', '#A78BFA'],
      backText: '#EDE9FE', backBorder: 'rgba(167,139,250,0.35)',
      titleColor: '#F5F3FF', subtitleColor: '#DDD6FE',
      statLabel: '#C4B5FD', statValue: '#A78BFA', statBorder: 'rgba(167,139,250,0.35)',
      stageBorder: 'rgba(167,139,250,0.45)', stageBg: 'rgba(46,16,101,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#C4B5FD',
      glassBg: 'rgba(76,29,149,0.35)', glassBorder: 'rgba(167,139,250,0.4)',
      realmLabel: '🔮 ORB CASCADE',
    },
  },
  twistingStarHunt: {
    title: 'Polaris Sweep',
    subtitle: 'Rotate and reach in every direction to collect stars!',
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
    congrats: 'Polaris Sweep Champion!',
    chips: ['⭐ Stars', '🌀 Twist', '🌌 Sweep'],
    startLabel: '⭐ Begin Sweep',
    backdrop: 'polarisSweep',
    shell: {
      gradient: ['#083344', '#0E7490', '#7E22CE', '#E879F9'],
      backText: '#CFFAFE', backBorder: 'rgba(232,121,249,0.35)',
      titleColor: '#FFFFFF', subtitleColor: '#A5F3FC',
      statLabel: '#67E8F9', statValue: '#E879F9', statBorder: 'rgba(103,232,249,0.35)',
      stageBorder: 'rgba(217,70,239,0.45)', stageBg: 'rgba(8,51,68,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#E879F9',
      glassBg: 'rgba(14,116,144,0.35)', glassBorder: 'rgba(232,121,249,0.4)',
      realmLabel: '⭐ POLARIS SWEEP',
    },
  },
};

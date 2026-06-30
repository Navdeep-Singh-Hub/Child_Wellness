/**
 * OT Level 6 · Session 2 — Per-game visual identity tokens
 * Each standing posture game has a unique palette, backdrop, and shell.
 */

export type StandMode = 'tallTree' | 'soldier' | 'statueGuard' | 'growTaller' | 'freezeBalance';

export type StandBackdropId = 'grove' | 'rampart' | 'plaza' | 'cloudGarden' | 'frostTrail';

export type StandShell = {
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

export type StandGameTheme = {
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
  chips: string[];
  startLabel: string;
  backdrop: StandBackdropId;
  shell: StandShell;
};

export const STAND_GAME_THEMES: Record<StandMode, StandGameTheme> = {
  tallTree: {
    title: 'Skyward Grove', emoji: '🌳', subtitle: 'Stand tall and grow into a mighty magical tree!',
    hero: '🌱', accent: '#22C55E', accentDeep: '#15803D', glow: 'rgba(34,197,94,0.55)',
    hintText: 'Stand up nice and tall — your tree grows higher and higher!',
    voiceIntro: 'Stand up tall like a strong tree growing to the sky!',
    voiceComplete: 'Your tree is huge and beautiful! Wonderful standing!',
    congrats: 'Mighty Tall Tree!',
    chips: ['🌳 Grow', '🦵 Stand', '☀️ Tall'],
    startLabel: '🌳 Enter Grove',
    backdrop: 'grove',
    shell: {
      gradient: ['#052E16', '#14532D', '#166534', '#22C55E'],
      backText: '#DCFCE7', backBorder: 'rgba(134,239,172,0.35)',
      titleColor: '#F0FDF4', subtitleColor: '#BBF7D0',
      statLabel: '#4ADE80', statValue: '#86EFAC', statBorder: 'rgba(74,222,128,0.35)',
      stageBorder: 'rgba(74,222,128,0.45)', stageBg: 'rgba(5,46,22,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE68A',
      glassBg: 'rgba(22,101,52,0.3)', glassBorder: 'rgba(134,239,172,0.4)',
      realmLabel: '🌳 SKYWARD GROVE',
    },
  },
  soldier: {
    title: 'Castle Rampart', emoji: '💂', subtitle: 'Be a royal guard — follow every command!',
    hero: '🛡️', accent: '#F59E0B', accentDeep: '#B45309', glow: 'rgba(245,158,11,0.5)',
    hintText: 'Stand tall and steady — shoulders level, head straight!',
    voiceIntro: 'Royal guard, stand tall and follow each command!',
    voiceComplete: 'Outstanding, guard! The castle is safe!',
    congrats: 'Royal Guard Hero!',
    chips: ['💂 Guard', '🛡️ Steady', '👑 Royal'],
    startLabel: '💂 Take Post',
    backdrop: 'rampart',
    shell: {
      gradient: ['#422006', '#713F12', '#A16207', '#EAB308'],
      backText: '#FEF9C3', backBorder: 'rgba(250,204,21,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(251,191,36,0.35)',
      stageBorder: 'rgba(251,191,36,0.45)', stageBg: 'rgba(66,32,6,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(113,63,18,0.3)', glassBorder: 'rgba(251,191,36,0.4)',
      realmLabel: '💂 CASTLE RAMPART',
    },
  },
  statueGuard: {
    title: 'Crystal Plaza', emoji: '🗽', subtitle: 'Freeze like stone — do not move a muscle!',
    hero: '🧍', accent: '#22D3EE', accentDeep: '#0E7490', glow: 'rgba(34,211,238,0.5)',
    hintText: 'Stay perfectly still — even your arms! Ignore distractions!',
    voiceIntro: 'Become a giant statue. Stand as still as stone!',
    voiceComplete: 'Incredible stillness! A statue worthy of the kingdom!',
    congrats: 'Legendary Statue Guard!',
    chips: ['🗽 Freeze', '🧊 Still', '✨ Crystal'],
    startLabel: '🗽 Enter Plaza',
    backdrop: 'plaza',
    shell: {
      gradient: ['#0C4A6E', '#075985', '#0E7490', '#22D3EE'],
      backText: '#CFFAFE', backBorder: 'rgba(34,211,238,0.35)',
      titleColor: '#F0FDFA', subtitleColor: '#99F6E4',
      statLabel: '#5EEAD4', statValue: '#2DD4BF', statBorder: 'rgba(45,212,191,0.35)',
      stageBorder: 'rgba(34,211,238,0.45)', stageBg: 'rgba(12,74,110,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#67E8F9',
      glassBg: 'rgba(14,116,144,0.3)', glassBorder: 'rgba(34,211,238,0.4)',
      realmLabel: '🗽 CRYSTAL PLAZA',
    },
  },
  growTaller: {
    title: 'Cloud Garden', emoji: '🎈', subtitle: 'Stretch up high to float the balloon skyward!',
    hero: '☁️', accent: '#F472B6', accentDeep: '#BE185D', glow: 'rgba(244,114,182,0.5)',
    hintText: 'Stretch up as TALL as you can — reach for the sky!',
    voiceIntro: 'Stretch up super tall and reach your arms to the sky!',
    voiceComplete: 'The balloon touched the clouds! Amazing stretching!',
    congrats: 'Sky-High Stretcher!',
    chips: ['🎈 Rise', '☁️ Stretch', '🌸 Garden'],
    startLabel: '🎈 Lift Off',
    backdrop: 'cloudGarden',
    shell: {
      gradient: ['#831843', '#9D174D', '#DB2777', '#F472B6'],
      backText: '#FCE7F3', backBorder: 'rgba(244,114,182,0.35)',
      titleColor: '#FDF2F8', subtitleColor: '#FBCFE8',
      statLabel: '#F9A8D4', statValue: '#F472B6', statBorder: 'rgba(244,114,182,0.35)',
      stageBorder: 'rgba(244,114,182,0.45)', stageBg: 'rgba(131,24,67,0.5)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FBCFE8',
      glassBg: 'rgba(157,23,77,0.3)', glassBorder: 'rgba(244,114,182,0.4)',
      realmLabel: '🎈 CLOUD GARDEN',
    },
  },
  freezeBalance: {
    title: 'Frost Trail', emoji: '🧊', subtitle: 'March and move… then FREEZE and balance!',
    hero: '🏃', accent: '#A78BFA', accentDeep: '#6D28D9', glow: 'rgba(167,139,250,0.55)',
    hintText: 'Move and march… when you see FREEZE, stop and balance still!',
    voiceIntro: 'March and move! When I say freeze, stop and balance!',
    voiceComplete: 'Super freezing and balancing! Great control!',
    congrats: 'Freeze & Balance Champion!',
    chips: ['🏃 Move', '🧊 Freeze', '⚖️ Balance'],
    startLabel: '🧊 Start Trail',
    backdrop: 'frostTrail',
    shell: {
      gradient: ['#312E81', '#4338CA', '#6366F1', '#A5B4FC'],
      backText: '#E0E7FF', backBorder: 'rgba(165,180,252,0.35)',
      titleColor: '#EEF2FF', subtitleColor: '#C7D2FE',
      statLabel: '#A5B4FC', statValue: '#818CF8', statBorder: 'rgba(129,140,248,0.35)',
      stageBorder: 'rgba(129,140,248,0.45)', stageBg: 'rgba(49,46,129,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#C7D2FE',
      glassBg: 'rgba(67,56,202,0.3)', glassBorder: 'rgba(165,180,252,0.4)',
      realmLabel: '🧊 FROST TRAIL',
    },
  },
};

/** @deprecated Use STAND_GAME_THEMES[mode].shell */
export const FOREST_SHELL = STAND_GAME_THEMES.tallTree.shell;

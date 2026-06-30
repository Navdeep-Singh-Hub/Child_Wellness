/**
 * OT Level 6 · Session 3 — Per-game visual identity tokens
 * Each head-tracking game has a unique palette, backdrop, and shell.
 */

export type HeadMode = 'rocketWatch' | 'lookHold' | 'skyGround' | 'keepCrown' | 'starTracker';

export type HeadBackdropId = 'launchPad' | 'sentinel' | 'horizon' | 'royalOrbit' | 'cometLane';

export type HeadShell = {
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

export type HeadGameTheme = {
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
  backdrop: HeadBackdropId;
  shell: HeadShell;
};

export const HEAD_GAME_THEMES: Record<HeadMode, HeadGameTheme> = {
  rocketWatch: {
    title: 'Launch Pad', emoji: '🚀', subtitle: 'Follow the rocket with your head — body stays still!',
    hero: '🚀', accent: '#38BDF8', accentDeep: '#0369A1', glow: 'rgba(56,189,248,0.55)',
    hintText: 'Move only your head to follow the rocket — body stays still!',
    voiceIntro: 'Follow the rocket with your head! Keep your shoulders still.',
    voiceComplete: 'Amazing tracking! You followed the rocket everywhere!',
    congrats: 'Rocket Watcher!',
    chips: ['🚀 Track', '👀 Head', '🧍 Still'],
    startLabel: '🚀 Ignite Launch',
    backdrop: 'launchPad',
    shell: {
      gradient: ['#0C1929', '#0C4A6E', '#0369A1', '#38BDF8'],
      backText: '#E0F2FE', backBorder: 'rgba(56,189,248,0.35)',
      titleColor: '#F0F9FF', subtitleColor: '#BAE6FD',
      statLabel: '#7DD3FC', statValue: '#38BDF8', statBorder: 'rgba(56,189,248,0.35)',
      stageBorder: 'rgba(56,189,248,0.45)', stageBg: 'rgba(12,25,41,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#7DD3FC',
      glassBg: 'rgba(12,74,110,0.35)', glassBorder: 'rgba(56,189,248,0.4)',
      realmLabel: '🚀 LAUNCH PAD',
    },
  },
  lookHold: {
    title: 'Sentinel Tower', emoji: '🏰', subtitle: 'Lookout duty — hold each look left, right, up, down!',
    hero: '🔭', accent: '#F59E0B', accentDeep: '#B45309', glow: 'rgba(245,158,11,0.5)',
    hintText: 'Turn your head where the command says — and hold it steady!',
    voiceIntro: 'Lookout! Follow the commands and hold each look.',
    voiceComplete: 'Sharp lookout! The castle is safe!',
    congrats: 'Castle Lookout Hero!',
    chips: ['🔭 Look', '⏱️ Hold', '🏰 Tower'],
    startLabel: '🏰 Take Watch',
    backdrop: 'sentinel',
    shell: {
      gradient: ['#1C1917', '#44403C', '#78350F', '#D97706'],
      backText: '#FEF9C3', backBorder: 'rgba(251,191,36,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(251,191,36,0.35)',
      stageBorder: 'rgba(251,191,36,0.45)', stageBg: 'rgba(28,25,23,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(120,53,15,0.35)', glassBorder: 'rgba(251,191,36,0.4)',
      realmLabel: '🏰 SENTINEL TOWER',
    },
  },
  skyGround: {
    title: 'Horizon Valley', emoji: '🌤️', subtitle: 'Look up at clouds, then down at flowers!',
    hero: '🧭', accent: '#34D399', accentDeep: '#047857', glow: 'rgba(52,211,153,0.5)',
    hintText: 'Look UP at the clouds, then DOWN at the flowers — body still!',
    voiceIntro: 'Look up at the clouds, then down at the flowers!',
    voiceComplete: 'Wonderful exploring up and down!',
    congrats: 'Sky-Ground Explorer!',
    chips: ['☁️ Up', '🌸 Down', '🧭 Explore'],
    startLabel: '🌤️ Begin Trek',
    backdrop: 'horizon',
    shell: {
      gradient: ['#064E3B', '#065F46', '#047857', '#34D399'],
      backText: '#D1FAE5', backBorder: 'rgba(52,211,153,0.35)',
      titleColor: '#ECFDF5', subtitleColor: '#A7F3D0',
      statLabel: '#6EE7B7', statValue: '#34D399', statBorder: 'rgba(52,211,153,0.35)',
      stageBorder: 'rgba(52,211,153,0.45)', stageBg: 'rgba(6,78,59,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#6EE7B7',
      glassBg: 'rgba(6,95,70,0.35)', glassBorder: 'rgba(52,211,153,0.4)',
      realmLabel: '🌤️ HORIZON VALLEY',
    },
  },
  keepCrown: {
    title: 'Royal Orbit', emoji: '👑', subtitle: 'Turn your head smoothly — keep the crown balanced!',
    hero: '👑', accent: '#F472B6', accentDeep: '#BE185D', glow: 'rgba(244,114,182,0.5)',
    hintText: 'Turn your head SLOWLY and smoothly — keep the crown balanced!',
    voiceIntro: 'Turn your head smoothly so the crown stays on top!',
    voiceComplete: 'The crown never fell! Beautifully smooth!',
    congrats: 'Smooth Crown Keeper!',
    chips: ['👑 Crown', '🔄 Smooth', '✨ Royal'],
    startLabel: '👑 Enter Orbit',
    backdrop: 'royalOrbit',
    shell: {
      gradient: ['#500724', '#831843', '#9D174D', '#EC4899'],
      backText: '#FCE7F3', backBorder: 'rgba(244,114,182,0.35)',
      titleColor: '#FDF2F8', subtitleColor: '#FBCFE8',
      statLabel: '#F9A8D4', statValue: '#F472B6', statBorder: 'rgba(244,114,182,0.35)',
      stageBorder: 'rgba(244,114,182,0.45)', stageBg: 'rgba(80,7,36,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FBCFE8',
      glassBg: 'rgba(131,24,67,0.35)', glassBorder: 'rgba(244,114,182,0.4)',
      realmLabel: '👑 ROYAL ORBIT',
    },
  },
  starTracker: {
    title: 'Comet Lane', emoji: '🌟', subtitle: 'Follow shooting stars across the night sky!',
    hero: '✨', accent: '#A78BFA', accentDeep: '#6D28D9', glow: 'rgba(167,139,250,0.55)',
    hintText: 'Smoothly follow each star with your head — all the way!',
    voiceIntro: 'Follow the shooting stars with your head across the sky!',
    voiceComplete: 'Stellar tracking! You followed every star!',
    congrats: 'Master Star Tracker!',
    chips: ['🌟 Stars', '👀 Track', '✨ Smooth'],
    startLabel: '🌟 Enter Lane',
    backdrop: 'cometLane',
    shell: {
      gradient: ['#1E1B4B', '#312E81', '#4C1D95', '#7C3AED'],
      backText: '#EDE9FE', backBorder: 'rgba(167,139,250,0.35)',
      titleColor: '#F5F3FF', subtitleColor: '#DDD6FE',
      statLabel: '#C4B5FD', statValue: '#A78BFA', statBorder: 'rgba(167,139,250,0.35)',
      stageBorder: 'rgba(167,139,250,0.45)', stageBg: 'rgba(30,27,75,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#C4B5FD',
      glassBg: 'rgba(76,29,149,0.35)', glassBorder: 'rgba(167,139,250,0.4)',
      realmLabel: '🌟 COMET LANE',
    },
  },
};

/** @deprecated Use HEAD_GAME_THEMES[mode].shell */
export const SPACE_SHELL = HEAD_GAME_THEMES.rocketWatch.shell;

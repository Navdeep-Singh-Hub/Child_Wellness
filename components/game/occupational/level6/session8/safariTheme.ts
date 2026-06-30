/**
 * OT Level 6 · Session 8 — Per-game visual identity tokens
 * Each animal-walk game has a unique jungle palette, backdrop, and shell.
 */

export type AnimalMode = 'bearWalk' | 'crabWalk' | 'sealPush' | 'turtleCrawl' | 'gorillaMarch';

export type SafariBackdropId = 'honeyHollow' | 'tidalScuttle' | 'iceFlow' | 'mossPath' | 'canopyStomp';

export type SafariShell = {
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

export type AnimalGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  collectible: string;
  requireLowered: boolean;
  useLegMarch: boolean;
  slow: boolean;
  steps: number;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  chips: string[];
  startLabel: string;
  backdrop: SafariBackdropId;
  shell: SafariShell;
};

export const ANIMAL_GAME_THEMES: Record<AnimalMode, AnimalGameTheme> = {
  bearWalk: {
    title: 'Honey Hollow',
    subtitle: 'Walk on hands and feet through the forest collecting honey!',
    emoji: '🐻',
    hero: '🐻',
    accent: '#F59E0B',
    accentDeep: '#92400E',
    glow: 'rgba(245,158,11,0.5)',
    collectible: '🍯',
    requireLowered: true,
    useLegMarch: false,
    slow: false,
    steps: 8,
    hintText: 'Hands and feet on the floor — walk like a strong bear!',
    positionCue: 'Get down on your hands and feet like a bear!',
    voiceIntro: 'Become a mighty bear! Walk on your hands and feet to find honey!',
    voiceComplete: 'What a strong bear! You collected all the honey!',
    congrats: 'Honey Hollow Explorer!',
    chips: ['🐻 Bear', '🍯 Honey', '🌲 Forest'],
    startLabel: '🐻 Enter Hollow',
    backdrop: 'honeyHollow',
    shell: {
      gradient: ['#422006', '#713F12', '#B45309', '#F59E0B'],
      backText: '#FEF9C3', backBorder: 'rgba(245,158,11,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(245,158,11,0.35)',
      stageBorder: 'rgba(245,158,11,0.45)', stageBg: 'rgba(66,32,6,0.55)',
      gold: '#FACC15', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(113,63,18,0.35)', glassBorder: 'rgba(245,158,11,0.4)',
      realmLabel: '🍯 HONEY HOLLOW',
    },
  },
  crabWalk: {
    title: 'Tidal Scuttle',
    subtitle: 'Crab walk across the beach between the markers!',
    emoji: '🦀',
    hero: '🦀',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    collectible: '🐚',
    requireLowered: true,
    useLegMarch: false,
    slow: false,
    steps: 8,
    hintText: 'Sit back on your hands and feet — scuttle like a crab!',
    positionCue: 'Get into your crab position — tummy up, hands and feet down!',
    voiceIntro: 'Scuttle like a crab across the sunny beach!',
    voiceComplete: 'Super scuttling! You crossed the whole beach!',
    congrats: 'Tidal Scuttle Champion!',
    chips: ['🦀 Crab', '🐚 Shells', '🌊 Beach'],
    startLabel: '🦀 Scuttle Out',
    backdrop: 'tidalScuttle',
    shell: {
      gradient: ['#164E63', '#155E75', '#0E7490', '#22D3EE'],
      backText: '#CFFAFE', backBorder: 'rgba(34,211,238,0.35)',
      titleColor: '#ECFEFF', subtitleColor: '#A5F3FC',
      statLabel: '#67E8F9', statValue: '#22D3EE', statBorder: 'rgba(34,211,238,0.35)',
      stageBorder: 'rgba(34,211,238,0.45)', stageBg: 'rgba(22,78,99,0.55)',
      gold: '#FACC15', good: '#34D399', warn: '#FB7185', sparkleColor: '#67E8F9',
      glassBg: 'rgba(21,94,117,0.35)', glassBorder: 'rgba(34,211,238,0.4)',
      realmLabel: '🦀 TIDAL SCUTTLE',
    },
  },
  sealPush: {
    title: 'Ice Flow',
    subtitle: 'Push forward with your arms and slide across the ice!',
    emoji: '🦭',
    hero: '🦭',
    accent: '#60A5FA',
    accentDeep: '#1E40AF',
    glow: 'rgba(96,165,250,0.5)',
    collectible: '🐟',
    requireLowered: true,
    useLegMarch: false,
    slow: false,
    steps: 7,
    hintText: 'Lie low and push with your arms to slide like a seal!',
    positionCue: 'Lie on your tummy and push up with your strong arms!',
    voiceIntro: 'Slide like a seal! Push with your arms across the ice!',
    voiceComplete: 'Wonderful pushing! You slid all the way across!',
    congrats: 'Ice Flow Star!',
    chips: ['🦭 Slide', '🐟 Catch', '❄️ Ice'],
    startLabel: '🦭 Slide On',
    backdrop: 'iceFlow',
    shell: {
      gradient: ['#0C4A6E', '#1E3A8A', '#1D4ED8', '#60A5FA'],
      backText: '#DBEAFE', backBorder: 'rgba(96,165,250,0.35)',
      titleColor: '#EFF6FF', subtitleColor: '#BFDBFE',
      statLabel: '#93C5FD', statValue: '#60A5FA', statBorder: 'rgba(96,165,250,0.35)',
      stageBorder: 'rgba(96,165,250,0.45)', stageBg: 'rgba(12,74,110,0.55)',
      gold: '#FACC15', good: '#34D399', warn: '#FB7185', sparkleColor: '#93C5FD',
      glassBg: 'rgba(30,58,138,0.35)', glassBorder: 'rgba(96,165,250,0.4)',
      realmLabel: '🦭 ICE FLOW',
    },
  },
  turtleCrawl: {
    title: 'Moss Path',
    subtitle: 'Crawl slowly and steadily along the jungle path!',
    emoji: '🐢',
    hero: '🐢',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    collectible: '🍃',
    requireLowered: true,
    useLegMarch: false,
    slow: true,
    steps: 8,
    hintText: 'Slow and steady — crawl on hands and knees like a turtle.',
    positionCue: 'Get on your hands and knees, ready to crawl slowly!',
    voiceIntro: 'Crawl slow and steady like a wise turtle through the jungle!',
    voiceComplete: 'Slow and steady wins! What a wonderful turtle crawl!',
    congrats: 'Moss Path Traveler!',
    chips: ['🐢 Slow', '🍃 Moss', '🌿 Steady'],
    startLabel: '🐢 Begin Crawl',
    backdrop: 'mossPath',
    shell: {
      gradient: ['#064E3B', '#065F46', '#047857', '#34D399'],
      backText: '#D1FAE5', backBorder: 'rgba(52,211,153,0.35)',
      titleColor: '#ECFDF5', subtitleColor: '#A7F3D0',
      statLabel: '#6EE7B7', statValue: '#34D399', statBorder: 'rgba(52,211,153,0.35)',
      stageBorder: 'rgba(52,211,153,0.45)', stageBg: 'rgba(6,78,59,0.55)',
      gold: '#FACC15', good: '#34D399', warn: '#FB7185', sparkleColor: '#6EE7B7',
      glassBg: 'rgba(6,95,70,0.35)', glassBorder: 'rgba(52,211,153,0.4)',
      realmLabel: '🐢 MOSS PATH',
    },
  },
  gorillaMarch: {
    title: 'Canopy Stomp',
    subtitle: 'March with big stomps and lift those knees high!',
    emoji: '🦍',
    hero: '🦍',
    accent: '#A16207',
    accentDeep: '#713F12',
    glow: 'rgba(161,98,7,0.55)',
    collectible: '🍌',
    requireLowered: false,
    useLegMarch: true,
    slow: false,
    steps: 10,
    hintText: 'Big gorilla stomps — lift your knees up high, left and right!',
    positionCue: 'Stand tall and get ready to march like a big gorilla!',
    voiceIntro: 'Stomp like a gorilla! Lift your knees up high and march!',
    voiceComplete: 'Powerful gorilla marching! You stomped all the way!',
    congrats: 'Canopy Stomp Champion!',
    chips: ['🦍 Stomp', '🍌 Power', '🌳 Canopy'],
    startLabel: '🦍 Start Stomp',
    backdrop: 'canopyStomp',
    shell: {
      gradient: ['#1C1917', '#44403C', '#713F12', '#A16207'],
      backText: '#FEF3C7', backBorder: 'rgba(161,98,7,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(161,98,7,0.35)',
      stageBorder: 'rgba(161,98,7,0.45)', stageBg: 'rgba(28,25,23,0.55)',
      gold: '#FACC15', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(68,64,60,0.35)', glassBorder: 'rgba(161,98,7,0.4)',
      realmLabel: '🦍 CANOPY STOMP',
    },
  },
};

/**
 * OT Level 6 · Session 1 — Per-game visual identity tokens
 * Each game has a unique palette, backdrop, and shell — shared pose engine underneath.
 */

export type PostureMode = 'powerSit' | 'crown' | 'statue' | 'freeze' | 'reach';

export type PostureBackdropId = 'forge' | 'palace' | 'marble' | 'bridge' | 'nebula';

export type PostureShell = {
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
  academyLabel: string;
};

export type PostureGameTheme = {
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
  backdrop: PostureBackdropId;
  shell: PostureShell;
};

export const POSTURE_GAME_THEMES: Record<PostureMode, PostureGameTheme> = {
  powerSit: {
    title: 'Thunder Forge', emoji: '⚡', subtitle: 'Sit tall to charge the reactor core!',
    hero: '🦸', accent: '#F59E0B', accentDeep: '#B45309', glow: 'rgba(245,158,11,0.55)',
    hintText: 'Sit up tall and still — watch your power meter fill!',
    voiceIntro: 'Superhero, sit up nice and tall to charge your power!',
    voiceComplete: 'Power fully charged! You are a super sitter!',
    congrats: 'Power Sit Champion!',
    chips: ['⚡ Charge', '🦸 Tall', '💪 Core'],
    startLabel: '⚡ Ignite Reactor',
    backdrop: 'forge',
    shell: {
      gradient: ['#1C1917', '#44403C', '#78350F', '#B45309'],
      backText: '#FDE68A', backBorder: 'rgba(251,191,36,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(251,191,36,0.35)',
      stageBorder: 'rgba(251,191,36,0.45)', stageBg: 'rgba(28,25,23,0.65)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(120,53,15,0.25)', glassBorder: 'rgba(251,191,36,0.4)',
      academyLabel: '⚡ THUNDER FORGE',
    },
  },
  crown: {
    title: 'Royal Observatory', emoji: '👑', subtitle: 'Keep your head steady — protect the crown!',
    hero: '🤴', accent: '#F472B6', accentDeep: '#BE185D', glow: 'rgba(244,114,182,0.55)',
    hintText: 'Hold your head straight and steady — keep the crown balanced!',
    voiceIntro: 'Keep your head straight and tall so the crown does not fall!',
    voiceComplete: 'You kept the crown safe! Royal job!',
    congrats: 'Royal Crown Keeper!',
    chips: ['👑 Crown', '🤴 Steady', '✨ Royal'],
    startLabel: '👑 Enter Palace',
    backdrop: 'palace',
    shell: {
      gradient: ['#4A044E', '#701A75', '#A21CAF', '#D946EF'],
      backText: '#FBCFE8', backBorder: 'rgba(244,114,182,0.35)',
      titleColor: '#FDF4FF', subtitleColor: '#F5D0FE',
      statLabel: '#F0ABFC', statValue: '#F9A8D4', statBorder: 'rgba(244,114,182,0.35)',
      stageBorder: 'rgba(244,114,182,0.45)', stageBg: 'rgba(74,4,78,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#F9A8D4',
      glassBg: 'rgba(112,26,117,0.3)', glassBorder: 'rgba(244,114,182,0.4)',
      academyLabel: '👑 ROYAL OBSERVATORY',
    },
  },
  statue: {
    title: 'Marble Hall', emoji: '🗿', subtitle: 'Freeze like stone — ignore every distraction!',
    hero: '🧍', accent: '#22D3EE', accentDeep: '#0E7490', glow: 'rgba(34,211,238,0.5)',
    hintText: 'Stay perfectly still — ignore the silly distractions!',
    voiceIntro: 'Become a royal statue. Stay as still as you can!',
    voiceComplete: 'Amazing stillness! The kingdom is proud!',
    congrats: 'Master Statue!',
    chips: ['🗿 Freeze', '🧊 Still', '🏛️ Hall'],
    startLabel: '🗿 Enter Hall',
    backdrop: 'marble',
    shell: {
      gradient: ['#0C4A6E', '#075985', '#0E7490', '#22D3EE'],
      backText: '#CFFAFE', backBorder: 'rgba(34,211,238,0.35)',
      titleColor: '#F0FDFA', subtitleColor: '#99F6E4',
      statLabel: '#5EEAD4', statValue: '#2DD4BF', statBorder: 'rgba(45,212,191,0.35)',
      stageBorder: 'rgba(34,211,238,0.45)', stageBg: 'rgba(12,74,110,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#67E8F9',
      glassBg: 'rgba(14,116,144,0.3)', glassBorder: 'rgba(34,211,238,0.4)',
      academyLabel: '🗿 MARBLE HALL',
    },
  },
  freeze: {
    title: 'Command Bridge', emoji: '🚦', subtitle: 'Green sit tall · Yellow ready · Red freeze!',
    hero: '🦸‍♀️', accent: '#34D399', accentDeep: '#047857', glow: 'rgba(52,211,153,0.5)',
    hintText: 'Watch the light: GREEN sit tall, YELLOW ready, RED freeze!',
    voiceIntro: 'Follow the lights! Green sit tall, red freeze!',
    voiceComplete: 'Super reactions! You followed every light!',
    congrats: 'Freeze Master!',
    chips: ['🟢 Go', '🔴 Stop', '🚦 Signal'],
    startLabel: '🚦 Launch Bridge',
    backdrop: 'bridge',
    shell: {
      gradient: ['#14532D', '#166534', '#15803D', '#22C55E'],
      backText: '#BBF7D0', backBorder: 'rgba(74,222,128,0.35)',
      titleColor: '#F0FDF4', subtitleColor: '#86EFAC',
      statLabel: '#4ADE80', statValue: '#22C55E', statBorder: 'rgba(74,222,128,0.35)',
      stageBorder: 'rgba(74,222,128,0.45)', stageBg: 'rgba(20,83,45,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#86EFAC',
      glassBg: 'rgba(22,101,52,0.3)', glassBorder: 'rgba(74,222,128,0.4)',
      academyLabel: '🚦 COMMAND BRIDGE',
    },
  },
  reach: {
    title: 'Nebula Deck', emoji: '🌟', subtitle: 'Reach for falling stars — stay balanced!',
    hero: '🚀', accent: '#A78BFA', accentDeep: '#6D28D9', glow: 'rgba(167,139,250,0.55)',
    hintText: 'Reach toward each star, then sit back tall and balanced!',
    voiceIntro: 'Reach out and grab the stars, then sit back tall!',
    voiceComplete: 'You caught the stars and kept your balance! Stellar!',
    congrats: 'Star Catcher Hero!',
    chips: ['🌟 Stars', '🚀 Reach', '⚖️ Balance'],
    startLabel: '🚀 Launch Deck',
    backdrop: 'nebula',
    shell: {
      gradient: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1'],
      backText: '#E0E7FF', backBorder: 'rgba(129,140,248,0.35)',
      titleColor: '#EEF2FF', subtitleColor: '#C7D2FE',
      statLabel: '#A5B4FC', statValue: '#818CF8', statBorder: 'rgba(129,140,248,0.35)',
      stageBorder: 'rgba(129,140,248,0.45)', stageBg: 'rgba(30,27,75,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE68A',
      glassBg: 'rgba(67,56,202,0.3)', glassBorder: 'rgba(129,140,248,0.4)',
      academyLabel: '🌟 NEBULA DECK',
    },
  },
};

/** @deprecated Use POSTURE_GAME_THEMES[mode].shell instead */
export const HERO_SHELL = POSTURE_GAME_THEMES.powerSit.shell;

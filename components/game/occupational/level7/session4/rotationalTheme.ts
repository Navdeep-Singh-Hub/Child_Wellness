/**
 * OT Level 7 · Session 4 — "Rotational Processing"
 * Swirling vortex palette (deep violet → magenta → cyan → silver).
 */

export type RotationalMode = 'tornadoTurn' | 'spinAndStop' | 'helicopterPilot' | 'orbitHunt' | 'turnAndPoint';

export const ROTATIONAL_SHELL = {
  gradient: ['#1A0533', '#581C87', '#DB2777', '#22D3EE'] as [string, string, string, string],
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#F0ABFC',
  statLabel: '#C084FC',
  statValue: '#FEF3C7',
  statBorder: 'rgba(192,132,252,0.4)',
  stageBorder: 'rgba(192,132,252,0.45)',
  stageBg: 'rgba(26,5,51,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#E9D5FF',
} as const;

export type RotationalGameTheme = {
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
};

export const ROTATIONAL_GAME_THEMES: Record<RotationalMode, RotationalGameTheme> = {
  tornadoTurn: {
    title: 'Tornado Turn',
    subtitle: 'Become a tornado — spin slowly, then STOP on command!',
    emoji: '🌀',
    hero: '🌪️',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.55)',
    hintText: 'Turn slowly and controlled — freeze when you see STOP!',
    voiceIntro: 'Tornado power! Spin slowly and stop when commanded!',
    voiceComplete: 'Amazing tornado control! Every stop was perfect!',
    congrats: 'Tornado Master!',
    collectible: '⚡',
  },
  spinAndStop: {
    title: 'Spin & Stop',
    subtitle: 'Spin the magic wheel slowly — stop when the target appears!',
    emoji: '🔄',
    hero: '🎡',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.5)',
    hintText: 'Spin slowly… then FREEZE when STOP appears!',
    voiceIntro: 'Spin the magic wheel! Stop exactly when the target shows!',
    voiceComplete: 'Perfect spin and stop! Great balance recovery!',
    congrats: 'Spin & Stop Champion!',
    collectible: '🎯',
  },
  helicopterPilot: {
    title: 'Helicopter Pilot',
    subtitle: 'Fly through checkpoints — rotate toward each one with balance!',
    emoji: '🚁',
    hero: '🚁',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    hintText: 'Rotate toward each checkpoint — stay balanced while turning!',
    voiceIntro: 'You are the pilot! Rotate to each checkpoint and hold steady!',
    voiceComplete: 'All checkpoints cleared! Skilled helicopter pilot!',
    congrats: 'Helicopter Pilot Ace!',
    collectible: '🏁',
  },
  orbitHunt: {
    title: 'Orbit Hunt',
    subtitle: 'Catch stars orbiting around you — turn to each one!',
    emoji: '⭐',
    hero: '✨',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Stars are orbiting! Turn to catch each one!',
    voiceIntro: 'Stars are orbiting! Turn to catch every shining star!',
    voiceComplete: 'Every star caught! Stellar rotational awareness!',
    congrats: 'Orbit Hunt Hero!',
    collectible: '⭐',
  },
  turnAndPoint: {
    title: 'Turn & Point',
    subtitle: 'Turn your body, then point your head at the hidden target!',
    emoji: '🎯',
    hero: '🎯',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Turn first, then point your head at the target!',
    voiceIntro: 'Turn around, then point at the hidden target!',
    voiceComplete: 'Every target found! Master of turn and point!',
    congrats: 'Turn & Point Champion!',
    collectible: '💫',
  },
};

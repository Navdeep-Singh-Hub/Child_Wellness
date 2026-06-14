/**
 * OT Level 7 · Session 6 — "Visual-Vestibular Integration"
 * Deep-space palette (cosmic indigo → nebula violet → aqua → star gold).
 */

export type VisualVestibularMode = 'rocketFollow' | 'butterflyChase' | 'balloonDrift' | 'ufoWatch' | 'orbitTracker';

export const VISUAL_VESTIBULAR_SHELL = {
  gradient: ['#0B1026', '#312E81', '#0E7490', '#FBBF24'] as [string, string, string, string],
  backText: '#C7D2FE',
  backBorder: 'rgba(199,210,254,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#A5B4FC',
  statLabel: '#818CF8',
  statValue: '#FDE68A',
  statBorder: 'rgba(129,140,248,0.4)',
  stageBorder: 'rgba(129,140,248,0.45)',
  stageBg: 'rgba(11,16,38,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#A5B4FC',
} as const;

export type VisualVestibularGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  targetEmoji: string;
  commandLabel: string;
  commandCue: string;
  accent: string;
  accentDeep: string;
  glow: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const VISUAL_VESTIBULAR_THEMES: Record<VisualVestibularMode, VisualVestibularGameTheme> = {
  rocketFollow: {
    title: 'Rocket Follow',
    subtitle: 'Follow the rocket through space while you keep moving!',
    emoji: '🚀',
    hero: '🚀',
    targetEmoji: '🚀',
    commandLabel: '🚀 FOLLOW ROCKET',
    commandCue: 'Track the rocket across space!',
    accent: '#818CF8',
    accentDeep: '#4338CA',
    glow: 'rgba(129,140,248,0.55)',
    hintText: 'Keep your eyes and head on the rocket — stay balanced!',
    voiceIntro: 'Follow the rocket through space! Track it with your head and stay balanced!',
    voiceComplete: 'You followed the rocket the whole way! Amazing tracking!',
    congrats: 'Rocket Tracking Champion!',
  },
  butterflyChase: {
    title: 'Butterfly Chase',
    subtitle: 'Catch magical butterflies fluttering around the garden!',
    emoji: '🦋',
    hero: '🦋',
    targetEmoji: '🦋',
    commandLabel: '🦋 CHASE BUTTERFLY',
    commandCue: 'Follow the butterfly smoothly!',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Track each butterfly smoothly while keeping your balance!',
    voiceIntro: 'Catch the magical butterflies! Follow them smoothly and keep your balance!',
    voiceComplete: 'You caught every butterfly! Beautiful smooth tracking!',
    congrats: 'Butterfly Chaser Champion!',
  },
  balloonDrift: {
    title: 'Balloon Drift',
    subtitle: 'Follow the drifting balloons across the sky!',
    emoji: '🎈',
    hero: '🎈',
    targetEmoji: '🎈',
    commandLabel: '🎈 FOLLOW BALLOON',
    commandCue: 'Watch the balloon drift and move with it!',
    accent: '#FB7185',
    accentDeep: '#BE123C',
    glow: 'rgba(251,113,133,0.5)',
    hintText: 'Watch the balloon and move toward it without losing balance!',
    voiceIntro: 'Follow the drifting balloons! Move toward them and stay balanced!',
    voiceComplete: 'You reached every balloon! Wonderful visual tracking!',
    congrats: 'Balloon Drift Champion!',
  },
  ufoWatch: {
    title: 'UFO Watch',
    subtitle: 'Track UFOs darting in changing directions and speeds!',
    emoji: '🛸',
    hero: '🛸',
    targetEmoji: '🛸',
    commandLabel: '🛸 TRACK UFO',
    commandCue: 'Follow the UFO — it moves unpredictably!',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Stay alert and track the UFO wherever it goes!',
    voiceIntro: 'Watch the UFOs! They move in surprising ways — track them carefully!',
    voiceComplete: 'You tracked every UFO! Super sharp eyes!',
    congrats: 'UFO Watch Champion!',
  },
  orbitTracker: {
    title: 'Orbit Tracker',
    subtitle: 'Follow stars orbiting the galaxy — walk, track and balance!',
    emoji: '⭐',
    hero: '🌌',
    targetEmoji: '⭐',
    commandLabel: '⭐ TRACK ORBIT',
    commandCue: 'Follow the orbiting star around the galaxy!',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Follow the orbiting stars smoothly and keep steady balance!',
    voiceIntro: 'Follow the orbiting stars! Track them smoothly and keep your balance!',
    voiceComplete: 'You followed every star around the galaxy! A true space explorer!',
    congrats: 'Orbit Tracker Champion!',
  },
};

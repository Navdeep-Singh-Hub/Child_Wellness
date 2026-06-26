import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

/** Triadic night palette — deep cosmos, golden comet, cyan starlight accents. */
export const STAR_HUNT_THEME: Session2ThemeTokens = {
  sky: ['#0B1026', '#1E1B4B', '#312E81', '#4338CA'],
  title: '#FEF9C3',
  subtitle: '#C4B5FD',
  accent: '#FBBF24',
  accentDark: '#F59E0B',
  hudGlass: 'rgba(15,23,42,0.82)',
  hudBorder: 'rgba(167,139,250,0.35)',
  cue: '#FDE68A',
};

export const STAR_HUNT_COPY = {
  title: 'Star Hunt',
  emoji: '⭐',
  tagline: 'Cosmic Chase · Predictive Tracking',
  body: 'A golden comet star darts across the night sky in unpredictable bursts. React fast and tap it before it vanishes to another corner!',
  chips: ['⭐ Chase', '⚡ React', '🌌 Night sky'],
  startLabel: 'Launch the Hunt',
  startGradient: ['#FBBF24', '#F59E0B', '#D97706'] as const,
  ttsIntro: 'Chase the comet star! It darts in unpredictable directions.',
  ttsCue: 'Catch the comet star!',
  ttsSuccess: 'Star caught!',
  ttsComplete: 'Amazing star hunting! You are a constellation hunter!',
  congrats: 'Constellation Hunter!',
  logType: 'chase-the-star',
  skillTags: ['predictive-tracking', 'visual-tracking', 'reaction-time'] as const,
  rootBg: '#0B1026',
} as const;

export const COSMOS = {
  moonGlow: 'rgba(254,240,138,0.35)',
  nebula: 'rgba(139,92,246,0.18)',
  starDim: 'rgba(255,255,255,0.35)',
  starBright: 'rgba(255,255,255,0.9)',
  cometCore: '#FDE68A',
  cometTail: 'rgba(251,191,36,0.55)',
  cometRing: 'rgba(253,224,71,0.5)',
} as const;

export const COMET_SIZE = 68;

import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

/** Analogous meadow palette — calm greens with golden pollen reward accents. */
export const BUTTERFLY_TRAIL_THEME: Session2ThemeTokens = {
  sky: ['#E0F2FE', '#BAE6FD', '#86EFAC', '#4ADE80'],
  title: '#14532D',
  subtitle: '#166534',
  accent: '#FBBF24',
  accentDark: '#D97706',
  hudGlass: 'rgba(255,255,255,0.78)',
  hudBorder: 'rgba(255,255,255,0.55)',
  cue: '#047857',
};

export const BUTTERFLY_TRAIL_COPY = {
  title: 'Butterfly Trail',
  emoji: '🦋',
  tagline: 'Enchanted Meadow · Smooth Pursuit',
  body: 'A golden butterfly dances along a secret meadow path. Glide your finger onto its wings and stay close — fill the nectar jar to complete each trail!',
  chips: ['👆 Finger trail', '🦋 Follow', '🍯 Nectar'],
  startLabel: 'Enter the Meadow',
  startGradient: ['#34D399', '#10B981', '#059669'] as const,
  ttsIntro: 'Follow the butterfly with your finger. Stay close for three seconds!',
  ttsCue: 'Glide onto the butterfly and stay close!',
  ttsSuccess: 'Nectar collected!',
  ttsComplete: 'Beautiful butterfly following! You are a trail guardian!',
  ttsOffTrail: 'Stay on the butterfly path!',
  congrats: 'Trail Guardian!',
  logType: 'follow-the-butterfly',
  skillTags: ['smooth-pursuit', 'visual-tracking', 'eye-hand-coordination'] as const,
  rootBg: '#14532D',
} as const;

export const MEADOW = {
  hillDark: '#15803D',
  hillLight: '#22C55E',
  grass: ['#166534', '#15803D', '#14532D'] as const,
  flowerColors: ['#F472B6', '#A78BFA', '#FBBF24', '#FB7185', '#60A5FA'],
  orbitStroke: 'rgba(251,191,36,0.35)',
  tether: 'rgba(52,211,153,0.55)',
  butterflyBody: '#059669',
  butterflyWing: '#34D399',
  butterflyWingTip: '#A7F3D0',
  fingerCore: '#FDE68A',
  fingerGlow: 'rgba(251,191,36,0.45)',
} as const;

export const BUTTERFLY_SIZE = 72;

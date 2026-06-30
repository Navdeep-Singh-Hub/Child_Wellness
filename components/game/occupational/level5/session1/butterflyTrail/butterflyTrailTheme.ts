<<<<<<< HEAD
/**
 * Design tokens — OT Level 5 Session 1 · Game 2 · Butterfly Trail
 * Palette: meadow greens + blossom pinks + golden sunlight (organic, calming)
 * Theory: analogous harmony (green→teal) with warm pink accents for delight
 */

export const BUTTERFLY_TRAIL_THEME = {
  sky: ['#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC'] as const,
  meadow: ['#14532D', '#166534', '#15803D', '#22C55E', '#4ADE80'] as const,
  meadowStripe: 'rgba(255,255,255,0.06)',
  flowerPink: '#F9A8D4',
  flowerPurple: '#C084FC',
  flowerYellow: '#FDE047',
  flowerOrange: '#FB923C',
  petal: 'rgba(251,207,232,0.7)',
  sunlight: 'rgba(253,224,71,0.35)',
  sunlightGlow: 'rgba(253,224,71,0.55)',
  butterflyBody: '#78350F',
  wingOrange: '#FB923C',
  wingPink: '#F472B6',
  wingYellow: '#FACC15',
  wingPattern: '#7C2D12',
  trailDust: 'rgba(250,204,21,0.55)',
  fingerGlow: 'rgba(52,211,153,0.45)',
  fingerCore: '#34D399',
  fingerRing: 'rgba(16,185,129,0.6)',
  connectionLine: 'rgba(52,211,153,0.35)',
  nectarFill: '#F472B6',
  nectarEmpty: 'rgba(255,255,255,0.5)',
  nectarBorder: 'rgba(244,114,182,0.5)',
  hudGlass: 'rgba(255,255,255,0.88)',
  hudBorder: 'rgba(255,255,255,0.6)',
  title: '#064E3B',
  subtitle: '#047857',
  accent: '#10B981',
  accentDark: '#047857',
  accentWarm: '#F472B6',
  success: '#22C55E',
  successGlow: 'rgba(34,197,94,0.4)',
  sparkle: '#FDE047',
} as const;
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")

export const BUTTERFLY_TRAIL_COPY = {
  title: 'Butterfly Trail',
  emoji: '🦋',
<<<<<<< HEAD
  subtitle: 'Follow the butterfly through the garden',
  introDescription:
    'A butterfly flutters through a sunny meadow. Keep your finger close to it for 3 seconds to collect nectar from each flower stop!',
  skills: ['Smooth pursuit', 'Visual tracking', 'Eye–hand coordination', 'Sustained focus'],
  ttsIntro: 'Welcome to Butterfly Trail! Follow the butterfly with your finger through the garden!',
  ttsCue: 'Keep your finger on the butterfly!',
  ttsFollowing: 'Stay close…',
  ttsSuccess: 'Nectar collected!',
  ttsComplete: 'Wonderful! You followed every butterfly in the garden!',
  congratsMessage: 'Garden Guardian!',
  logType: 'follow-the-butterfly',
  skillTags: ['smooth-pursuit', 'visual-tracking', 'eye-hand-coordination'],
  followHint: '👆 Keep your finger on the butterfly!',
  progressHint: 'Collecting nectar…',
} as const;
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")

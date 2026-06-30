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

export const BUTTERFLY_TRAIL_COPY = {
  title: 'Butterfly Trail',
  emoji: '🦋',
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

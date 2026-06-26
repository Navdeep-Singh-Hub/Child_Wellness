/** Shared design tokens for Special Education — Section 1 (Free Hand / Gripping) */

export const GRIP_SESSION = {
  fonts: {
    title: { fontWeight: '900' as const },
    subtitle: { fontWeight: '600' as const },
    body: { fontWeight: '500' as const },
    label: { fontWeight: '700' as const },
  },
  radius: {
    card: 24,
    button: 18,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: '#7C2D12',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },
} as const;

/** Game 1 — Rainbow Scribble Studio */
export const SCRIBBLE_STUDIO_THEME = {
  id: 'scribble-studio',
  name: 'Rainbow Scribble Studio',
  mascot: '🎨',
  mascotName: 'Palette Pete',
  gradient: ['#FFF1F2', '#FFEDD5', '#FDE68A', '#FBCFE8'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#EA580C',
  accentSoft: '#FB923C',
  accentDeep: '#9A3412',
  ink: '#431407',
  inkMuted: '#9A3412',
  canvas: '#FFFBEB',
  canvasBorder: '#FDBA74',
  canvasDots: 'rgba(234, 88, 12, 0.08)',
  paperShadow: '#F97316',
  clearBg: 'rgba(255,255,255,0.85)',
  clearBorder: 'rgba(234, 88, 12, 0.25)',
  doneGradient: ['#F97316', '#EA580C', '#C2410C'] as const,
  sparkle: '#FBBF24',
  prompts: [
    'Touch anywhere and drag to scribble!',
    'Use your whole hand — make big swirls!',
    'Every color is a surprise — keep going!',
    'Wonderful marks! Add a few more if you like.',
    'Your studio masterpiece is taking shape!',
  ],
} as const;

/** Game 2 — Butterfly Garden Paint */
export const GARDEN_FILL_THEME = {
  id: 'garden-fill',
  name: 'Butterfly Garden Paint',
  mascot: '🦋',
  mascotName: 'Flutter',
  gradient: ['#ECFDF5', '#D1FAE5', '#BBF7D0', '#FEF9C3'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#059669',
  accentSoft: '#34D399',
  accentDeep: '#047857',
  ink: '#064E3B',
  inkMuted: '#047857',
  canvas: '#F0FDF4',
  canvasBorder: '#86EFAC',
  outlineEmpty: '#6EE7B7',
  outlineActive: '#10B981',
  outlineGlow: 'rgba(16, 185, 129, 0.35)',
  bloomGradient: ['#34D399', '#10B981', '#059669'] as const,
  sparkle: '#FDE047',
  shapes: [
    {
      key: 'butterfly',
      label: 'Butterfly',
      emoji: '🦋',
      outlineColor: '#A855F7',
      fillHint: 'rgba(168, 85, 247, 0.12)',
      intro: 'Scribble inside the butterfly wings with colorful strokes!',
      done: 'What a beautiful butterfly!',
    },
    {
      key: 'flower',
      label: 'Flower',
      emoji: '🌸',
      outlineColor: '#EC4899',
      fillHint: 'rgba(236, 72, 153, 0.12)',
      intro: 'Now fill every petal of the flower with bright colors!',
      done: 'Your garden flower is blooming!',
    },
  ],
  prompts: [
    'Stay inside the lines and scribble to fill the shape!',
    'Great coloring — keep scribbling to cover more area!',
    'Almost blooming — a little more color!',
    'Wonderful! The garden is coming alive!',
  ],
} as const;

/** Game 3 — Star Pop Cosmos */
export const DOT_POP_THEME = {
  id: 'dot-pop',
  name: 'Star Pop Cosmos',
  mascot: '🌟',
  mascotName: 'Nova',
  gradient: ['#0F172A', '#1E1B4B', '#312E81', '#4C1D95'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#FBBF24',
  accentSoft: '#FDE047',
  accentDeep: '#F59E0B',
  ink: '#F8FAFC',
  inkMuted: '#C4B5FD',
  canvas: '#1E293B',
  canvasBorder: '#6366F1',
  canvasStars: 'rgba(251, 191, 36, 0.15)',
  popRing: 'rgba(251, 191, 36, 0.6)',
  doneGradient: ['#FDE047', '#FBBF24', '#F59E0B'] as const,
  tapsGoal: 10,
  prompts: [
    'Tap anywhere to pop a colorful star!',
    'Nice tap! Each touch leaves a bright dot.',
    'You are building a constellation — keep tapping!',
    'So many stars! A few more to light up the sky.',
    'The cosmos is glowing — almost complete!',
  ],
  milestones: [3, 6, 10] as const,
  milestoneMsgs: {
    3: 'Three stars shining!',
    6: 'Halfway across the galaxy!',
    10: 'Constellation complete!',
  },
} as const;

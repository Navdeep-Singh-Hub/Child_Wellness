/**
 * Aurora Sketch Studio — visual identity for Free Scribbling (Game 1).
 * Complementary palette: deep indigo space + aurora greens/violets + warm gold accent.
 */
export const AURORA = {
  // Background layers
  spaceDeep: '#0C1222',
  spaceMid: '#151B33',
  auroraGreen: '#34D399',
  auroraMint: '#6EE7B7',
  auroraViolet: '#8B5CF6',
  auroraPink: '#C084FC',
  auroraBlue: '#38BDF8',

  // Canvas — warm paper (high contrast on dark surround)
  paper: '#FFFBF5',
  paperShadow: 'rgba(251, 191, 36, 0.25)',
  paperBorder: '#FDE68A',

  // Accents — gold complements violet (split-complementary)
  gold: '#FBBF24',
  goldLight: '#FEF3C7',
  goldDark: '#D97706',

  // UI text
  textOnDark: '#F8FAFC',
  textMuted: '#94A3B8',
  textOnPaper: '#1E293B',

  // Actions
  clearBg: 'rgba(255,255,255,0.12)',
  clearBorder: 'rgba(255,255,255,0.2)',
  doneDisabled: 'rgba(139, 92, 246, 0.35)',
  doneActive: '#8B5CF6',
  doneGlow: 'rgba(139, 92, 246, 0.55)',
} as const;

export const GAME1_CONFIG = {
  minStrokes: 4,
  brushSize: 16,
  mascotName: 'Pip',
} as const;

export const ENCOURAGEMENTS = [
  'Beautiful swirl!',
  'Keep going!',
  'So colorful!',
  'Amazing line!',
  'You\'re an artist!',
  'Wow, nice move!',
] as const;

export const HINTS = {
  idle: 'Drag your finger to paint the sky!',
  started: 'Make a few more strokes…',
  almost: 'Almost there — one more!',
  ready: 'Your masterpiece is ready!',
} as const;

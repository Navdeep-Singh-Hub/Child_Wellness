/** Garden Bloom Studio — visual identity for Color Scribble Fill (Game 2). */
export const MEADOW = {
  skyTop: '#7DD3FC',
  skyMid: '#BAE6FD',
  skyBottom: '#ECFDF5',
  grass: '#4ADE80',
  grassDark: '#16A34A',
  grassDeep: '#14532D',

  coral: '#FB7185',
  coralLight: '#FDA4AF',
  sunflower: '#FBBF24',
  sunflowerLight: '#FDE68A',
  violet: '#A78BFA',
  violetLight: '#DDD6FE',

  paper: '#FFFBEB',
  paperBorder: '#FDE68A',

  textOnLight: '#14532D',
  textMuted: '#4B7A5C',
  textOnDark: '#F0FDF4',

  clearBg: 'rgba(255,255,255,0.55)',
  clearBorder: 'rgba(20,83,45,0.15)',
} as const;

export const GAME2_CONFIG = {
  fillThreshold: 0.6,
  brushSize: 14,
  mascotName: 'Flutter',
} as const;

export const BLOOM_SHAPES = [
  {
    key: 'butterfly',
    label: 'Butterfly',
    emoji: '🦋',
    stroke: '#EC4899',
    strokeGlow: 'rgba(236,72,153,0.35)',
    fillHint: 'rgba(251,113,133,0.12)',
    intro: 'Scribble inside the butterfly wings to make it bloom!',
    success: 'The butterfly is blooming beautifully!',
  },
  {
    key: 'flower',
    label: 'Sunflower',
    emoji: '🌻',
    stroke: '#EAB308',
    strokeGlow: 'rgba(234,179,8,0.35)',
    fillHint: 'rgba(250,204,21,0.14)',
    intro: 'Fill every petal with colorful scribbles!',
    success: 'What a gorgeous sunflower!',
  },
] as const;

export const FILL_HINTS = {
  idle: 'Scribble back and forth inside the shape!',
  started: 'Nice! Keep coloring inside…',
  halfway: 'Halfway there — keep going!',
  almost: 'Almost bloomed — a little more!',
  ready: 'It\'s blooming! ✨',
} as const;

export function hintForRatio(ratio: number): string {
  if (ratio >= GAME2_CONFIG.fillThreshold) return FILL_HINTS.ready;
  if (ratio >= 0.5) return FILL_HINTS.almost;
  if (ratio >= 0.3) return FILL_HINTS.halfway;
  if (ratio > 0.05) return FILL_HINTS.started;
  return FILL_HINTS.idle;
}

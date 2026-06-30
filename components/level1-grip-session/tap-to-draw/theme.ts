/** Dot Galaxy — visual identity for Tap to Draw (Game 3). */
export const GALAXY = {
  void: '#0B0D21',
  nebulaPurple: '#4C1D95',
  nebulaBlue: '#1E3A8A',
  nebulaPink: '#831843',
  starGold: '#FDE047',
  starWhite: '#F8FAFC',
  cosmicCyan: '#22D3EE',
  cosmicMagenta: '#E879F9',

  panel: 'rgba(255,255,255,0.08)',
  panelBorder: 'rgba(255,255,255,0.14)',
  canvas: '#0F172A',
  canvasBorder: 'rgba(34,211,238,0.35)',

  textPrimary: '#F1F5F9',
  textMuted: '#94A3B8',
  accent: '#22D3EE',
} as const;

export const GAME3_CONFIG = {
  tapsRequired: 10,
  brushSize: 24,
  mascotName: 'Nova',
} as const;

export const TAP_HINTS = {
  idle: 'Tap anywhere to place a star!',
  started: (n: number, goal: number) => `${n} of ${goal} stars placed…`,
  almost: (left: number) => `Just ${left} more star${left === 1 ? '' : 's'}!`,
  ready: 'Constellation complete!',
} as const;

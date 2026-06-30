/** Masterpiece Gallery — visual identity for Scribble Upload (Game 5). */
export const GALLERY = {
  wall: '#F5F0E8',
  wallDark: '#E8DFD0',
  frameGold: '#C9A227',
  frameGoldLight: '#F5E6A3',
  frameBrown: '#8B6914',
  spotlight: 'rgba(255,248,220,0.6)',
  velvet: '#4A1942',
  velvetLight: '#6B2D5B',

  textDark: '#3D2914',
  textMuted: '#7C6A58',
  textLight: '#FFFBF5',

  success: '#16A34A',
  successBg: '#DCFCE7',
  tryBg: '#FEF3C7',
  tryBorder: '#F59E0B',

  accent: '#C9A227',
  panel: 'rgba(255,255,255,0.92)',
} as const;

export const GAME5_CONFIG = {
  mascotName: 'Curator',
} as const;

export const UPLOAD_STEPS = [
  { id: 1, label: 'Scribble', icon: '✏️', hint: 'Draw freely on real paper' },
  { id: 2, label: 'Capture', icon: '📸', hint: 'Take a photo of your art' },
  { id: 3, label: 'Exhibit', icon: '🖼️', hint: 'Share it in the gallery' },
] as const;

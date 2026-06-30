/** Moon Arch Bridge — night river tracing theme. */
export const MOON_BRIDGE = {
  skyTop: '#0F172A',
  skyMid: '#1E1B4B',
  skyBottom: '#312E81',
  moon: '#FDE68A',
  moonGlow: 'rgba(253,230,138,0.35)',
  water: '#1E40AF',
  waterLight: '#3B82F6',
  waterGlow: 'rgba(59,130,246,0.3)',
  bridge: '#A5B4FC',
  bridgeGlow: '#818CF8',
  dotIdle: '#6366F1',
  dotActive: '#FBBF24',
  dotDone: '#34D399',
  guide: 'rgba(165,180,252,0.5)',
  panel: 'rgba(255,255,255,0.08)',
  panelBorder: 'rgba(165,180,252,0.3)',
  textLight: '#E0E7FF',
  textMuted: '#A5B4FC',
  accent: '#818CF8',
  success: '#34D399',
} as const;

export const SHELL_MOON = {
  bg: '#0F172A',
  labelColor: '#A5B4FC',
  titleColor: '#E0E7FF',
  textOnDark: '#E0E7FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(165,180,252,0.3)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#818CF8',
  dotDone: '#34D399',
} as const;

export const STAGE_HINTS: Record<string, string> = {
  semi: 'Trace the moon arch across the bridge!',
  wave: 'Follow the river wave from shore to shore!',
  circle: 'Circle the glowing lighthouse beacon!',
};

export const STAGE_LABELS: Record<string, string> = {
  semi: 'Moon Arch',
  wave: 'River Wave',
  circle: 'Lighthouse Ring',
};

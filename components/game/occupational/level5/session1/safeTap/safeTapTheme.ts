/**
 * Design tokens — OT Level 5 Session 1 · Game 3 · Safe Tap
 * Palette: deep cavern blues/purples + emerald safe gems + crimson danger
 * Theory: complementary contrast (green safe vs red danger) for selective attention
 */

export const SAFE_TAP_THEME = {
  cavern: ['#0F172A', '#1E1B4B', '#312E81', '#4338CA'] as const,
  cavernFloor: ['#1E293B', '#334155', '#475569', '#64748B'] as const,
  crystal: '#34D399',
  crystalGlow: 'rgba(52,211,153,0.55)',
  crystalCore: '#6EE7B7',
  crystalDark: '#059669',
  mine: '#DC2626',
  mineGlow: 'rgba(239,68,68,0.45)',
  mineFuse: '#FBBF24',
  mineSpark: '#FDE047',
  dangerZone: 'rgba(239,68,68,0.18)',
  safeZone: 'rgba(52,211,153,0.15)',
  stalactite: '#475569',
  stalagmite: '#64748B',
  gemLight: 'rgba(110,231,183,0.35)',
  hudGlass: 'rgba(255,255,255,0.1)',
  hudBorder: 'rgba(255,255,255,0.2)',
  title: '#F0FDF4',
  subtitle: '#A7F3D0',
  accent: '#34D399',
  accentDark: '#047857',
  danger: '#EF4444',
  dangerDark: '#B91C1C',
  success: '#22C55E',
  miss: 'rgba(148,163,184,0.5)',
} as const;

export const SAFE_TAP_COPY = {
  title: 'Safe Tap',
  emoji: '💎',
  subtitle: 'Tap the crystal · Avoid the mines',
  introDescription:
    'Deep in a crystal cavern, glowing gems are safe to tap — but red mines will spark if you touch them! Use focus to pick only the safe target.',
  skills: ['Selective attention', 'Impulse control', 'Visual discrimination', 'Focused tapping'],
  ttsIntro: 'Welcome to Safe Tap! Tap the glowing crystal and avoid the red mines!',
  ttsCue: 'Tap the crystal only!',
  ttsSuccess: 'Crystal collected!',
  ttsBomb: 'Mine triggered! Avoid the red ones!',
  ttsComplete: 'Amazing focus! You mastered the crystal cavern!',
  congratsMessage: 'Cavern Explorer!',
  logType: 'avoid-the-bomb',
  skillTags: ['focus', 'control', 'selective-attention'],
  tapHint: '💎 Tap the green crystal only!',
  bombHint: '💥 Avoid the red mines!',
  missHint: 'Not quite — aim for the crystal!',
} as const;

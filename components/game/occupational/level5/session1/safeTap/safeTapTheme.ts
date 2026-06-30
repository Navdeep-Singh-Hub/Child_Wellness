<<<<<<< HEAD
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
=======
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

/** Complementary go/no-go palette — emerald safe vs crimson danger on a dark ops grid. */
export const SAFE_TAP_THEME: Session2ThemeTokens = {
  sky: ['#0F172A', '#1E293B', '#134E4A', '#115E59'],
  title: '#ECFDF5',
  subtitle: '#99F6E4',
  accent: '#34D399',
  accentDark: '#059669',
  hudGlass: 'rgba(15,23,42,0.82)',
  hudBorder: 'rgba(52,211,153,0.35)',
  cue: '#6EE7B7',
};

export const SAFE_TAP_COPY = {
  title: 'Safe Tap',
  emoji: '🛡️',
  tagline: 'Clearance Zone · Selective Attention',
  body: 'Green shields are safe — tap them! Red mines are danger — never touch. Three mines drift around each round. Choose wisely!',
  chips: ['🛡️ Safe tap', '💣 Avoid', '🎯 Focus'],
  startLabel: 'Enter Clearance Zone',
  startGradient: ['#34D399', '#10B981', '#059669'] as const,
  dangerGradient: ['#F87171', '#EF4444', '#DC2626'] as const,
  ttsIntro: 'Tap the green shield and avoid the red mines!',
  ttsCue: 'Tap safe, avoid danger!',
  ttsSuccess: 'Target secured!',
  ttsBomb: 'Danger! Avoid the mines!',
  ttsComplete: 'Excellent focus and control! Clearance complete!',
  congrats: 'Clearance Agent!',
  logType: 'avoid-the-bomb',
  skillTags: ['focus', 'control', 'selective-attention'] as const,
  rootBg: '#0F172A',
} as const;

export const ZONE = {
  gridLine: 'rgba(52,211,153,0.12)',
  scanLine: 'rgba(52,211,153,0.25)',
  caution: '#FBBF24',
  safeGlow: '#34D399',
  safeCore: '#059669',
  safeRing: 'rgba(110,231,183,0.45)',
  dangerGlow: '#EF4444',
  dangerCore: '#B91C1C',
  dangerRing: 'rgba(248,113,113,0.5)',
  dangerFlash: 'rgba(239,68,68,0.35)',
} as const;

export const TARGET_SIZE = 60;
export const MINE_SIZE = 52;
>>>>>>> parent of d0342ff (Revert "fgh")

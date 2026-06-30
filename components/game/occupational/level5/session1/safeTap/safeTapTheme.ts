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

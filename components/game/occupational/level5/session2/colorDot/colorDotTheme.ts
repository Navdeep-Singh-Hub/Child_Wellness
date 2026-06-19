import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export const COLOR_DOT_THEME: Session2ThemeTokens = {
  sky: ['#FDF4FF', '#FAE8FF', '#F3E8FF', '#EDE9FE'],
  title: '#5B21B6',
  subtitle: '#7C3AED',
  accent: '#A855F7',
  accentDark: '#6D28D9',
  hudGlass: 'rgba(255,255,255,0.88)',
  hudBorder: 'rgba(167,139,250,0.45)',
  cue: '#5B21B6',
};

export const COLOR_DOT_COPY = {
  title: 'Color Dot Hit',
  emoji: '🎨',
  tagline: 'Paint Studio · Visual Discrimination',
  body: 'The studio shows colorful paint dots. Listen for the target color, then tap the matching dot among the others!',
  chips: ['🎨 Color', '👀 Look', '👆 Tap'],
  startLabel: 'Open Studio',
  ttsComplete: 'Brilliant color matching! You are an artist!',
  congrats: 'Color Artist!',
  logType: 'color-dot-hit',
  skillTags: ['visual-discrimination', 'color-recognition', 'attention'],
} as const;

export const DOT_SIZE = 64;

export const COLORS = [
  { name: 'Red', emoji: '🔴', color: '#EF4444', glow: '#FCA5A5' },
  { name: 'Blue', emoji: '🔵', color: '#3B82F6', glow: '#93C5FD' },
  { name: 'Green', emoji: '🟢', color: '#10B981', glow: '#6EE7B7' },
  { name: 'Yellow', emoji: '🟡', color: '#EAB308', glow: '#FDE047' },
  { name: 'Purple', emoji: '🟣', color: '#8B5CF6', glow: '#C4B5FD' },
] as const;

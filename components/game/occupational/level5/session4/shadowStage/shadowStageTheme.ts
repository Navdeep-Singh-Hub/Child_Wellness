/**
 * Design tokens — OT Level 5 Session 4 · Game 3 · Shadow Stage
 * Palette: spotlight theater dark stage + pink spotlight accents
 */

export const SHADOW_STAGE_THEME = {
  stage: ['#0F0F14', '#1A1A24', '#2D2D3A', '#1F2937'] as const,
  curtain: '#7F1D1D',
  curtainDark: '#450A0A',
  spotlight: 'rgba(255,255,255,0.08)',
  spotlightBeam: 'rgba(255,255,255,0.05)',
  footlight: '#F472B6',
  footlightGlow: 'rgba(244,114,182,0.35)',
  stageLine: 'rgba(244,114,182,0.3)',
  puppetBg: 'rgba(255,255,255,0.92)',
  puppetBorder: 'rgba(255,255,255,0.6)',
  puppetSelect: '#F472B6',
  puppetSelectGlow: 'rgba(244,114,182,0.5)',
  shadow: 'rgba(0,0,0,0.82)',
  shadowBorder: 'rgba(244,114,182,0.35)',
  shadowEmoji: 'rgba(255,255,255,0.12)',
  match: '#34D399',
  matchGlow: 'rgba(52,211,153,0.4)',
  wrong: '#F87171',
  wrongGlow: 'rgba(248,113,113,0.35)',
  hudGlass: 'rgba(31,41,55,0.92)',
  hudBorder: 'rgba(244,114,182,0.4)',
  title: '#F9FAFB',
  subtitle: '#D1D5DB',
  accent: '#F472B6',
  accentDark: '#EC4899',
} as const;

export const SHADOW_STAGE_COPY = {
  title: 'Shadow Stage',
  emoji: '🎭',
  subtitle: 'Spotlight Theater · Depth Match',
  introDescription:
    'On the shadow stage, colorful puppets perform above while their silhouettes wait below. Tap a puppet, then tap its matching shadow!',
  skills: ['Depth perception', 'Visual matching', 'Spatial awareness', 'Two-step planning'],
  ttsIntro: 'Welcome to Shadow Stage! Match each puppet to its shadow!',
  ttsCue: 'Tap the animal, then its shadow!',
  ttsSelect: 'Now tap the matching shadow!',
  ttsMatch: 'Perfect match!',
  ttsWrong: 'Try again! Find the right shadow.',
  ttsComplete: 'Bravo! You matched every shadow on stage!',
  congratsMessage: 'Shadow Star!',
  logType: 'match-shadow',
  skillTags: ['depth-perception', 'visual-matching', 'spatial-awareness'],
  hintSelect: '🎭 Tap a puppet on stage',
  hintShadow: '🕳️ Now tap its shadow!',
} as const;

/**
 * Design tokens — OT Level 5 Session 1 · Game 4 · Star Hunt
 * Palette: deep cosmos indigo + nebula violet + golden star accents
 * Theory: dark surround makes the golden target pop (figure-ground)
 */

export const STAR_HUNT_THEME = {
  space: ['#020617', '#0F172A', '#1E1B4B', '#312E81'] as const,
  nebula: ['rgba(99,102,241,0.25)', 'rgba(139,92,246,0.18)', 'rgba(236,72,153,0.12)', 'transparent'] as const,
  starGold: '#FBBF24',
  starCore: '#FDE047',
  starGlow: 'rgba(251,191,36,0.6)',
  starTail: 'rgba(253,224,71,0.45)',
  cometWhite: '#FFFBEB',
  bgStar: '#E2E8F0',
  bgStarDim: 'rgba(226,232,240,0.35)',
  constellation: 'rgba(148,163,184,0.25)',
  warpLine: 'rgba(167,139,250,0.5)',
  hudGlass: 'rgba(15,23,42,0.82)',
  hudBorder: 'rgba(251,191,36,0.35)',
  title: '#FFFBEB',
  subtitle: '#FDE68A',
  accent: '#FBBF24',
  accentDark: '#D97706',
  success: '#FACC15',
  successGlow: 'rgba(250,204,21,0.45)',
  nearMiss: '#A78BFA',
  nearMissGlow: 'rgba(167,139,250,0.4)',
  miss: 'rgba(148,163,184,0.4)',
} as const;

export const STAR_HUNT_COPY = {
  title: 'Star Hunt',
  emoji: '⭐',
  subtitle: 'Catch the darting star across the cosmos',
  introDescription:
    'A golden star zips unpredictably through the night sky. Watch its path, predict where it goes, and tap to catch it before it vanishes!',
  skills: ['Predictive tracking', 'Visual pursuit', 'Reaction timing', 'Focus'],
  ttsIntro: 'Welcome to Star Hunt! Chase the golden star through the cosmos!',
  ttsCue: 'Catch the star!',
  ttsSuccess: 'Star caught!',
  ttsNearMiss: 'So close! Keep chasing!',
  ttsComplete: 'Incredible! You hunted every star in the galaxy!',
  congratsMessage: 'Cosmic Hunter!',
  logType: 'chase-the-star',
  skillTags: ['predictive-tracking', 'visual-tracking', 'reaction-time'],
  chaseHint: '⭐ Watch the star — tap to catch!',
  nearMissHint: 'Almost caught it!',
  missHint: 'Keep your eyes on the star!',
} as const;

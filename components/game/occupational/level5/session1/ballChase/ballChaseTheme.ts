/**
 * Design tokens — OT Level 5 Session 1 · Game 1 · Ball Chase
 * Palette: stadium sky (cool) + pitch green (warm contrast) + gold highlights (reward)
 */

export const BALL_CHASE_THEME = {
  sky: ['#0369A1', '#0EA5E9', '#38BDF8', '#BAE6FD'] as const,
  grass: ['#14532D', '#166534', '#15803D', '#16A34A'] as const,
  grassStripe: 'rgba(255,255,255,0.06)',
  lineWhite: 'rgba(255,255,255,0.85)',
  crowd: '#0F172A',
  crowdSilhouette: 'rgba(15,23,42,0.55)',
  goalPost: '#F8FAFC',
  goalNet: 'rgba(255,255,255,0.35)',
  floodlight: '#FEF9C3',
  floodlightGlow: 'rgba(254,249,195,0.45)',
  accent: '#FACC15',
  accentDark: '#CA8A04',
  accentGlow: 'rgba(250,204,21,0.55)',
  ballWhite: '#FFFFFF',
  ballShadow: 'rgba(0,0,0,0.28)',
  hudGlass: 'rgba(255,255,255,0.82)',
  hudBorder: 'rgba(255,255,255,0.55)',
  title: '#0C4A6E',
  subtitle: '#0369A1',
  cue: '#14532D',
  success: '#16A34A',
  miss: 'rgba(239,68,68,0.85)',
  sparkle: '#FACC15',
} as const;

export const BALL_CHASE_COPY = {
  title: 'Ball Chase',
  emoji: '⚽',
  subtitle: 'Track the ball · Tap to score!',
  introDescription:
    'A soccer ball bounces across the pitch. Watch it move with your eyes, then tap it to score a goal. Each round gets a little faster!',
  skills: ['Visual tracking', 'Reaction timing', 'Hand–eye coordination', 'Focused attention'],
  suitableFor:
    'Children building smooth eye movement and quick, accurate taps on moving targets.',
  ttsIntro: 'Welcome to Ball Chase! Watch the ball bounce, then tap to score!',
  ttsCue: 'Tap the ball!',
  ttsSuccess: 'Goal!',
  ttsComplete: 'Amazing ball chasing! You are a star striker!',
  congratsMessage: 'Striker Star!',
  logType: 'catch-the-ball',
  skillTags: ['visual-tracking', 'reaction-time', 'moving-object'],
} as const;

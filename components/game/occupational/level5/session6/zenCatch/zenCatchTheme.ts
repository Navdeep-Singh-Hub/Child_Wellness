/** Design tokens — OT Level 5 Session 6 · Game 2 · Zen Catch */
export const ZEN_CATCH_THEME = {
  sky: ['#052E16', '#14532D', '#166534', '#22C55E'] as const,
  hill: 'rgba(34,197,94,0.2)',
  grass: 'rgba(74,222,128,0.15)',
  ball: '#22C55E',
  ballGlow: 'rgba(74,222,128,0.45)',
  petal: '#F9A8D4',
  hudGlass: 'rgba(20,83,45,0.9)',
  hudBorder: 'rgba(74,222,128,0.4)',
  title: '#BBF7D0',
  subtitle: '#86EFAC',
  accent: '#4ADE80',
  accentDark: '#22C55E',
} as const;

export const ZEN_CATCH_COPY = {
  title: 'Zen Catch',
  emoji: '🐢',
  subtitle: 'Meadow Pace · Controlled Timing',
  introDescription: 'A gentle ball drifts through the calm meadow. Take your time and tap with steady, controlled precision.',
  ttsIntro: 'Welcome to Zen Catch! Tap the slow drifting ball!',
  ttsStart: 'Catch the slow ball!',
  ttsSuccess: 'Slow and steady!',
  ttsComplete: 'Beautiful! You mastered calm, controlled timing!',
  congratsMessage: 'Zen Master!',
  logType: 'slow-catch',
  skillTags: ['controlled-timing', 'precision', 'slow-motor-control'],
  instruction: 'Tap the drifting ball steadily',
} as const;

/** Design tokens — OT Level 5 Session 6 · Game 4 · Timer Strike */
export const TIMER_STRIKE_THEME = {
  sky: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1'] as const,
  clockRing: 'rgba(129,140,248,0.45)',
  clockGlow: 'rgba(99,102,241,0.2)',
  hand: '#818CF8',
  tick: 'rgba(255,255,255,0.15)',
  target: '#6366F1',
  targetGlow: 'rgba(99,102,241,0.5)',
  hudGlass: 'rgba(30,27,75,0.9)',
  hudBorder: 'rgba(129,140,248,0.4)',
  title: '#E0E7FF',
  subtitle: '#C7D2FE',
  accent: '#818CF8',
  accentDark: '#6366F1',
} as const;

export const TIMER_STRIKE_COPY = {
  title: 'Timer Strike',
  emoji: '⏰',
  subtitle: 'Countdown Arena · Anticipation',
  introDescription: 'Watch the countdown tick down… then strike the target the instant it appears. Perfect timing wins!',
  ttsIntro: 'Welcome to Timer Strike! Wait for the countdown, then tap!',
  ttsTap: 'Tap now!',
  ttsSuccess: 'Perfect timing!',
  ttsComplete: 'Brilliant! Your anticipation timing is perfect!',
  congratsMessage: 'Timing Pro!',
  logType: 'countdown-hit',
  skillTags: ['anticipation', 'timing', 'countdown-response'],
} as const;

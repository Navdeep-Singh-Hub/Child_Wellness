/** Design tokens — OT Level 5 Session 6 · Game 3 · Turbo Toggle */
export const TURBO_TOGGLE_THEME = {
  sky: ['#422006', '#78350F', '#92400E', '#B45309'] as const,
  lane: 'rgba(251,191,36,0.25)',
  turbo: '#FACC15',
  crawl: '#4ADE80',
  badge: 'rgba(251,191,36,0.2)',
  ballFast: '#EF4444',
  ballSlow: '#22C55E',
  hudGlass: 'rgba(66,32,6,0.9)',
  hudBorder: 'rgba(251,191,36,0.4)',
  title: '#FEF3C7',
  subtitle: '#FDE68A',
  accent: '#FBBF24',
  accentDark: '#F59E0B',
} as const;

export const TURBO_TOGGLE_COPY = {
  title: 'Turbo Toggle',
  emoji: '🔄',
  subtitle: 'Dual Speed · Adaptability',
  introDescription: 'The ball shifts between turbo and crawl speed without warning. Adapt your timing and catch it either way!',
  ttsIntro: 'Welcome to Turbo Toggle! Adapt as the speed changes!',
  ttsStart: 'Watch the speed change!',
  ttsSuccess: 'Great adaptation!',
  ttsComplete: 'Amazing! You adapted to every speed shift!',
  congratsMessage: 'Adaptation Ace!',
  logType: 'speed-switch',
  skillTags: ['adaptability', 'speed-adjustment', 'flexibility'],
  instruction: 'Adapt as speed changes!',
} as const;

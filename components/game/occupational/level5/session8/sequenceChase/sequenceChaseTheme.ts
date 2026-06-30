import type { TrackCopy, TrackThemeTokens } from '@/components/game/occupational/level5/session8/trackTheme';

export const SEQUENCE_CHASE_THEME: TrackThemeTokens = {
  sky: ['#4C1D95', '#6B21A8', '#7E22CE', '#A855F7'],
  hudGlass: 'rgba(76,29,149,0.9)',
  hudBorder: 'rgba(192,132,252,0.4)',
  title: '#F3E8FF',
  subtitle: '#E9D5FF',
  accent: '#C084FC',
  accentDark: '#A855F7',
};

export const SEQUENCE_CHASE_COPY: TrackCopy = {
  title: 'Sequence Chase',
  emoji: '🔢',
  subtitle: 'Pattern Stage · Visual Memory',
  introDescription: 'Watch the emoji sequence light up, then replay it step by step from memory!',
  ttsComplete: 'Pattern master! You recalled every sequence!',
  congratsMessage: 'Pattern Pro!',
};

export const SEQUENCE_CHASE_META = {
  rootBg: '#4C1D95',
  chips: ['👁️ Watch', '🔢 Order', '🧠 Recall'] as const,
  startLabel: '🔢 Begin Sequence',
  startColors: ['#E9D5FF', '#C084FC', '#9333EA'] as const,
  gameTitle: '🔢 Sequence Chase',
  roundLabel: 'SEQ',
  scoreLabel: 'ROUNDS',
};

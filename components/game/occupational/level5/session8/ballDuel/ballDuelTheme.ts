import type { TrackCopy, TrackThemeTokens } from '@/components/game/occupational/level5/session8/trackTheme';

export const BALL_DUEL_THEME: TrackThemeTokens = {
  sky: ['#0C4A6E', '#0369A1', '#0284C7', '#38BDF8'],
  hudGlass: 'rgba(12,74,110,0.9)',
  hudBorder: 'rgba(56,189,248,0.4)',
  title: '#E0F2FE',
  subtitle: '#BAE6FD',
  accent: '#38BDF8',
  accentDark: '#0284C7',
};

export const BALL_DUEL_COPY: TrackCopy = {
  title: 'Ball Duel',
  emoji: '⚽',
  subtitle: 'Twin Track · Object Filter',
  introDescription: 'Two balls bounce in the arena. One is marked with a star — track it and tap the correct ball!',
  ttsComplete: 'Champion! You won every ball duel!',
  congratsMessage: 'Duel Champion!',
};

export const BALL_DUEL_META = {
  rootBg: '#0C4A6E',
  chips: ['⚽ Track', '⭐ Mark', '👆 Tap'] as const,
  startLabel: '⚽ Enter Duel',
  startColors: ['#7DD3FC', '#38BDF8', '#0284C7'] as const,
  gameTitle: '⚽ Ball Duel',
  roundLabel: 'DUEL',
  scoreLabel: 'WINS',
  phaseLabel: 'LIVE',
};

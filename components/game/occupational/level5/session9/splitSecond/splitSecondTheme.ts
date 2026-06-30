import type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';

export const SPLIT_SECOND_THEME: ReactionThemeTokens = {
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA'],
  title: '#DBEAFE',
  subtitle: '#BFDBFE',
  accent: '#38BDF8',
  accentDark: '#0EA5E9',
  hudGlass: 'rgba(30,58,138,0.88)',
  hudBorder: 'rgba(56,189,248,0.35)',
  cue: '#F0F9FF',
};

export const SPLIT_SECOND_COPY: ReactionCopy = {
  gameTitle: 'Split Second',
  emoji: '⚡',
  tagline: 'Decision Dash · Quick Thinking',
  introBody: 'Two choices appear — listen for the target, then tap the right one before time runs out!',
  chips: ['⚡ Fast', '🍎 Pick', '⏱️ Timer'],
  startLabel: 'Go Quick',
  startGradient: ['#38BDF8', '#0EA5E9', '#0284C7'],
  congrats: 'Quick Thinker!',
  scoreLabel: 'PICKS',
  rootBg: '#1E3A8A',
  logType: 'quick-choice',
};

import type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';

export const POP_ALERT_THEME: ReactionThemeTokens = {
  sky: ['#7C2D12', '#9A3412', '#C2410C', '#EA580C'],
  title: '#FFEDD5',
  subtitle: '#FED7AA',
  accent: '#FB923C',
  accentDark: '#F97316',
  hudGlass: 'rgba(124,45,18,0.88)',
  hudBorder: 'rgba(251,146,60,0.4)',
  cue: '#FFF7ED',
};

export const POP_ALERT_COPY: ReactionCopy = {
  gameTitle: 'Pop Alert',
  emoji: '💥',
  tagline: 'Surprise Zone · Vigilance',
  introBody: 'Objects pop up at random times and places. Stay alert and tap each surprise before it disappears!',
  chips: ['💥 Pop', '👀 Alert', '👆 Tap'],
  startLabel: 'Stay Alert',
  startGradient: ['#FB923C', '#F97316', '#EA580C'],
  congrats: 'Alert Ace!',
  scoreLabel: 'POPS',
  rootBg: '#7C2D12',
  logType: 'surprise-pop',
};

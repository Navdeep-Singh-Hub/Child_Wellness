import type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';

export const SIGNAL_CONTROL_THEME: ReactionThemeTokens = {
  sky: ['#14532D', '#166534', '#15803D', '#22C55E'],
  title: '#DCFCE7',
  subtitle: '#BBF7D0',
  accent: '#4ADE80',
  accentDark: '#22C55E',
  hudGlass: 'rgba(20,83,45,0.88)',
  hudBorder: 'rgba(74,222,128,0.35)',
  cue: '#F0FDF4',
};

export const SIGNAL_CONTROL_COPY: ReactionCopy = {
  gameTitle: 'Signal Control',
  emoji: '🚦',
  tagline: 'Traffic Arena · Inhibition',
  introBody: 'Green means GO — tap fast! Red means STOP — hold back and do not tap. Train your impulse control!',
  chips: ['🟢 Go', '🔴 Stop', '🧠 Control'],
  startLabel: 'Start Signals',
  startGradient: ['#4ADE80', '#22C55E', '#16A34A'],
  congrats: 'Signal Master!',
  scoreLabel: 'GOs',
  rootBg: '#14532D',
  logType: 'go-stop',
};

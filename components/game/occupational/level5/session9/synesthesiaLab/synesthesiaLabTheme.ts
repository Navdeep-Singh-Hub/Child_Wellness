import type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';

export const SYNESTHESIA_LAB_THEME: ReactionThemeTokens = {
  sky: ['#4C1D95', '#6B21A8', '#7E22CE', '#A855F7'],
  title: '#F3E8FF',
  subtitle: '#E9D5FF',
  accent: '#C084FC',
  accentDark: '#A855F7',
  hudGlass: 'rgba(76,29,149,0.88)',
  hudBorder: 'rgba(192,132,252,0.4)',
  cue: '#FAE8FF',
};

export const SYNESTHESIA_LAB_COPY: ReactionCopy = {
  gameTitle: 'Synesthesia Lab',
  emoji: '🎵',
  tagline: 'Sound + Light · Multi-Sensory',
  introBody: 'Hear a sound, see a colored light. Tap only when the sound and color match together!',
  chips: ['🎵 Sound', '💡 Light', '🔗 Match'],
  startLabel: 'Enter Lab',
  startGradient: ['#C084FC', '#A855F7', '#9333EA'],
  congrats: 'Sense Sync Pro!',
  scoreLabel: 'MATCHES',
  rootBg: '#4C1D95',
  logType: 'sound-light',
};

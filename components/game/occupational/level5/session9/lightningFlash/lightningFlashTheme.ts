import type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';

export const LIGHTNING_FLASH_THEME: ReactionThemeTokens = {
  sky: ['#0F172A', '#1E293B', '#334155', '#475569'],
  title: '#FEF08A',
  subtitle: '#FDE047',
  accent: '#FACC15',
  accentDark: '#EAB308',
  hudGlass: 'rgba(15,23,42,0.9)',
  hudBorder: 'rgba(250,204,21,0.35)',
  cue: '#FEF9C3',
};

export const LIGHTNING_FLASH_COPY: ReactionCopy = {
  gameTitle: 'Lightning Flash',
  emoji: '💡',
  tagline: 'Reflex Grid · Flash Response',
  introBody: 'A bright flash appears for a split second. Tap it as fast as you can before it vanishes!',
  chips: ['💡 Flash', '⚡ Reflex', '👆 Tap'],
  startLabel: 'Ready Reflexes',
  startGradient: ['#FACC15', '#EAB308', '#CA8A04'],
  congrats: 'Lightning Reflex!',
  scoreLabel: 'HITS',
  rootBg: '#0F172A',
  logType: 'flash-tap',
};

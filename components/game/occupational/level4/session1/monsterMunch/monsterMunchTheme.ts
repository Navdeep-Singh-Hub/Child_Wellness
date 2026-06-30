import type { HorizontalDragGameConfig } from '@/components/game/occupational/level4/session1/shared/HorizontalDragGame';

export const MONSTER_FOOD_ITEMS = ['🍎', '🍌', '🍪', '🍇', '🥕', '🧁'] as const;

export const MONSTER_MUNCH_THEME = {
  title: 'Monster Munch',
  subtitle: 'Slide the snack across the cave to the hungry monster',
  emoji: '👹',
  gradient: ['#1E1033', '#312E81', '#5B21B6', '#7C3AED'] as [string, string, string, string],
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentPink: '#F472B6',
  caveDark: '#1E1033',
  caveMid: '#4C1D95',
  caveFloor: '#312E81',
  mushroom: '#A78BFA',
  snackGold: '#FCD34D',
  monsterGreen: '#4ADE80',
  monsterBody: '#6D28D9',
  plateWood: '#92400E',
  draggableEmoji: '🍎',
  targetEmoji: '👹',
  playBorder: 'rgba(244,114,182,0.42)',
  playBg: '#2E1065',
  sparkleColor: '#FBBF24',
  zoneBorder: 'rgba(245,158,11,0.5)',
  voiceIntro: 'Welcome to the snack cave! Drag food from the plate to feed the hungry monster!',
  voiceDrag: 'Slide the snack to the monster mouth!',
  voiceComplete: 'Burp! The monster is totally full. Amazing feeding!',
  voiceMiss: 'Oops! Drop the snack right in the monster mouth!',
  voiceYum: 'Yum yum!',
  congrats: 'Snack Cave Champion!',
} as const;

/** @deprecated use MONSTER_MUNCH_THEME */
export const MONSTER_FEED_THEME = MONSTER_MUNCH_THEME;

export const MONSTER_MUNCH_CONFIG: Omit<HorizontalDragGameConfig, 'onBack' | 'onComplete'> = {
  mode: 'feedMonster',
  theme: {
    title: MONSTER_MUNCH_THEME.title,
    subtitle: MONSTER_MUNCH_THEME.subtitle,
    emoji: MONSTER_MUNCH_THEME.emoji,
    gradient: MONSTER_MUNCH_THEME.gradient,
    accent: MONSTER_MUNCH_THEME.accent,
    accentDark: MONSTER_MUNCH_THEME.accentDark,
    draggableEmoji: MONSTER_MUNCH_THEME.draggableEmoji,
    targetEmoji: MONSTER_MUNCH_THEME.targetEmoji,
    backText: '#FDF4FF',
    backBorder: 'rgba(244,114,182,0.35)',
    titleColor: '#FAF5FF',
    subtitleColor: 'rgba(233,213,255,0.9)',
    statLabel: 'rgba(233,213,255,0.75)',
    statValue: '#FFFFFF',
    statBorder: 'rgba(244,114,182,0.3)',
    playBorder: MONSTER_MUNCH_THEME.playBorder,
    playBg: MONSTER_MUNCH_THEME.playBg,
    sparkleColor: MONSTER_MUNCH_THEME.sparkleColor,
    zoneBorder: MONSTER_MUNCH_THEME.zoneBorder,
  },
  ttsIntro: MONSTER_MUNCH_THEME.voiceIntro,
  ttsComplete: MONSTER_MUNCH_THEME.voiceComplete,
  ttsDrag: MONSTER_MUNCH_THEME.voiceDrag,
  ttsMiss: MONSTER_MUNCH_THEME.voiceMiss,
  ttsGoal: MONSTER_MUNCH_THEME.voiceYum,
  congratsMessage: MONSTER_MUNCH_THEME.congrats,
  logType: 'feed-monster',
  skillTags: ['direction-control', 'arm-coordination', 'drag-left-right'],
};

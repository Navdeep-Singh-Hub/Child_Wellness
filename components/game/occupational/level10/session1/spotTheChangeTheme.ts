/**
 * OT Level 10 · Session 1 · Game 3 — Spot The Change · "Prism Garden Watch"
 *
 * Emerald + magenta kaleidoscope garden — distinct from Game 1 aurora & Game 2 cavern.
 */

export const PRISM_SHELL = {
  backText: '#D1FAE5',
  backBorder: 'rgba(167,243,208,0.4)',
  statLabel: '#6EE7B7',
  statValue: '#FDF2F8',
  statBorder: 'rgba(110,231,183,0.45)',
  stageBorder: 'rgba(236,72,153,0.45)',
  stageBg: 'rgba(8,24,20,0.58)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#F0ABFC',
  glassBorder: 'rgba(167,243,208,0.35)',
  academyLabel: 'VISUAL SENSORY LAB',
} as const;

export type SensoryTileId = 'bloom' | 'leaf' | 'moth' | 'crystal' | 'dew';

export type SensoryTileDef = {
  id: SensoryTileId;
  baseEmoji: string;
  changeEmoji: string;
  label: string;
  baseColor: string;
  changeColor: string;
  x: number;
  y: number;
  radius: number;
};

export const SPOT_THE_CHANGE_THEME = {
  title: 'Spot The Change',
  subtitle: 'Watch the prism garden — when something shifts, move your body to spot what changed!',
  emoji: '🔍',
  hero: '🦋',
  accent: '#10B981',
  accentHot: '#EC4899',
  glow: 'rgba(16,185,129,0.55)',
  bgGradient: ['#042F2E', '#064E3B', '#701A75', '#EC4899'] as [string, string, string, string],
  decor: ['🌿', '🦋', '💎', '🌸', '✨', '🍃', '🔮', '🪷'],
  hintText: 'Keep your eyes on the garden tiles — then move to the one that changed.',
  positionCue: 'Sit where the camera sees your face and upper body clearly.',
  observeLabel: 'WATCH…',
  changeLabel: 'IT CHANGED!',
  spotLabel: 'SPOT IT!',
  voiceIntro:
    'Welcome to the Prism Garden! Watch carefully. When something changes, move your body to spot it.',
  voiceChange: 'Something changed! Can you spot it?',
  voiceComplete: 'Sharp eyes! You spotted every change in the garden!',
  congrats: 'Change Detective!',
  skillTags: [
    'visual-discrimination',
    'sensory-integration',
    'adaptive-responses',
    'attention',
    'motor-planning',
  ],
} as const;

/** Five sensory tiles — positions are absolute normalized coords. */
export const SENSORY_TILES: SensoryTileDef[] = [
  {
    id: 'bloom',
    baseEmoji: '🌸',
    changeEmoji: '🌺',
    label: 'Bloom',
    baseColor: '#F9A8D4',
    changeColor: '#EC4899',
    x: 0.22,
    y: 0.3,
    radius: 0.11,
  },
  {
    id: 'leaf',
    baseEmoji: '🍃',
    changeEmoji: '🍀',
    label: 'Leaf',
    baseColor: '#6EE7B7',
    changeColor: '#10B981',
    x: 0.78,
    y: 0.3,
    radius: 0.11,
  },
  {
    id: 'moth',
    baseEmoji: '🦋',
    changeEmoji: '🐛',
    label: 'Flutter',
    baseColor: '#A78BFA',
    changeColor: '#8B5CF6',
    x: 0.22,
    y: 0.68,
    radius: 0.11,
  },
  {
    id: 'crystal',
    baseEmoji: '💎',
    changeEmoji: '🔮',
    label: 'Crystal',
    baseColor: '#67E8F9',
    changeColor: '#06B6D4',
    x: 0.78,
    y: 0.68,
    radius: 0.11,
  },
  {
    id: 'dew',
    baseEmoji: '🫧',
    changeEmoji: '💧',
    label: 'Dew Drop',
    baseColor: '#C4B5FD',
    changeColor: '#818CF8',
    x: 0.5,
    y: 0.48,
    radius: 0.1,
  },
];

/** Which tile changes each round (index into SENSORY_TILES). */
export const ROUND_CHANGE_INDEX = [0, 1, 2, 3, 4] as const;

/**
 * OT Level 10 · Session 1 · Game 4 — Mystery Touch · "Silk Void Sanctum"
 *
 * Deep plum + warm bronze tactile palette — distinct from Games 1–3.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const TOUCH_SHELL = {
  backText: '#F5E6D3',
  backBorder: 'rgba(245,230,211,0.4)',
  statLabel: '#D4A574',
  statValue: '#FFFBEB',
  statBorder: 'rgba(212,165,116,0.45)',
  stageBorder: 'rgba(192,132,252,0.45)',
  stageBg: 'rgba(24,10,32,0.62)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#E9D5FF',
  glassBorder: 'rgba(216,180,254,0.35)',
  academyLabel: 'TACTILE SENSORY LAB',
} as const;

export type TouchHand = 'left' | 'right' | 'both';

export type MysteryTouchChallenge = {
  id: string;
  hand: TouchHand;
  label: string;
  texture: string;
  emoji: string;
  color: string;
  glow: string;
  voiceCue: string;
  seekCue: string;
  /** Primary target (left or single). */
  primary: Point & { radius: number };
  /** Second target for both-hands round. */
  secondary?: Point & { radius: number };
};

export const MYSTERY_TOUCH_THEME = {
  title: 'Mystery Touch',
  subtitle: 'Reach through the silk void — touch each hidden mystery orb with the right hand!',
  emoji: '✨',
  hero: '🖐️',
  accent: '#C084FC',
  accentWarm: '#D4A574',
  glow: 'rgba(192,132,252,0.55)',
  bgGradient: ['#120818', '#2E1065', '#4A1942', '#B45309'] as [string, string, string, string],
  decor: ['✨', '🪶', '🧵', '💫', '🌙', '🔮', '🫧', '🖐️'],
  hintText: 'Reach your hand to the glowing mystery orb and hold to feel the touch.',
  positionCue: 'Show your hands and upper body to the camera — we track your wrists.',
  revealLabel: 'MYSTERY…',
  touchLabel: 'TOUCH!',
  voiceIntro:
    'Welcome to the Silk Void! Mystery orbs are hiding here. Reach out and touch each one with the correct hand.',
  voiceComplete: 'Wonderful reaching! You touched every mystery in the void!',
  congrats: 'Tactile Explorer!',
  skillTags: [
    'tactile-awareness',
    'bilateral-coordination',
    'sensory-integration',
    'motor-planning',
    'adaptive-responses',
  ],
} as const;

export const TOUCH_CHALLENGES: MysteryTouchChallenge[] = [
  {
    id: 'left-soft',
    hand: 'left',
    label: 'Velvet Left',
    texture: 'velvet',
    emoji: '🟣',
    color: '#C084FC',
    glow: 'rgba(192,132,252,0.6)',
    voiceCue: 'Reach with your left hand to touch the purple mystery orb!',
    seekCue: 'Stretch your left hand to the orb!',
    primary: { x: 0.2, y: 0.48, radius: 0.11 },
  },
  {
    id: 'right-spark',
    hand: 'right',
    label: 'Bronze Right',
    texture: 'spark',
    emoji: '🟤',
    color: '#D4A574',
    glow: 'rgba(212,165,116,0.65)',
    voiceCue: 'Use your right hand to touch the bronze mystery orb!',
    seekCue: 'Reach right to the glowing orb!',
    primary: { x: 0.8, y: 0.48, radius: 0.11 },
  },
  {
    id: 'left-high',
    hand: 'left',
    label: 'Silk High',
    texture: 'silk',
    emoji: '💜',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.6)',
    voiceCue: 'Lift your left hand up high to touch the floating orb!',
    seekCue: 'Reach up high with your left hand!',
    primary: { x: 0.28, y: 0.22, radius: 0.1 },
  },
  {
    id: 'right-low',
    hand: 'right',
    label: 'Warm Low',
    texture: 'warm',
    emoji: '🧡',
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.6)',
    voiceCue: 'Reach down low with your right hand to the warm orb!',
    seekCue: 'Stretch down with your right hand!',
    primary: { x: 0.72, y: 0.76, radius: 0.1 },
  },
  {
    id: 'both-balance',
    hand: 'both',
    label: 'Twin Touch',
    texture: 'twin',
    emoji: '🤲',
    color: '#E9D5FF',
    glow: 'rgba(233,213,255,0.65)',
    voiceCue: 'Touch both mystery orbs at the same time — left and right!',
    seekCue: 'Both hands on the orbs — hold steady!',
    primary: { x: 0.28, y: 0.5, radius: 0.095 },
    secondary: { x: 0.72, y: 0.5, radius: 0.095 },
  },
];

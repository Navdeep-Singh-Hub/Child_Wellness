/**
 * OT Level 8 · Session 7 — "Bilateral Motor Planning" (Twin Power Lab)
 *
 * Five camera-tracked games training coordinated two-sided movement: symmetric
 * twin moves, cross-body claps, bear patterns, mirrored hands and dual actions.
 * Pose tracking scores bilateral accuracy, completion and movement quality.
 */
import type { BilateralPattern } from '@/components/game/occupational/level8/session7/bilateralPlan';
import type { ArmZone } from '@/components/game/occupational/level8/session4/poseMatch';

export type BilateralMode = 'twinMoves' | 'crossClap' | 'bearPattern' | 'mirrorHands' | 'dualAction';

export const BILATERAL_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.4)',
  statLabel: '#FCD34D',
  statValue: '#FEF3C7',
  statBorder: 'rgba(252,211,77,0.4)',
  sparkleColor: '#FEF08A',
} as const;

export type BilateralGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  glow: string;
  bgGradient: [string, string, string, string];
  rounds: number;
  patterns: BilateralPattern[];
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

const SKILL = ['praxis', 'bilateral-coordination', 'motor-planning', 'body-awareness', 'midline-crossing'];

const Z = (id: string, name: string, icon: string, l: ArmZone, r: ArmZone): BilateralPattern => ({
  id,
  name,
  icon,
  kind: 'zones',
  leftArm: l,
  rightArm: r,
});

export const BILATERAL_GAME_THEMES: Record<BilateralMode, BilateralGameTheme> = {
  twinMoves: {
    title: 'Twin Moves',
    subtitle: 'Move BOTH arms together — same move on each side!',
    emoji: '👯',
    hero: '✨',
    accent: '#38BDF8',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#0C4A6E', '#0369A1', '#7C3AED', '#38BDF8'],
    rounds: 6,
    patterns: [
      Z('t-up', 'Both Arms Up', '🙌', 'up', 'up'),
      Z('t-out', 'Wings Out', '🦅', 'out', 'out'),
      Z('t-down', 'Arms Down', '👇', 'down', 'down'),
      { id: 't-clap', name: 'Twin Clap', icon: '👏', kind: 'clap' },
    ],
    collectible: '✨',
    hintText: 'Use both arms together and hold the twin move!',
    positionCue: 'Stand back so the camera sees both your arms!',
    voiceIntro: 'Twin power! Move both arms together for each twin move!',
    voicePlan: 'Get ready to move both arms together…',
    voiceComplete: 'Amazing twins! You nailed every move!',
    congrats: 'Twin Moves Champion!',
    skillTags: SKILL,
  },
  crossClap: {
    title: 'Cross Clap',
    subtitle: 'Cross your arms and clap across your body!',
    emoji: '✖️',
    hero: '🎯',
    accent: '#F472B6',
    glow: 'rgba(244,114,182,0.55)',
    bgGradient: ['#500724', '#9D174D', '#DB2777', '#FBCFE8'],
    rounds: 6,
    patterns: [
      { id: 'cc-cross', name: 'Cross Clap', icon: '✖️', kind: 'crossClap' },
      { id: 'cc-clap', name: 'Midline Clap', icon: '👏', kind: 'clap' },
      Z('cc-lr', 'Cross Reach Left', '🤚', 'out', 'up'),
      Z('cc-rl', 'Cross Reach Right', '🤚', 'up', 'out'),
    ],
    collectible: '🎯',
    hintText: 'Cross your arms over your body and clap!',
    positionCue: 'Stand facing the camera with room to cross your arms!',
    voiceIntro: 'Cross clap time! Bring your hands together across your body!',
    voicePlan: 'Get ready to cross and clap…',
    voiceComplete: 'Super crossing! You mastered every clap!',
    congrats: 'Cross Clap Hero!',
    skillTags: [...SKILL, 'midline-crossing'],
  },
  bearPattern: {
    title: 'Bear Pattern',
    subtitle: 'Make the bear crawl shape with both arms and body!',
    emoji: '🐻',
    hero: '🐾',
    accent: '#D97706',
    glow: 'rgba(217,119,6,0.55)',
    bgGradient: ['#451A03', '#92400E', '#B45309', '#FCD34D'],
    rounds: 6,
    patterns: [
      { id: 'b-bear', name: 'Bear Crawl', icon: '🐻', kind: 'bear' },
      Z('b-out', 'Bear Paws Out', '🐾', 'out', 'out'),
      Z('b-low', 'Low Bear', '⬇️', 'down', 'down'),
      Z('b-mix', 'One Paw Up', '🐻', 'up', 'down'),
    ],
    collectible: '🐾',
    hintText: 'Get low like a bear and spread both paws!',
    positionCue: 'Stand back with room to crouch — make the bear shape!',
    voiceIntro: 'Bear walk! Copy each bear pattern with both arms and your body!',
    voicePlan: 'Get ready to be a bear…',
    voiceComplete: 'Roar! You did every bear pattern!',
    congrats: 'Bear Pattern Master!',
    skillTags: SKILL,
  },
  mirrorHands: {
    title: 'Mirror Hands',
    subtitle: 'Mirror each hand position — left and right opposite!',
    emoji: '🪞',
    hero: '🪞',
    accent: '#A855F7',
    glow: 'rgba(168,85,247,0.55)',
    bgGradient: ['#2E1065', '#6D28D9', '#9333EA', '#E9D5FF'],
    rounds: 6,
    patterns: [
      Z('m-lu-rd', 'Left Up · Right Down', '🪞', 'up', 'down'),
      Z('m-ld-ru', 'Left Down · Right Up', '🪞', 'down', 'up'),
      Z('m-lo-rd', 'Left Out · Right Down', '🪞', 'out', 'down'),
      Z('m-ld-ro', 'Left Down · Right Out', '🪞', 'down', 'out'),
    ],
    collectible: '🪞',
    hintText: 'Put each hand in a different mirror position!',
    positionCue: 'Stand back so the camera sees both arms clearly!',
    voiceIntro: 'Mirror time! Make your left and right hands match the mirror pattern!',
    voicePlan: 'Study the mirror pattern…',
    voiceComplete: 'Perfect mirroring! Both hands were amazing!',
    congrats: 'Mirror Hands Star!',
    skillTags: SKILL,
  },
  dualAction: {
    title: 'Dual Action',
    subtitle: 'Do TWO different moves at the same time with each hand!',
    emoji: '⚡',
    hero: '⚡',
    accent: '#22D3EE',
    glow: 'rgba(34,211,238,0.55)',
    bgGradient: ['#042F2E', '#0E7490', '#0891B2', '#67E8F9'],
    rounds: 6,
    patterns: [
      Z('d-lu-ro', 'Up + Out', '⚡', 'up', 'out'),
      Z('d-lo-ru', 'Out + Up', '⚡', 'out', 'up'),
      Z('d-lu-rd', 'Up + Down', '⚡', 'up', 'down'),
      Z('d-lo-ro', 'Out + Out Wide', '🦅', 'out', 'out'),
      { id: 'd-clap', name: 'Dual Clap', icon: '👏', kind: 'clap' },
    ],
    collectible: '⚡',
    hintText: 'Each hand does its own move — do both together!',
    positionCue: 'Stand back so the camera sees both arms — dual action!',
    voiceIntro: 'Dual action challenge! Each hand does a different move at the same time!',
    voicePlan: 'Get ready for dual action…',
    voiceComplete: 'Incredible! You handled every dual action!',
    congrats: 'Dual Action Champion!',
    skillTags: SKILL,
  },
};

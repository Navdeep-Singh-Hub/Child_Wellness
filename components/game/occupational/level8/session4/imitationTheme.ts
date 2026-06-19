/**
 * OT Level 8 · Session 4 — "Motor Imitation" (Copy-Cat Lab)
 *
 * Five camera-tracked imitation games. A friendly character demonstrates a body
 * pose and the child must COPY it — robot moves, animal shapes, dance mirrors,
 * pose matches and quick copies. Pose tracking scores how accurately the child
 * imitates the pose, completion and movement quality.
 */
import type { PoseTemplate } from '@/components/game/occupational/level8/session4/poseMatch';

export type ImitationMode = 'robotCopy' | 'animalCopy' | 'danceMirror' | 'poseMatch' | 'quickCopy';

export const IMITATION_SHELL = {
  backText: '#BFDBFE',
  backBorder: 'rgba(191,219,254,0.4)',
  statLabel: '#93C5FD',
  statValue: '#DBEAFE',
  statBorder: 'rgba(147,197,253,0.4)',
  sparkleColor: '#FEF08A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
} as const;

export type ImitationGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  rounds: number;
  /** Pose templates the game cycles through (in random order). */
  poses: PoseTemplate[];
  /** True = fast copies (shorter hold + plan). */
  quick?: boolean;
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

// Reusable pose shapes (child's own left / right hands).
const P_BOTH_UP = (id: string, name: string): PoseTemplate => ({ id, name, leftArm: 'up', rightArm: 'up' });
const P_WINGS = (id: string, name: string): PoseTemplate => ({ id, name, leftArm: 'out', rightArm: 'out' });
const P_ONE_UP = (id: string, name: string): PoseTemplate => ({ id, name, leftArm: 'up', rightArm: 'down' });
const P_MIX = (id: string, name: string): PoseTemplate => ({ id, name, leftArm: 'up', rightArm: 'out' });
const P_REST = (id: string, name: string): PoseTemplate => ({ id, name, leftArm: 'down', rightArm: 'down' });
const P_LEAN_L = (id: string, name: string): PoseTemplate => ({ id, name, leftArm: 'down', rightArm: 'down', lean: 'left' });
const P_LEAN_R = (id: string, name: string): PoseTemplate => ({ id, name, leftArm: 'down', rightArm: 'down', lean: 'right' });

export const IMITATION_GAME_THEMES: Record<ImitationMode, ImitationGameTheme> = {
  robotCopy: {
    title: 'Robot Copy',
    subtitle: 'Watch the robot and copy its move exactly!',
    emoji: '🤖',
    hero: '🤖',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#0F172A', '#1E3A8A', '#0E7490', '#38BDF8'],
    decor: ['🤖', '⚙️', '🔋', '✨', '🔌', '💡'],
    rounds: 6,
    poses: [
      P_BOTH_UP('r-up', 'Power Up'),
      P_WINGS('r-wings', 'Scanner Arms'),
      P_ONE_UP('r-one', 'Signal'),
      P_MIX('r-mix', 'Robot Stance'),
      P_REST('r-rest', 'Standby'),
    ],
    collectible: '🔋',
    hintText: 'Copy the robot’s pose and hold it still!',
    positionCue: 'Stand back so the camera sees your arms — copy the robot!',
    voiceIntro: 'Beep boop! Watch each robot move and copy it exactly with your body!',
    voicePlan: 'Watch the robot… get ready to copy!',
    voiceComplete: 'Beep boop! You copied every robot move!',
    congrats: 'Robot Copy Champion!',
    skillTags: ['praxis', 'motor-imitation', 'body-awareness', 'motor-planning', 'coordination'],
  },
  animalCopy: {
    title: 'Animal Copy',
    subtitle: 'Copy the animal shapes with your whole body!',
    emoji: '🦁',
    hero: '🐾',
    accent: '#84CC16',
    accentDeep: '#3F6212',
    glow: 'rgba(132,204,22,0.55)',
    bgGradient: ['#052E16', '#166534', '#65A30D', '#FBBF24'],
    decor: ['🦒', '🦅', '🐰', '🦘', '🐧', '🌿'],
    rounds: 6,
    poses: [
      P_BOTH_UP('a-bunny', 'Bunny Ears'),
      P_WINGS('a-bird', 'Bird Wings'),
      P_ONE_UP('a-giraffe', 'Giraffe Neck'),
      P_MIX('a-roo', 'Kangaroo'),
      P_REST('a-penguin', 'Penguin'),
    ],
    collectible: '🐾',
    hintText: 'Copy the animal shape and hold the pose!',
    positionCue: 'Stand back so the camera sees your whole body — copy the animal!',
    voiceIntro: 'Welcome to the animal park! Copy each animal shape with your body!',
    voicePlan: 'Watch the animal… get ready to copy!',
    voiceComplete: 'Amazing! You copied every animal!',
    congrats: 'Animal Copy Champion!',
    skillTags: ['praxis', 'motor-imitation', 'body-awareness', 'motor-planning', 'coordination'],
  },
  danceMirror: {
    title: 'Dance Mirror',
    subtitle: 'Mirror the dancer’s moves to the beat!',
    emoji: '💃',
    hero: '🪩',
    accent: '#EC4899',
    accentDeep: '#9D174D',
    glow: 'rgba(236,72,153,0.55)',
    bgGradient: ['#2E1065', '#7C3AED', '#DB2777', '#F59E0B'],
    decor: ['💃', '🕺', '🪩', '🎵', '✨', '🎶'],
    rounds: 6,
    poses: [
      P_BOTH_UP('d-handsup', 'Hands Up'),
      P_WINGS('d-star', 'Star Pose'),
      P_LEAN_L('d-swayl', 'Sway Left'),
      P_LEAN_R('d-swayr', 'Sway Right'),
      P_ONE_UP('d-disco', 'Disco Point'),
    ],
    collectible: '🎵',
    hintText: 'Mirror the dance move and strike the pose!',
    positionCue: 'Stand back with room to sway — mirror the dancer!',
    voiceIntro: 'Let’s dance! Mirror each dance move and strike the pose to the beat!',
    voicePlan: 'Watch the dancer… get ready to mirror!',
    voiceComplete: 'You’ve got the moves! Beautiful dancing!',
    congrats: 'Dance Mirror Star!',
    skillTags: ['praxis', 'motor-imitation', 'rhythm', 'body-awareness', 'coordination'],
  },
  poseMatch: {
    title: 'Pose Match',
    subtitle: 'Match the exact pose shown on screen!',
    emoji: '🎭',
    hero: '🧩',
    accent: '#A855F7',
    accentDeep: '#6B21A8',
    glow: 'rgba(168,85,247,0.55)',
    bgGradient: ['#1E1B4B', '#4338CA', '#7C3AED', '#22D3EE'],
    decor: ['🎭', '🧩', '✨', '🔆', '🎯', '💫'],
    rounds: 6,
    poses: [
      P_BOTH_UP('p-up', 'Both Arms Up'),
      P_WINGS('p-t', 'T-Pose'),
      P_ONE_UP('p-one', 'One Arm Up'),
      P_MIX('p-mix', 'Mixed Pose'),
      P_LEAN_R('p-lean', 'Lean Pose'),
      P_REST('p-rest', 'Stand Tall'),
    ],
    collectible: '🏅',
    hintText: 'Match the pose exactly and hold it still!',
    positionCue: 'Stand back so the camera sees your whole body — match the pose!',
    voiceIntro: 'Pose match time! Make your body match the pose shown on screen!',
    voicePlan: 'Look at the pose… get ready to match!',
    voiceComplete: 'Perfect matching! You nailed every pose!',
    congrats: 'Pose Match Master!',
    skillTags: ['praxis', 'motor-imitation', 'body-awareness', 'motor-planning', 'spatial-awareness'],
  },
  quickCopy: {
    title: 'Quick Copy',
    subtitle: 'Copy each pose as FAST as you can!',
    emoji: '⚡',
    hero: '⚡',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    bgGradient: ['#0C0A09', '#B45309', '#DC2626', '#FBBF24'],
    decor: ['⚡', '💨', '✨', '🔥', '⏱️', '💥'],
    rounds: 7,
    quick: true,
    poses: [
      P_BOTH_UP('q-up', 'Arms Up'),
      P_WINGS('q-t', 'Wings Out'),
      P_ONE_UP('q-one', 'One Up'),
      P_MIX('q-mix', 'Mixed'),
      P_LEAN_L('q-leanl', 'Lean Left'),
      P_LEAN_R('q-leanr', 'Lean Right'),
      P_REST('q-rest', 'Reset'),
    ],
    collectible: '⚡',
    hintText: 'Copy the pose quickly — beat the clock!',
    positionCue: 'Stand back so the camera sees you — get ready to copy fast!',
    voiceIntro: 'Quick copy challenge! Copy each pose as fast as you can!',
    voicePlan: 'Ready… copy fast!',
    voiceComplete: 'Lightning fast! You copied them all!',
    congrats: 'Quick Copy Champion!',
    skillTags: ['praxis', 'motor-imitation', 'reaction-speed', 'body-awareness', 'motor-planning'],
  },
};

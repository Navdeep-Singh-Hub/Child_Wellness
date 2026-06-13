/**
 * Posture / pose helpers for OT Level 3 Session 10 — Zen Animal Academy.
 */

import type { DifficultyTier } from '@/components/game/occupational/level3/session10/session10Pacing';

export type YogaPose = 'arms-up' | 'star' | 'airplane' | 'strong-hero' | 'tree-starter' | 'warrior';
export type HoldPose = 'arms-up' | 'star' | 'tree' | 'warrior' | 'airplane' | 'strong-hero';
export type AnimalPose = 'dog' | 'cat' | 'butterfly' | 'tree' | 'eagle';
export type ShapePose = 'circle' | 'line' | 'star' | 'triangle' | 'crescent';

export type PostureCue = { emoji: string; label: string; breath?: string };

export const YOGA_POSES: Record<YogaPose, PostureCue> = {
  'arms-up': { emoji: '🙆', label: 'Arms Up', breath: 'Reach tall' },
  star: { emoji: '⭐', label: 'Star Shape', breath: 'Spread wide' },
  airplane: { emoji: '✈️', label: 'Airplane Pose', breath: 'Balance steady' },
  'strong-hero': { emoji: '💪', label: 'Strong Hero Pose', breath: 'Stand strong' },
  'tree-starter': { emoji: '🌳', label: 'Tree Starter', breath: 'Root down' },
  warrior: { emoji: '🦸', label: 'Hero Pose', breath: 'Hold steady' },
};

export const HOLD_POSES: Record<HoldPose, PostureCue> = {
  'arms-up': { emoji: '🙆', label: 'Arms Up' },
  star: { emoji: '⭐', label: 'Star Pose' },
  tree: { emoji: '🌳', label: 'Tree Pose' },
  warrior: { emoji: '🦸', label: 'Warrior Pose' },
  airplane: { emoji: '✈️', label: 'Airplane Pose' },
  'strong-hero': { emoji: '💪', label: 'Strong Pose' },
};

export const ANIMAL_POSES: Record<AnimalPose, PostureCue> = {
  dog: { emoji: '🐕', label: 'Dog Pose', breath: 'Stretch long' },
  cat: { emoji: '🐱', label: 'Cat Pose', breath: 'Round gently' },
  butterfly: { emoji: '🦋', label: 'Butterfly Pose', breath: 'Flap slow' },
  tree: { emoji: '🌳', label: 'Tree Pose', breath: 'Grow tall' },
  eagle: { emoji: '🦅', label: 'Eagle Pose', breath: 'Balance calm' },
};

export const SHAPE_POSES: Record<ShapePose, PostureCue> = {
  circle: { emoji: '⭕', label: 'Circle', breath: 'Curve round' },
  line: { emoji: '📏', label: 'Straight Line', breath: 'Stretch long' },
  star: { emoji: '⭐', label: 'Star', breath: 'Point wide' },
  triangle: { emoji: '🔺', label: 'Triangle', breath: 'Make angles' },
  crescent: { emoji: '🌙', label: 'Crescent', breath: 'Curve softly' },
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

const yogaPool = (tier: DifficultyTier): YogaPose[] => {
  if (tier <= 1) return ['arms-up', 'star'];
  if (tier === 2) return ['arms-up', 'star', 'airplane', 'strong-hero'];
  return Object.keys(YOGA_POSES) as YogaPose[];
};

const holdPool = (tier: DifficultyTier): HoldPose[] => {
  if (tier <= 1) return ['arms-up', 'star'];
  if (tier === 2) return ['arms-up', 'star', 'tree'];
  return Object.keys(HOLD_POSES) as HoldPose[];
};

const animalPool = (tier: DifficultyTier): AnimalPose[] => {
  if (tier <= 1) return ['dog', 'cat'];
  if (tier === 2) return ['dog', 'cat', 'butterfly'];
  return Object.keys(ANIMAL_POSES) as AnimalPose[];
};

const shapePool = (tier: DifficultyTier): ShapePose[] => {
  if (tier <= 1) return ['circle', 'line'];
  if (tier === 2) return ['circle', 'line', 'star'];
  return Object.keys(SHAPE_POSES) as ShapePose[];
};

export const randomYogaPose = (tier: DifficultyTier = 2) => pick(yogaPool(tier));
export const randomHoldPose = (tier: DifficultyTier = 2) => pick(holdPool(tier));
export const randomAnimalPose = (tier: DifficultyTier = 2) => pick(animalPool(tier));
export const randomShapePose = (tier: DifficultyTier = 2) => pick(shapePool(tier));

export const holdQualityScore = (holdMs: number, targetMs: number) => {
  const ratio = holdMs / targetMs;
  if (ratio >= 1) return 100;
  if (ratio >= 0.85) return 88;
  if (ratio >= 0.7) return 72;
  return 55;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

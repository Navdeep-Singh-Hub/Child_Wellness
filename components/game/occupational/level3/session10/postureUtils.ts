/**
 * Posture / pose helpers for OT Level 3 Session 10.
 */

export type YogaPose = 'arms-up' | 'arms-down' | 'one-leg-left' | 'one-leg-right' | 'star' | 'warrior';
export type HoldPose = 'arms-up' | 'one-leg' | 'star' | 'warrior' | 'tree';
export type AnimalPose = 'tree' | 'dog' | 'cat';
export type ShapePose = 'circle' | 'line';

export type PostureCue = { emoji: string; label: string };

export const YOGA_POSES: Record<YogaPose, PostureCue> = {
  'arms-up': { emoji: '🙌', label: 'Arms up' },
  'arms-down': { emoji: '👇', label: 'Arms down' },
  'one-leg-left': { emoji: '🦵', label: 'One leg left' },
  'one-leg-right': { emoji: '🦵', label: 'One leg right' },
  star: { emoji: '⭐', label: 'Star' },
  warrior: { emoji: '⚔️', label: 'Warrior' },
};

export const HOLD_POSES: Record<HoldPose, PostureCue> = {
  'arms-up': { emoji: '🙌', label: 'Arms up' },
  'one-leg': { emoji: '🦵', label: 'One leg' },
  star: { emoji: '⭐', label: 'Star' },
  warrior: { emoji: '⚔️', label: 'Warrior' },
  tree: { emoji: '🌳', label: 'Tree' },
};

export const ANIMAL_POSES: Record<AnimalPose, PostureCue> = {
  tree: { emoji: '🌳', label: 'Tree pose' },
  dog: { emoji: '🐕', label: 'Dog pose' },
  cat: { emoji: '🐱', label: 'Cat pose' },
};

export const SHAPE_POSES: Record<ShapePose, PostureCue> = {
  circle: { emoji: '⭕', label: 'Circle' },
  line: { emoji: '➖', label: 'Line' },
};

const yogaKeys = Object.keys(YOGA_POSES) as YogaPose[];
const holdKeys = Object.keys(HOLD_POSES) as HoldPose[];
const animalKeys = Object.keys(ANIMAL_POSES) as AnimalPose[];
const shapeKeys = Object.keys(SHAPE_POSES) as ShapePose[];

export const randomYogaPose = () => yogaKeys[Math.floor(Math.random() * yogaKeys.length)]!;
export const randomHoldPose = () => holdKeys[Math.floor(Math.random() * holdKeys.length)]!;
export const randomAnimalPose = () => animalKeys[Math.floor(Math.random() * animalKeys.length)]!;
export const randomShapePose = () => shapeKeys[Math.floor(Math.random() * shapeKeys.length)]!;

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

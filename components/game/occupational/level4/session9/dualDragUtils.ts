/**
 * Helpers for OT Level 4 Session 9 dual-drag games.
 */
import React from 'react';
import { Gesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { withTiming } from 'react-native-reanimated';

export { distPx, useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';

type ClampFn = (value: number, playW: number, playH: number, half: number) => number;

const clampXDefault: ClampFn = (x, playW, _playH, half) => Math.max(half, Math.min(playW - half, x));
const clampYDefault: ClampFn = (y, _playW, playH, half) => Math.max(half, Math.min(playH - half, y));

export type ObjectPanConfig = {
  objX: SharedValue<number>;
  objY: SharedValue<number>;
  objScale: SharedValue<number>;
  playW: React.MutableRefObject<number>;
  playH: React.MutableRefObject<number>;
  half: number;
  isActive: () => boolean;
  onUpdate: () => void;
  onEnd?: () => void;
  clampX?: ClampFn;
  clampY?: ClampFn;
};

/** Pan bound to one draggable object so two fingers can move left/right independently. */
export const createObjectPanGesture = ({
  objX,
  objY,
  objScale,
  playW,
  playH,
  half,
  isActive,
  onUpdate,
  onEnd,
  clampX = clampXDefault,
  clampY = clampYDefault,
}: ObjectPanConfig) => {
  const dragStart = { x: 0, y: 0 };

  return Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      if (!isActive()) return;
      objScale.value = withTiming(1.12, { duration: 100 });
      dragStart.x = objX.value;
      dragStart.y = objY.value;
    })
    .onUpdate((e) => {
      if (!isActive()) return;
      const w = playW.current;
      const h = playH.current;
      objX.value = clampX(dragStart.x + e.translationX, w, h, half);
      objY.value = clampY(dragStart.y + e.translationY, w, h, half);
      onUpdate();
    })
    .onEnd(() => {
      if (!isActive()) return;
      objScale.value = withTiming(1, { duration: 100 });
      onUpdate();
      onEnd?.();
    });
};

export type MatchShape = 'circle' | 'square' | 'triangle' | 'star';

const MATCH_SHAPES: { type: MatchShape; emoji: string }[] = [
  { type: 'circle', emoji: '⭕' },
  { type: 'square', emoji: '⬜' },
  { type: 'triangle', emoji: '🔺' },
  { type: 'star', emoji: '⭐' },
];

export const randomMatchShape = (): { type: MatchShape; emoji: string } =>
  MATCH_SHAPES[Math.floor(Math.random() * MATCH_SHAPES.length)];

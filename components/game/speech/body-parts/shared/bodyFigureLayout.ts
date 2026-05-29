import { Platform, useWindowDimensions } from 'react-native';

export type BodyFigureLayout = {
  figureW: number;
  figureH: number;
  slotSize: number;
  slotHalf: number;
};

/** Full-body kid illustration (assets/icons/body-kid-figure.png) */
export const BODY_KID_FIGURE = require('@/assets/icons/body-kid-figure.png');

/** Large standing figure — scales with screen */
export function useBodyFigureLayout(): BodyFigureLayout {
  const { width, height } = useWindowDimensions();

  const maxW = Platform.OS === 'web' ? 520 : 420;
  const widthRatio = Platform.OS === 'web' ? 0.55 : 0.72;
  const figureW = Math.min(maxW, Math.max(300, Math.round(width * widthRatio)));
  const maxH = Math.round(height * 0.48);
  const figureH = Math.min(maxH, Math.round(figureW * 1.55));
  const slotSize = Math.max(64, Math.round(figureW * 0.22));
  const slotHalf = slotSize / 2;

  return { figureW, figureH, slotSize, slotHalf };
}

/** Slot positions tuned for body-kid-figure.png */
export const BODY_SLOT_POSITIONS = {
  head: { top: 0.03, left: 0.5 },
  arm: { top: 0.34, left: 0.5 },
  torso: { top: 0.42, left: 0.5 },
  leg: { top: 0.7, left: 0.5 },
} as const;

export function slotStyleFor(
  part: keyof typeof BODY_SLOT_POSITIONS,
  layout: BodyFigureLayout,
) {
  const pos = BODY_SLOT_POSITIONS[part];
  return {
    top: layout.figureH * pos.top,
    left: layout.figureW * pos.left - layout.slotHalf,
  };
}

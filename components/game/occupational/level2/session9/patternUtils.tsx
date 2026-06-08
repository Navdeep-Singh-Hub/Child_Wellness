/**
 * Pattern generators and render helpers for OT Level 2 Session 9.
 */
import React from 'react';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

export type LineToken = 'vertical' | 'horizontal';
export type BlockToken = 'square' | 'circle';
export type ColorToken = 'red' | 'blue' | 'yellow' | 'green';
export type StrokeType = 'vertical' | 'horizontal' | 'diagonal-down' | 'diagonal-up';
export type MemoryShape = 'circle' | 'square' | 'triangle' | 'cross' | 'plus';

export type Stroke = { type: StrokeType; x1: number; y1: number; x2: number; y2: number };

export const COLOR_HEX: Record<ColorToken, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#F59E0B',
  green: '#10B981',
};

const pick = <T>(arr: T[][]) => arr[Math.floor(Math.random() * arr.length)]!;

export const LINE_PATTERNS: LineToken[][] = [
  ['vertical', 'horizontal', 'vertical', 'horizontal'],
  ['horizontal', 'vertical', 'horizontal'],
  ['vertical', 'vertical', 'horizontal'],
  ['horizontal', 'horizontal', 'vertical'],
  ['vertical', 'horizontal', 'horizontal', 'vertical'],
  ['horizontal', 'vertical', 'vertical', 'horizontal'],
];

export const BLOCK_PATTERNS: BlockToken[][] = [
  ['square', 'circle', 'square', 'circle'],
  ['circle', 'square', 'circle'],
  ['square', 'square', 'circle'],
  ['circle', 'circle', 'square'],
  ['square', 'circle', 'circle', 'square'],
  ['circle', 'square', 'square', 'circle'],
];

export const COLOR_PATTERNS: ColorToken[][] = [
  ['red', 'blue', 'red'],
  ['blue', 'red', 'blue'],
  ['red', 'red', 'blue'],
  ['blue', 'blue', 'red'],
  ['red', 'blue', 'blue', 'red'],
  ['blue', 'red', 'red', 'blue'],
  ['red', 'blue', 'yellow', 'red'],
  ['blue', 'green', 'blue'],
];

export const STROKE_PATTERNS: Stroke[][] = [
  [
    { type: 'vertical', x1: 40, y1: 30, x2: 40, y2: 50 },
    { type: 'horizontal', x1: 30, y1: 40, x2: 50, y2: 40 },
  ],
  [
    { type: 'diagonal-down', x1: 35, y1: 30, x2: 45, y2: 50 },
    { type: 'diagonal-up', x1: 45, y1: 30, x2: 35, y2: 50 },
  ],
  [
    { type: 'vertical', x1: 35, y1: 30, x2: 35, y2: 50 },
    { type: 'vertical', x1: 45, y1: 30, x2: 45, y2: 50 },
    { type: 'horizontal', x1: 35, y1: 40, x2: 45, y2: 40 },
  ],
  [
    { type: 'horizontal', x1: 30, y1: 35, x2: 50, y2: 35 },
    { type: 'horizontal', x1: 30, y1: 45, x2: 50, y2: 45 },
    { type: 'vertical', x1: 40, y1: 35, x2: 40, y2: 45 },
  ],
  [{ type: 'diagonal-down', x1: 30, y1: 30, x2: 50, y2: 50 }],
  [{ type: 'diagonal-up', x1: 50, y1: 30, x2: 30, y2: 50 }],
];

export const MEMORY_SHAPES: MemoryShape[] = ['circle', 'square', 'triangle', 'cross', 'plus'];

export const randomLinePattern = () => pick(LINE_PATTERNS);
export const randomBlockPattern = () => pick(BLOCK_PATTERNS);
export const randomColorPattern = () => pick(COLOR_PATTERNS);
export const randomStrokePattern = () => pick(STROKE_PATTERNS).map((s) => ({ ...s }));
export const randomMemoryShape = (): MemoryShape => MEMORY_SHAPES[Math.floor(Math.random() * MEMORY_SHAPES.length)]!;

export const strokeFromType = (type: StrokeType, target: Stroke): Stroke => {
  const s = { ...target, type };
  if (type === 'vertical') return { ...s, x2: s.x1, y2: s.y1 + 20 };
  if (type === 'horizontal') return { ...s, y2: s.y1, x2: s.x1 + 20 };
  if (type === 'diagonal-down') return { ...s, x2: s.x1 + 10, y2: s.y1 + 20 };
  return { ...s, x2: s.x1 - 10, y2: s.y1 + 20 };
};

export const renderLineToken = (type: LineToken, index: number, color: string) => {
  const y = 30 + index * 15;
  if (type === 'vertical') {
    return <Line key={index} x1={50} y1={y - 3} x2={50} y2={y + 3} stroke={color} strokeWidth={3} strokeLinecap="round" />;
  }
  return <Line key={index} x1={47} y1={y} x2={53} y2={y} stroke={color} strokeWidth={3} strokeLinecap="round" />;
};

export const renderBlockToken = (type: BlockToken, index: number, size: number, fill: string, stroke: string) => {
  const cx = 30 + index * 20;
  const cy = 40;
  if (type === 'square') {
    return <Rect key={index} x={cx - size / 2} y={cy - size / 2} width={size} height={size} fill={fill} stroke={stroke} strokeWidth={1} />;
  }
  return <Circle key={index} cx={cx} cy={cy} r={size / 2} fill={fill} stroke={stroke} strokeWidth={1} />;
};

export const renderStrokeLine = (stroke: Stroke, index: number, color: string) => (
  <Line key={index} x1={stroke.x1} y1={stroke.y1} x2={stroke.x2} y2={stroke.y2} stroke={color} strokeWidth={3} strokeLinecap="round" />
);

export const renderStrokeIcon = (type: StrokeType) => {
  if (type === 'vertical') return <Line x1={15} y1={5} x2={15} y2={25} stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />;
  if (type === 'horizontal') return <Line x1={5} y1={15} x2={25} y2={15} stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />;
  if (type === 'diagonal-down') return <Line x1={8} y1={8} x2={22} y2={22} stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />;
  return <Line x1={22} y1={8} x2={8} y2={22} stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';

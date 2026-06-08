/**
 * Shape rendering helpers for OT Level 2 Session 6 drag-to-match games.
 */
import React from 'react';
import Svg, { Circle, Ellipse, Polygon, Rect } from 'react-native-svg';

export type ShapeKind =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'hexagon'
  | 'pentagon'
  | 'diamond'
  | 'star'
  | 'rectangle'
  | 'oval'
  | 'arrow'
  | 'heart';

export type MatchRound = {
  shape: ShapeKind;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  requiredRotation: number;
};

export type ShapePaint = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
};

const hexPoints = (x: number, y: number, size: number, sides: number, innerRatio = 1) => {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const r = innerRatio < 1 && i % 2 !== 0 ? (size / 2) * innerRatio : size / 2;
    pts.push(`${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
};

export const renderShapeSvg = (
  type: ShapeKind,
  x: number,
  y: number,
  size: number,
  paint: ShapePaint,
  rotation = 0,
  rotateOrigin?: { x: number; y: number },
): React.ReactElement | null => {
  const { fill, stroke, strokeWidth, opacity = 1 } = paint;
  const ox = rotateOrigin?.x ?? x;
  const oy = rotateOrigin?.y ?? y;
  const transform = rotation ? `rotate(${rotation} ${ox} ${oy})` : undefined;

  switch (type) {
    case 'circle':
      return (
        <Circle cx={x} cy={y} r={size / 2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} transform={transform} />
      );
    case 'square':
      return (
        <Rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} transform={transform} />
      );
    case 'triangle':
      return (
        <Polygon
          points={`${x},${y - size / 2} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          transform={transform}
        />
      );
    case 'hexagon':
      return (
        <Polygon points={hexPoints(x, y, size, 6)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} transform={transform} />
      );
    case 'pentagon':
      return (
        <Polygon points={hexPoints(x, y, size, 5)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} transform={transform} />
      );
    case 'diamond':
      return (
        <Polygon
          points={`${x},${y - size / 2} ${x + size / 2},${y} ${x},${y + size / 2} ${x - size / 2},${y}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          transform={transform}
        />
      );
    case 'star': {
      const pts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? size / 2 : size / 4;
        pts.push(`${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`);
      }
      return (
        <Polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} transform={transform} />
      );
    }
    case 'rectangle':
      return (
        <Rect x={x - size / 2} y={y - size / 3} width={size} height={size * 0.6} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} transform={transform} />
      );
    case 'oval':
      return (
        <Ellipse cx={x} cy={y} rx={size / 2} ry={size / 3} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} transform={transform} />
      );
    case 'arrow':
      return (
        <Polygon
          points={`${x},${y - size / 2} ${x - size / 3},${y} ${x - size / 6},${y} ${x - size / 6},${y + size / 2} ${x + size / 6},${y + size / 2} ${x + size / 6},${y} ${x + size / 3},${y}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          transform={transform}
        />
      );
    case 'heart':
      return (
        <Polygon
          points={`${x},${y + size / 4} ${x - size / 3},${y - size / 6} ${x - size / 6},${y - size / 3} ${x},${y - size / 6} ${x + size / 6},${y - size / 3} ${x + size / 3},${y - size / 6}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          transform={transform}
        />
      );
    default:
      return null;
  }
};

export const makeRandomMatchRound = (pool: ShapeKind[], withRotation = false): MatchRound => {
  const shape = pool[Math.floor(Math.random() * pool.length)]!;
  const rotations = [0, 90, 180, 270];
  return {
    shape,
    targetX: 50 + (Math.random() - 0.5) * 24,
    targetY: 62 + Math.random() * 4,
    startX: 22 + Math.random() * 28,
    startY: 22 + Math.random() * 8,
    requiredRotation: withRotation ? rotations[Math.floor(Math.random() * rotations.length)]! : 0,
  };
};

export const rotationMatches = (current: number, required: number, tolerance: number) => {
  const diff = Math.abs(current - required) % 360;
  return diff <= tolerance || diff >= 360 - tolerance;
};

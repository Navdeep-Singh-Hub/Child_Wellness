/**
 * DrawingCanvas with boundary overlay and fill/outside stats.
 */
import React, { useCallback, useImperativeHandle, useRef, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { getFillStats, type Boundary, type FillStats } from './boundaryUtils';
import { getCirclePath, getPolygonPath } from './boundaryShapes';

export type { Boundary, FillStats };

export interface BoundaryDrawingCanvasRef {
  clear: () => void;
}

interface BoundaryDrawingCanvasProps {
  boundary: Boundary;
  width: number;
  height: number;
  brushSize?: number;
  onStrokeEnd?: (strokes: Stroke[]) => void;
  onStatsChange?: (stats: FillStats) => void;
  showBoundaryGlow?: boolean;
  boundaryGlowColor?: string;
}

export const BoundaryDrawingCanvas = forwardRef<BoundaryDrawingCanvasRef, BoundaryDrawingCanvasProps>(function BoundaryDrawingCanvas({
  boundary,
  width,
  height,
  brushSize = 14,
  onStrokeEnd,
  onStatsChange,
  showBoundaryGlow = false,
  boundaryGlowColor = '#22C55E',
}, ref) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  useImperativeHandle(ref, () => ({
    clear: () => canvasRef.current?.clear(),
  }), []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const stats = getFillStats(strokes, boundary, brushSize);
      onStatsChange?.(stats);
      onStrokeEnd?.(strokes);
    },
    [boundary, brushSize, onStrokeEnd, onStatsChange]
  );

  const boundaryPath =
    boundary.type === 'circle'
      ? getCirclePath(boundary.cx, boundary.cy, boundary.r)
      : getPolygonPath(boundary.points);

  return (
    <View style={[styles.container, { width, height }]}>
      <DrawingCanvas
        ref={canvasRef}
        brushSize={brushSize}
        canvasColor="rgba(255,255,255,0.5)"
        randomColors
        onStrokeEnd={handleStrokeEnd}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          {showBoundaryGlow && boundary.type === 'circle' && (
            <Circle
              cx={boundary.cx}
              cy={boundary.cy}
              r={boundary.r + 8}
              stroke={boundaryGlowColor}
              strokeWidth={12}
              fill="none"
              opacity={0.4}
            />
          )}
          {showBoundaryGlow && boundary.type !== 'circle' && (
            <Path
              d={boundaryPath}
              stroke={boundaryGlowColor}
              strokeWidth={12}
              fill="none"
              opacity={0.4}
            />
          )}
          {boundary.type === 'circle' ? (
            <Circle
              cx={boundary.cx}
              cy={boundary.cy}
              r={boundary.r}
              stroke="#5B21B6"
              strokeWidth={5}
              fill="none"
            />
          ) : (
            <Path
              d={boundaryPath}
              stroke="#5B21B6"
              strokeWidth={5}
              fill="none"
            />
          )}
        </Svg>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 24 },
});

/**
 * DrawingCanvas with boundary overlay and fill/outside stats.
 * Strokes are colored teal (inside) / red (outside); stats only count inside brush centers for fill.
 */
import React, { useCallback, useImperativeHandle, useRef, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { getFillStats, pointInBoundary, type Boundary, type FillStats } from './boundaryUtils';
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
  showInsidePulse?: boolean;
}

function pathsToStrokeLikes(paths: { path: string }[], brushWidth: number): { path: string; width: number }[] {
  return paths.map((p) => ({ path: p.path, width: brushWidth }));
}

export const BoundaryDrawingCanvas = forwardRef<BoundaryDrawingCanvasRef, BoundaryDrawingCanvasProps>(
  function BoundaryDrawingCanvas(
    {
      boundary,
      width,
      height,
      brushSize = 14,
      onStrokeEnd,
      onStatsChange,
      showBoundaryGlow = false,
      boundaryGlowColor = '#22C55E',
      showInsidePulse = false,
    },
    ref
  ) {
    const canvasRef = useRef<DrawingCanvasRef>(null);
    const lastTraceEmit = useRef(0);

    useImperativeHandle(
      ref,
      () => ({
        clear: () => canvasRef.current?.clear(),
      }),
      []
    );

    const emitStats = useCallback(
      (paths: { path: string }[]) => {
        if (!onStatsChange) return;
        const strokes = pathsToStrokeLikes(paths, brushSize);
        const stats = getFillStats(strokes, boundary, brushSize);
        onStatsChange(stats);
      },
      [boundary, brushSize, onStatsChange]
    );

    const handleTracingChange = useCallback(
      (paths: { path: string }[]) => {
        const now = Date.now();
        if (now - lastTraceEmit.current < 48) return;
        lastTraceEmit.current = now;
        emitStats(paths);
      },
      [emitStats]
    );

    const handleStrokeEnd = useCallback(
      (strokes: Stroke[]) => {
        const stats = getFillStats(strokes, boundary, brushSize);
        onStatsChange?.(stats);
        onStrokeEnd?.(strokes);
      },
      [boundary, brushSize, onStrokeEnd, onStatsChange]
    );

    const boundaryPath =
      boundary.type === 'circle' ? getCirclePath(boundary.cx, boundary.cy, boundary.r) : getPolygonPath(boundary.points);

    const isInside = useCallback(
      (x: number, y: number) => pointInBoundary({ x, y }, boundary),
      [boundary]
    );

    return (
      <View style={[styles.container, { width, height }]}>
        {/* Behind strokes: soft fill hint */}
        {boundary.type === 'circle' && showInsidePulse && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={width} height={height}>
              <Circle cx={boundary.cx} cy={boundary.cy} r={boundary.r * 0.94} fill="#A7F3D0" opacity={0.14} />
            </Svg>
          </View>
        )}
        <DrawingCanvas
          ref={canvasRef}
          brushSize={brushSize}
          canvasColor="rgba(255,255,255,0.5)"
          randomColors={false}
          onStrokeEnd={handleStrokeEnd}
          onTracingChange={onStatsChange ? handleTracingChange : undefined}
          boundaryStrokeSplit={{
            isInside,
            insideColor: '#0D9488',
            outsideColor: '#DC2626',
          }}
        />
        {/* On top: boundary outline + glow */}
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
                opacity={0.45}
              />
            )}
            {showBoundaryGlow && boundary.type !== 'circle' && (
              <Path
                d={boundaryPath}
                stroke={boundaryGlowColor}
                strokeWidth={12}
                fill="none"
                opacity={0.45}
              />
            )}
            {boundary.type === 'circle' ? (
              <Circle cx={boundary.cx} cy={boundary.cy} r={boundary.r} stroke="#5B21B6" strokeWidth={5} fill="none" />
            ) : (
              <Path d={boundaryPath} stroke="#5B21B6" strokeWidth={5} fill="none" />
            )}
          </Svg>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 24 },
});

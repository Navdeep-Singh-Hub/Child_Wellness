import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import { pathToPoints, type Point } from '@/components/level1-grip-session/shapeFillUtils';

export interface DrawingCanvasRef {
  clear: () => void;
  getStrokeCount: () => number;
}

export interface Stroke {
  path: string;
  color: string;
  width: number;
}

/** When set, stroke segments are colored by whether sample points are inside the shape (e.g. boundary games). */
export interface BoundaryStrokeSplit {
  isInside: (x: number, y: number) => boolean;
  insideColor: string;
  outsideColor: string;
}

interface DrawingCanvasProps {
  onStrokeStart?: () => void;
  onStrokeEnd?: (strokes: Stroke[]) => void;
  /** Fires while drawing so games can score coverage before finger lifts (completed strokes + current polyline). */
  onTracingChange?: (paths: { path: string }[]) => void;
  brushSize?: number;
  canvasColor?: string;
  randomColors?: boolean;
  singleDotMode?: boolean; // For Game 3
  boundaryStrokeSplit?: BoundaryStrokeSplit;
}

const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'];

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Helper to convert point array to SVG path string
const pointsToPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return '';
  const start = points[0];
  let path = `M ${start.x} ${start.y}`;
  
  if (points.length === 1) {
    // Make a small dot if only one point
    path += ` L ${start.x + 0.1} ${start.y + 0.1}`;
    return path;
  }
  
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    path += ` L ${point.x} ${point.y}`;
  }
  return path;
};

function splitPolylineByInside(
  points: Point[],
  isInside: (x: number, y: number) => boolean
): { points: Point[]; inside: boolean }[] {
  if (points.length === 0) return [];
  const out: { points: Point[]; inside: boolean }[] = [];
  let cur: Point[] = [points[0]];
  let curIn = isInside(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const ins = isInside(points[i].x, points[i].y);
    if (ins === curIn) {
      cur.push(points[i]);
    } else {
      out.push({ points: cur, inside: curIn });
      cur = [points[i]];
      curIn = ins;
    }
  }
  out.push({ points: cur, inside: curIn });
  return out;
}

function strokeToColoredSegments(
  stroke: Stroke,
  split: BoundaryStrokeSplit
): { path: string; color: string }[] {
  const pts = pathToPoints(stroke.path);
  if (pts.length === 0) return [];
  const groups = splitPolylineByInside(pts, split.isInside);
  const segs: { path: string; color: string }[] = [];
  for (const g of groups) {
    let p = g.points;
    if (p.length === 1) {
      p = [...p, { x: p[0].x + 0.15, y: p[0].y + 0.15 }];
    }
    const d = pointsToPath(p);
    segs.push({
      path: d,
      color: g.inside ? split.insideColor : split.outsideColor,
    });
  }
  return segs;
}


export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
  onStrokeStart,
  onStrokeEnd,
  onTracingChange,
  brushSize = 10,
  canvasColor = 'transparent',
  randomColors = true,
  singleDotMode = false,
  boundaryStrokeSplit,
}, ref) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const strokesRef = useRef<Stroke[]>([]);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
  const currentColorRef = useRef(COLORS[0]);
  strokesRef.current = strokes;
  currentPointsRef.current = currentPoints;
  currentColorRef.current = currentColor;

  useImperativeHandle(ref, () => ({
    clear: () => {
      setStrokes([]);
      setCurrentPoints([]);
      strokesRef.current = [];
      currentPointsRef.current = [];
    },
    getStrokeCount: () => strokes.length + (currentPoints.length > 0 ? 1 : 0)
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  const getNextColor = useCallback(() => {
    if (!randomColors) return '#4F46E5'; // Default indigo
    const randIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randIndex];
  }, [randomColors]);

  const emitTracingPaths = useCallback((currentPts: { x: number; y: number }[]) => {
    if (!onTracingChange) return;
    const paths = strokesRef.current.map((s) => ({ path: s.path }));
    if (currentPts.length === 0) {
      onTracingChange(paths);
      return;
    }
    const pts =
      currentPts.length === 1
        ? [...currentPts, { x: currentPts[0].x + 0.1, y: currentPts[0].y + 0.1 }]
        : currentPts;
    paths.push({ path: pointsToPath(pts) });
    onTracingChange(paths);
  }, [onTracingChange]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onStart((e) => {
      onStrokeStart?.();
      const newColor = getNextColor();
      setCurrentColor(newColor);
      currentColorRef.current = newColor;

      const p = { x: e.x, y: e.y };

      if (singleDotMode) {
        const dotPath = `M ${e.x} ${e.y} m -${brushSize}, 0 a ${brushSize},${brushSize} 0 1,0 ${brushSize*2},0 a ${brushSize},${brushSize} 0 1,0 -${brushSize*2},0`;
        const newStroke = { path: dotPath, color: newColor, width: brushSize };
        const newStrokes = [...strokesRef.current, newStroke];
        setStrokes(newStrokes);
        onStrokeEnd?.(newStrokes);
      } else {
        setCurrentPoints([p]);
        currentPointsRef.current = [p];
        emitTracingPaths([p]);
      }
    })
    .onUpdate((e) => {
      if (singleDotMode) return;
      const prev = currentPointsRef.current;
      const next = [...prev, { x: e.x, y: e.y }];
      currentPointsRef.current = next;
      setCurrentPoints(next);
      emitTracingPaths(next);
    })
    .onEnd(() => {
      if (singleDotMode) return;

      const points = currentPointsRef.current;
      if (points.length > 0) {
        const finalPath = pointsToPath(points);
        const newStroke = { path: finalPath, color: currentColorRef.current, width: brushSize };
        const newStrokes = [...strokesRef.current, newStroke];
        setStrokes(newStrokes);
        setCurrentPoints([]);
        currentPointsRef.current = [];
        onTracingChange?.(newStrokes.map((s) => ({ path: s.path })));
        onStrokeEnd?.(newStrokes);
      }
    });

  const gesture = singleDotMode ? Gesture.Tap().runOnJS(true).onEnd((e) => {
    onStrokeStart?.();
    const newColor = getNextColor();
    const dotPath = `M ${e.x} ${e.y} m -${brushSize}, 0 a ${brushSize},${brushSize} 0 1,0 ${brushSize*2},0 a ${brushSize},${brushSize} 0 1,0 -${brushSize*2},0`;
    const newStroke = { path: dotPath, color: newColor, width: brushSize };
    const newStrokes = [...strokesRef.current, newStroke];
    setStrokes(newStrokes);
    onStrokeEnd?.(newStrokes);
  }) : panGesture;

  const currentPathString = pointsToPath(currentPoints);

  const currentSegments = useMemo(() => {
    if (!boundaryStrokeSplit || currentPoints.length === 0) return null;
    const pts =
      currentPoints.length === 1
        ? [...currentPoints, { x: currentPoints[0].x + 0.15, y: currentPoints[0].y + 0.15 }]
        : currentPoints;
    return splitPolylineByInside(pts, boundaryStrokeSplit.isInside).map((g) => {
      let p = g.points;
      if (p.length === 1) p = [...p, { x: p[0].x + 0.15, y: p[0].y + 0.15 }];
      return {
        path: pointsToPath(p),
        color: g.inside ? boundaryStrokeSplit.insideColor : boundaryStrokeSplit.outsideColor,
      };
    });
  }, [currentPoints, boundaryStrokeSplit]);

  return (
    <View 
      style={[styles.container, { backgroundColor: canvasColor }]} 
      onLayout={handleLayout}
      accessibilityLabel="Drawing Canvas"
    >
      <GestureDetector gesture={gesture}>
        <View style={styles.drawingSurface}>
          <Svg style={styles.svg} width="100%" height="100%">
            {/* Completed Strokes */}
            {strokes.flatMap((stroke, index) =>
              boundaryStrokeSplit ? (
                strokeToColoredSegments(stroke, boundaryStrokeSplit).map((seg, j) => (
                  <Path
                    key={`stroke-${index}-${j}`}
                    d={seg.path}
                    stroke={seg.color}
                    strokeWidth={stroke.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))
              ) : [
                <Path
                  key={`stroke-${index}`}
                  d={stroke.path}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />,
              ]
            )}
            
            {/* Current Active Stroke */}
            {!singleDotMode && currentPoints.length > 0 && (
              boundaryStrokeSplit && currentSegments ? (
                currentSegments.map((seg, j) => (
                  <Path
                    key={`cur-${j}`}
                    d={seg.path}
                    stroke={seg.color}
                    strokeWidth={brushSize}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))
              ) : (
                <Path
                  d={currentPathString}
                  stroke={currentColor}
                  strokeWidth={brushSize}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )
            )}
          </Svg>
        </View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 24, // match React Native rounded-3xl approx
  },
  drawingSurface: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});

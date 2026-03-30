import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent, PanResponderInstance, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

export interface DrawingCanvasRef {
  clear: () => void;
  getStrokeCount: () => number;
}

export interface Stroke {
  path: string;
  color: string;
  width: number;
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


export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
  onStrokeStart,
  onStrokeEnd,
  onTracingChange,
  brushSize = 10,
  canvasColor = 'transparent',
  randomColors = true,
  singleDotMode = false
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
            {strokes.map((stroke, index) => (
              <Path
                key={`stroke-${index}`}
                d={stroke.path}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            
            {/* Current Active Stroke */}
            {!singleDotMode && currentPoints.length > 0 && (
              <Path
                d={currentPathString}
                stroke={currentColor}
                strokeWidth={brushSize}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
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

/**
 * Game 2: Color Scribble Fill — scribble inside butterfly or flower; >60% fill → success.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { pathToPoints, pointInPolygon, polygonArea } from './shapeFillUtils';
import { BUTTERFLY_POLYGON, FLOWER_POLYGON, shapeToCanvas, getButterflyPath, getFlowerPath } from './shapes';
import { GameContainerGrip } from './GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const FILL_THRESHOLD = 0.6;
const BRUSH_SIZE = 14;

const SHAPES = [
  { key: 'butterfly', polygon: BUTTERFLY_POLYGON, getPath: getButterflyPath, label: 'Butterfly' },
  { key: 'flower', polygon: FLOWER_POLYGON, getPath: getFlowerPath, label: 'Flower' },
] as const;

function computeFillRatio(
  strokes: Stroke[],
  shapePolygonCanvas: { x: number; y: number }[],
  brushSize: number
): number {
  const shapeArea = polygonArea(shapePolygonCanvas);
  if (shapeArea <= 0) return 0;
  let filledArea = 0;
  const brushArea = Math.PI * brushSize * brushSize;
  for (const stroke of strokes) {
    const points = pathToPoints(stroke.path);
    for (const p of points) {
      if (pointInPolygon(p, shapePolygonCanvas)) filledArea += brushArea;
    }
  }
  return filledArea / shapeArea;
}

export function ColorScribbleFillGame({
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [shapeIndex, setShapeIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 280, height: 280 });
  const [fillRatio, setFillRatio] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const strokesRef = useRef<Stroke[]>([]);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const shape = SHAPES[shapeIndex];
  const shapePolygonCanvas = shapeToCanvas(shape.polygon, dimensions.width, dimensions.height);
  const outlinePath = shape.getPath(dimensions.width, dimensions.height);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      strokesRef.current = strokes;
      const ratio = computeFillRatio(strokes, shapePolygonCanvas, BRUSH_SIZE);
      setFillRatio(ratio);
      if (ratio >= FILL_THRESHOLD) {
        setShowConfetti(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          if (shapeIndex < SHAPES.length - 1) {
            setShapeIndex((i) => i + 1);
            canvasRef.current?.clear();
            setFillRatio(0);
          } else {
            onComplete();
          }
        }, 1500);
      }
    },
    [shapePolygonCanvas, shapeIndex, onComplete]
  );

  return (
    <GameContainerGrip
      title="Color Scribble Fill"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🦋"
      mascotHint="Scribble inside the shape!"
      onBack={onBack}
    >
      <View style={styles.outer}>
        <Text style={styles.shapeLabel}>{shape.label}</Text>
        <View style={styles.canvasWrap} onLayout={handleLayout}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={BRUSH_SIZE}
            canvasColor="rgba(255,255,255,0.6)"
            randomColors
            onStrokeEnd={handleStrokeEnd}
          />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg style={StyleSheet.absoluteFill}>
              <Path
                d={outlinePath}
                stroke="#5B21B6"
                strokeWidth={4}
                fill="none"
              />
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Fill: {Math.round(fillRatio * 100)}%</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(100, fillRatio * 100)}%` }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  shapeLabel: { fontSize: 18, fontWeight: '800', color: '#5B21B6', marginBottom: 8, textAlign: 'center' },
  canvasWrap: { flex: 1, minHeight: 260, borderRadius: 24, overflow: 'hidden' },
  progressRow: { marginTop: 12, gap: 6 },
  progressLabel: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#5B21B6', borderRadius: 6 },
});

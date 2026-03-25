/**
 * Game 2: Color Scribble Fill — scribble inside butterfly or flower; >60% fill → success.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { pathToPoints, pointInPolygon } from './shapeFillUtils';
import { CIRCLE_POLYGON, FLOWER_POLYGON, shapeToCanvas, getCirclePath, getFlowerPath } from './shapes';
import { GameContainerGrip } from './GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const FILL_THRESHOLD = 0.6;
const BRUSH_SIZE = 14;

const SHAPES = [
  { key: 'circle', polygon: CIRCLE_POLYGON, getPath: getCirclePath, label: 'Circle' },
  { key: 'star', polygon: FLOWER_POLYGON, getPath: getFlowerPath, label: 'Star' },
] as const;

function computeFillRatio(
  strokes: Stroke[],
  shapePolygonCanvas: { x: number; y: number }[],
  brushSize: number
): number {
  if (shapePolygonCanvas.length < 3) return 0;

  const radius = brushSize;
  const cellSize = Math.max(4, Math.floor(brushSize * 0.6));
  const filledCells = new Set<string>();

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of shapePolygonCanvas) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const markBrushCoverage = (x: number, y: number) => {
    const gxMin = Math.floor((x - radius) / cellSize);
    const gxMax = Math.floor((x + radius) / cellSize);
    const gyMin = Math.floor((y - radius) / cellSize);
    const gyMax = Math.floor((y + radius) / cellSize);
    for (let gx = gxMin; gx <= gxMax; gx++) {
      for (let gy = gyMin; gy <= gyMax; gy++) {
        const cx = gx * cellSize + cellSize / 2;
        const cy = gy * cellSize + cellSize / 2;
        const dx = cx - x;
        const dy = cy - y;
        if (dx * dx + dy * dy > radius * radius) continue;
        if (!pointInPolygon({ x: cx, y: cy }, shapePolygonCanvas)) continue;
        filledCells.add(`${gx},${gy}`);
      }
    }
  };

  for (const stroke of strokes) {
    const points = pathToPoints(stroke.path);
    if (points.length === 0) continue;
    markBrushCoverage(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(dist / (cellSize * 0.5)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        markBrushCoverage(x, y);
      }
    }
  }

  let shapeCellCount = 0;
  const gxMin = Math.floor(minX / cellSize);
  const gxMax = Math.floor(maxX / cellSize);
  const gyMin = Math.floor(minY / cellSize);
  const gyMax = Math.floor(maxY / cellSize);
  for (let gx = gxMin; gx <= gxMax; gx++) {
    for (let gy = gyMin; gy <= gyMax; gy++) {
      const cx = gx * cellSize + cellSize / 2;
      const cy = gy * cellSize + cellSize / 2;
      if (pointInPolygon({ x: cx, y: cy }, shapePolygonCanvas)) {
        shapeCellCount += 1;
      }
    }
  }

  if (shapeCellCount === 0) return 0;
  return Math.min(1, filledCells.size / shapeCellCount);
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
  const isAdvancingRef = useRef(false);

  const shape = SHAPES[shapeIndex] ?? SHAPES[0];
  const shapePolygonCanvas = shapeToCanvas(shape.polygon, dimensions.width, dimensions.height);
  const outlinePath = shape.getPath(dimensions.width, dimensions.height);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      if (isAdvancingRef.current) return;
      strokesRef.current = strokes;
      const ratio = computeFillRatio(strokes, shapePolygonCanvas, BRUSH_SIZE);
      setFillRatio(ratio);
      if (ratio >= FILL_THRESHOLD) {
        isAdvancingRef.current = true;
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
            isAdvancingRef.current = false;
          } else {
            onComplete();
            isAdvancingRef.current = false;
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
            <Svg
              style={StyleSheet.absoluteFill}
              width={dimensions.width}
              height={dimensions.height}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
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
  canvasWrap: { flex: 1, minHeight: 260, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFF' },
  progressRow: { marginTop: 12, gap: 6 },
  progressLabel: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#5B21B6', borderRadius: 6 },
});

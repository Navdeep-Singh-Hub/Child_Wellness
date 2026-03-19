/**
 * Game 2: Trace Triangle — dotted triangle, connect dots, ≥80% success. Highlight next dot, glow edges when traced.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { triangleDots, triangleEdges } from './shapePaths';
import { getConnectedFromStrokes, completionPercent } from './dotTracingUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const SEGMENT_COUNT = 6;
const HIT_RADIUS = 32;
const SUCCESS_PERCENT = 80;

export function TraceTriangleGame({
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
  const [dimensions, setDimensions] = useState({ width: 280, height: 280 });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const dots = triangleDots(dimensions.width, dimensions.height, 0.38, SEGMENT_COUNT);
  const edges = triangleEdges(SEGMENT_COUNT);
  const totalDots = dots.length;

  const connected = getConnectedFromStrokes(strokes, dots, HIT_RADIUS);
  const percent = completionPercent(connected, totalDots);

  const nextDotIndex = React.useMemo(() => {
    for (let i = 0; i < totalDots; i++) if (!connected.has(i)) return i;
    return null;
  }, [connected, totalDots]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback((newStrokes: Stroke[]) => {
    setStrokes(newStrokes);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  }, []);

  React.useEffect(() => {
    if (percent >= SUCCESS_PERCENT && !showConfetti) {
      setShowConfetti(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 1500);
    }
  }, [percent, showConfetti, onComplete]);

  const edgeTraced = (startIdx: number, endIdx: number) => {
    return connected.has(startIdx) && connected.has(endIdx);
  };

  return (
    <GameContainerGrip
      title="Trace the Triangle"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔺"
      mascotHint="Connect the dots to make a triangle!"
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={12}
            canvasColor="rgba(255,255,255,0.3)"
            randomColors={false}
            onStrokeEnd={handleStrokeEnd}
          />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dimensions.width} height={dimensions.height}>
              {edges.map(([startIdx, endIdx], i) => {
                const a = dots[startIdx];
                const b = dots[endIdx];
                const traced = edgeTraced(startIdx, endIdx);
                return (
                  <Line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={traced ? '#22C55E' : '#5B21B6'}
                    strokeWidth={traced ? 5 : 2}
                    opacity={traced ? 0.9 : 0.4}
                  />
                );
              })}
              {dots.map((d, i) => (
                <Circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={i === nextDotIndex ? 14 : connected.has(i) ? 12 : 10}
                  fill={i === nextDotIndex ? '#F59E0B' : connected.has(i) ? '#22C55E' : '#5B21B6'}
                  opacity={i === nextDotIndex ? 1 : connected.has(i) ? 0.9 : 0.6}
                />
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Connected: {connected.size} / {totalDots}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(100, percent)}%` }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 260, borderRadius: 24, overflow: 'hidden' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
});

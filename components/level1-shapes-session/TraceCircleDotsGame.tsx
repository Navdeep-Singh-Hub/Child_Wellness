/**
 * Game 1: Trace Circle (dots) — connect dots in a circle, ≥80% success. Progress ring, dot glow, pop feedback.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { circleDots } from './shapePaths';
import { getConnectedFromStrokes, completionPercent } from './dotTracingUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const DOT_COUNT = 24;
const HIT_RADIUS = 36;
const SUCCESS_PERCENT = 80;

export function TraceCircleDotsGame({
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
  const prevConnectedRef = useRef(0);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;
  const r = Math.min(dimensions.width, dimensions.height) * 0.38;
  const dots = circleDots(cx, cy, r, DOT_COUNT);

  const connected = getConnectedFromStrokes(strokes, dots, HIT_RADIUS);
  const percent = completionPercent(connected, DOT_COUNT);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback((newStrokes: Stroke[]) => {
    setStrokes(newStrokes);
    const nextConnected = getConnectedFromStrokes(newStrokes, dots, HIT_RADIUS);
    if (nextConnected.size > prevConnectedRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
      prevConnectedRef.current = nextConnected.size;
    }
  }, [dots]);

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

  const progressAngle = (percent / 100) * 360;
  const progressPath = progressAngle >= 360
    ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy - r - 0.01}`
    : progressAngle > 0
    ? describeArc(cx, cy, r, -90, -90 + progressAngle)
    : '';

  return (
    <GameContainerGrip
      title="Trace the Circle"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="⭕"
      mascotHint="Connect the dots to trace the circle!"
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
              {progressPath ? (
                <Path
                  d={progressPath}
                  stroke="#22C55E"
                  strokeWidth={8}
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null}
              {dots.map((d, i) => (
                <Circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={connected.has(i) ? 14 : 10}
                  fill={connected.has(i) ? '#22C55E' : '#5B21B6'}
                  opacity={connected.has(i) ? 0.9 : 0.6}
                />
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Connected: {connected.size} / {DOT_COUNT}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(100, percent)}%` }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = (startDeg * Math.PI) / 180;
  const end = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 260, borderRadius: 24, overflow: 'hidden' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
});

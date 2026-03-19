/**
 * Game 1: Trace horizontal (sleeping) lines — connect dots left→right, ≥80% connected, path mostly horizontal.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import {
  horizontalDots,
  getConnectedFromStrokes,
  isPathMostlyHorizontal,
  completionPercent,
  type Point,
} from './lineAngleUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const HIT_RADIUS = 26;
const DOT_COUNT = 6;
const LINE_COUNT = 2;
const SUCCESS_PCT = 80;
const MAX_DEVIATION = 48;

export function TraceHorizontalLinesGame({
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
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const margin = 45;
  const leftX = margin + 20;
  const rightX = dimensions.width - margin - 20;
  const spacing = (dimensions.height - margin * 2) / (LINE_COUNT + 1);
  const allDots: Point[] = [];
  for (let L = 0; L < LINE_COUNT; L++) {
    const y = margin + spacing * (L + 1);
    allDots.push(...horizontalDots(y, leftX, rightX, DOT_COUNT));
  }
  const totalDots = allDots.length;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const next = getConnectedFromStrokes(strokes, allDots, HIT_RADIUS);
      setConnected(next);
      const pct = completionPercent(next, totalDots);
      const lastPath = strokes[strokes.length - 1]?.path;
      const horizontalOk = !lastPath || isPathMostlyHorizontal(lastPath, MAX_DEVIATION);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
      if (pct >= SUCCESS_PCT && horizontalOk) {
        setShowConfetti(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, 1500);
      }
    },
    [allDots, totalDots, onComplete]
  );

  const pct = completionPercent(connected, totalDots);

  return (
    <GameContainerGrip
      title="Trace Sleeping Lines"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="→"
      mascotHint="Draw sleeping lines! Connect dots left to right."
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <Text style={styles.arrowHint}>→ Go right</Text>
        <View style={styles.canvasWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={12}
            canvasColor="rgba(255,255,255,0.6)"
            randomColors={false}
            onStrokeEnd={handleStrokeEnd}
          />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dimensions.width} height={dimensions.height}>
              {allDots.map((d, i) => (
                <Circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={connected.has(i) ? 14 : 10}
                  fill={connected.has(i) ? '#22C55E' : '#A78BFA'}
                  opacity={connected.has(i) ? 1 : 0.85}
                />
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Connected: {Math.round(pct)}%</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  arrowHint: { fontSize: 18, fontWeight: '800', color: '#5B21B6', textAlign: 'center', marginBottom: 8 },
  canvasWrap: { flex: 1, minHeight: 240, borderRadius: 24, overflow: 'hidden' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
});

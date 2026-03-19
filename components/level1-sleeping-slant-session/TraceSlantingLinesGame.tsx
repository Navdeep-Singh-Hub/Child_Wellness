/**
 * Game 2: Trace slanting lines — left diagonal (/) and right diagonal (\), ≥75% each.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import {
  slantDots,
  getConnectedFromStrokes,
  getStrokeAngle,
  isAngleNear,
  completionPercent,
  type Point,
} from './lineAngleUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const HIT_RADIUS = 28;
const DOT_COUNT = 5;
const SUCCESS_PCT = 75;
const ANGLE_TOLERANCE = 25;

export function TraceSlantingLinesGame({
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
  const [stage, setStage] = useState<'left' | 'right'>('left');
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const margin = 55;
  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;
  const len = Math.min(dimensions.width, dimensions.height) * 0.28;
  const leftSlantDots = slantDots(cx - len, cy + len, cx + len, cy - len, DOT_COUNT);
  const rightSlantDots = slantDots(cx - len, cy - len, cx + len, cy + len, DOT_COUNT);
  const dots = stage === 'left' ? leftSlantDots : rightSlantDots;
  const totalDots = dots.length;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const next = getConnectedFromStrokes(strokes, dots, HIT_RADIUS);
      setConnected(next);
      const pct = completionPercent(next, totalDots);
      const last = strokes[strokes.length - 1]?.path;
      const angle = last ? getStrokeAngle(last) : 0;
      const leftOk = isAngleNear(angle, 45, ANGLE_TOLERANCE) || isAngleNear(angle, -135, ANGLE_TOLERANCE);
      const rightOk = isAngleNear(angle, -45, ANGLE_TOLERANCE) || isAngleNear(angle, 135, ANGLE_TOLERANCE);
      const angleOk = stage === 'left' ? leftOk : rightOk;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
      if (pct >= SUCCESS_PCT && angleOk) {
        setShowConfetti(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          if (stage === 'left') {
            setStage('right');
            canvasRef.current?.clear();
            setConnected(new Set());
          } else {
            onComplete();
          }
        }, 1500);
      }
    },
    [dots, totalDots, stage, onComplete]
  );

  const pct = completionPercent(connected, totalDots);

  return (
    <GameContainerGrip
      title="Trace Slanting Lines"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="↗️"
      mascotHint={stage === 'left' ? 'Trace the line like /' : 'Trace the line like \\'}
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <Text style={styles.arrowHint}>{stage === 'left' ? '↗ Slant this way' : '↘ Slant this way'}</Text>
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
              {dots.map((d, i) => (
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
          <Text style={styles.label}>{stage === 'left' ? 'Left slant' : 'Right slant'}: {Math.round(pct)}%</Text>
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

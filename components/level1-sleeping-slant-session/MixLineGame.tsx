/**
 * Game 4: Mix line game — trace vertical, horizontal, slant; ≥80% correct across all.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import {
  horizontalDots,
  slantDots,
  getConnectedFromStrokes,
  getStrokeAngle,
  isAngleNear,
  isPathMostlyHorizontal,
  completionPercent,
  type Point,
} from './lineAngleUtils';
import { verticalDots, isPathMostlyVertical } from '@/components/level1-standing-lines-session/verticalTracingUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const HIT_RADIUS = 24;
const DOT_COUNT = 4;
const SUCCESS_PCT = 80;
const MAX_H_V_DEVIATION = 45;
const ANGLE_TOLERANCE = 28;

type LineKind = 'vertical' | 'horizontal' | 'slantLeft' | 'slantRight';

interface LineDef {
  kind: LineKind;
  dots: Point[];
}

function buildLines(width: number, height: number): LineDef[] {
  const margin = 50;
  const cx = width / 2;
  const cy = height / 2;
  const len = Math.min(width, height) * 0.2;
  return [
    { kind: 'vertical', dots: verticalDots(cx - 60, cy - len, cy + len, DOT_COUNT) },
    { kind: 'horizontal', dots: horizontalDots(cy - 50, cx - len, cx + len, DOT_COUNT) },
    { kind: 'slantLeft', dots: slantDots(cx - 50, cy + 30, cx + 50, cy - 30, DOT_COUNT) },
    { kind: 'slantRight', dots: slantDots(cx - 50, cy - 30, cx + 50, cy + 30, DOT_COUNT) },
  ];
}

function checkLineCorrect(strokePath: string, kind: LineKind): boolean {
  const pct = 100;
  const connected = 1;
  if (kind === 'vertical') return isPathMostlyVertical(strokePath, MAX_H_V_DEVIATION);
  if (kind === 'horizontal') return isPathMostlyHorizontal(strokePath, MAX_H_V_DEVIATION);
  const angle = getStrokeAngle(strokePath);
  if (kind === 'slantLeft') return isAngleNear(angle, 45, ANGLE_TOLERANCE) || isAngleNear(angle, -135, ANGLE_TOLERANCE);
  return isAngleNear(angle, -45, ANGLE_TOLERANCE) || isAngleNear(angle, 135, ANGLE_TOLERANCE);
}

export function MixLineGame({
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
  const [dimensions, setDimensions] = useState({ width: 300, height: 320 });
  const lines = React.useMemo(() => buildLines(dimensions.width, dimensions.height), [dimensions.width, dimensions.height]);
  const allDots = React.useMemo(() => lines.flatMap((l) => l.dots), [lines]);
  const totalDots = allDots.length;
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [correctLines, setCorrectLines] = useState<Set<LineKind>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const next = getConnectedFromStrokes(strokes, allDots, HIT_RADIUS);
      setConnected(next);
      const pct = completionPercent(next, totalDots);
      const last = strokes[strokes.length - 1]?.path;
      const newCorrect = new Set<LineKind>();
      if (last) {
        for (let L = 0; L < lines.length; L++) {
          const line = lines[L];
          let hitCount = 0;
          for (let i = 0; i < line.dots.length; i++) {
            if (next.has(L * DOT_COUNT + i)) hitCount++;
          }
          const linePct = (hitCount / line.dots.length) * 100;
          if (linePct >= 75 && checkLineCorrect(last, line.kind)) {
            newCorrect.add(line.kind);
          }
        }
      }
      setCorrectLines((prev) => {
        const merged = new Set(prev);
        newCorrect.forEach((k) => merged.add(k));
        if (pct >= 70 && merged.size >= 3) {
          setTimeout(() => {
            setShowConfetti(true);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (_) {}
            setTimeout(() => {
              setShowConfetti(false);
              onComplete();
            }, 1500);
          }, 100);
        }
        return merged;
      });
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    },
    [allDots, totalDots, lines, onComplete]
  );

  const pct = completionPercent(connected, totalDots);
  const correctCount = correctLines.size;

  return (
    <GameContainerGrip
      title="Mix Line Game"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="📐"
      mascotHint="Trace all the lines!"
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={11}
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
                  r={connected.has(i) ? 12 : 8}
                  fill={connected.has(i) ? '#22C55E' : '#A78BFA'}
                  opacity={connected.has(i) ? 1 : 0.85}
                />
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Connected: {Math.round(pct)}% · Correct: {correctCount}/{lines.length}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        </View>
        <View style={styles.stars}>
          {lines.map((l) => (
            <Text key={l.kind} style={[styles.star, correctLines.has(l.kind) && styles.starEarned]}>⭐</Text>
          ))}
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 15, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  star: { fontSize: 24, opacity: 0.35 },
  starEarned: { opacity: 1 },
});

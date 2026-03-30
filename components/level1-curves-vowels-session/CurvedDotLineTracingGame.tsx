/**
 * Game 1: Curved Dotted Line Tracing
 * Three stages: semicircle → wave curve → full circle.
 * Connect dots along curved paths. ≥75% dots → success.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Pressable } from 'react-native';
import Svg, { Circle, Path as SvgPath } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import {
  semicircleDots,
  waveDots,
  fullCircleDots,
  getConnectedFromStrokes,
  completionPercent,
  type Point,
} from './curvedPathUtils';

const HIT_RADIUS = 22;
const SUCCESS_PCT = 80;

type Stage = 'semi' | 'wave' | 'circle';
const STAGES: Stage[] = ['semi', 'wave', 'circle'];
const STAGE_LABELS: Record<Stage, string> = {
  semi: 'Semi-Circle',
  wave: 'Wave Curve',
  circle: 'Full Circle',
};

function buildDots(stage: Stage, w: number, h: number): Point[] {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.32;
  switch (stage) {
    case 'semi':
      return semicircleDots(cx, cy, r, 8);
    case 'wave':
      return waveDots(w * 0.12, w * 0.88, cy, h * 0.22, 10);
    case 'circle':
      return fullCircleDots(cx, cy, r, 10);
  }
}

function guidePath(dots: Point[]): string {
  if (dots.length < 2) return '';
  let d = `M ${dots[0].x} ${dots[0].y}`;
  for (let i = 1; i < dots.length; i++) {
    d += ` L ${dots[i].x} ${dots[i].y}`;
  }
  return d;
}

export function CurvedDotLineTracingGame({
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
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [stageIdx, setStageIdx] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const stage = STAGES[stageIdx];
  const dots = useMemo(() => buildDots(stage, dims.width, dims.height), [stage, dims]);
  const guide = useMemo(() => guidePath(dots), [dots]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const nextDotIdx = useMemo(() => {
    for (let i = 0; i < dots.length; i++) {
      if (!connected.has(i)) return i;
    }
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const next = getConnectedFromStrokes(strokes, dots, HIT_RADIUS);
      setConnected(next);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      const pct = completionPercent(next, dots.length);
      if (pct >= SUCCESS_PCT) {
        if (stageIdx < STAGES.length - 1) {
          setShowConfetti(true);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
          setTimeout(() => {
            setShowConfetti(false);
            setStageIdx((s) => s + 1);
            setConnected(new Set());
            canvasRef.current?.clear();
          }, 1200);
        } else {
          setShowConfetti(true);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, 1500);
        }
      }
    },
    [dots, stageIdx, onComplete]
  );

  const pct = completionPercent(connected, dots.length);

  return (
    <GameContainerGrip
      title={`Trace: ${STAGE_LABELS[stage]}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="〰️"
      mascotHint="Let's draw curves! Connect the dots along the curved path."
      onBack={onBack}
    >
      <View style={styles.stageRow}>
        {STAGES.map((s, i) => (
          <View
            key={s}
            style={[styles.stageDot, i <= stageIdx && styles.stageDotActive]}
          >
            <Text style={[styles.stageDotText, i <= stageIdx && styles.stageDotTextActive]}>
              {i + 1}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={10}
            canvasColor="rgba(255,255,255,0.6)"
            randomColors={false}
            onStrokeEnd={handleStrokeEnd}
          />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dims.width} height={dims.height}>
              <SvgPath d={guide} stroke="#C4B5FD" strokeWidth={2} strokeDasharray="6 6" fill="none" />
              {dots.map((d, i) => (
                <React.Fragment key={i}>
                  {i === nextDotIdx && (
                    <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#F59E0B" strokeWidth={3} opacity={0.7} />
                  )}
                  <Circle
                    cx={d.x}
                    cy={d.y}
                    r={connected.has(i) ? 13 : 10}
                    fill={connected.has(i) ? '#22C55E' : '#A78BFA'}
                    opacity={connected.has(i) ? 1 : 0.85}
                  />
                </React.Fragment>
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
  stageRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 10 },
  stageDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  stageDotActive: { backgroundColor: '#5B21B6' },
  stageDotText: { fontSize: 14, fontWeight: '800', color: '#9CA3AF' },
  stageDotTextActive: { color: '#FFF' },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 240, borderRadius: 24, overflow: 'hidden' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
});

/**
 * Game 1: Moon Arch Bridge — curved dotted line tracing.
 * Three stages: semicircle → wave → full circle.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Circle, Path as SvgPath } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { CurveGameShell } from './curves-shared/CurveGameShell';
import { MoonBridgeBackground } from './arch-bridge/MoonBridgeBackground';
import { LunaMascot } from './arch-bridge/LunaMascot';
import { FlowMeter } from './arch-bridge/FlowMeter';
import { MOON_BRIDGE, SHELL_MOON, STAGE_HINTS, STAGE_LABELS } from './arch-bridge/theme';
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
  for (let i = 1; i < dots.length; i++) d += ` L ${dots[i].x} ${dots[i].y}`;
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
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const spokeStage = useRef(-1);

  const stage = STAGES[stageIdx];
  const dots = useMemo(() => buildDots(stage, dims.width, dims.height), [stage, dims]);
  const guide = useMemo(() => guidePath(dots), [dots]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (spokeStage.current !== stageIdx) {
      spokeStage.current = stageIdx;
      speak(STAGE_HINTS[stage], 0.72);
    }
  }, [stage, stageIdx]);

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
          speak(`Beautiful! Now try the ${STAGE_LABELS[STAGES[stageIdx + 1]]}!`, 0.72);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
          setTimeout(() => {
            setShowConfetti(false);
            setStageIdx((s) => s + 1);
            setConnected(new Set());
            canvasRef.current?.clear();
          }, reduceMotion ? 400 : 1200);
        } else {
          setShowConfetti(true);
          speak('You crossed every arch on the bridge! Wonderful curves!', 0.72);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [dots, stageIdx, onComplete, reduceMotion],
  );

  const pct = completionPercent(connected, dots.length);

  return (
    <View style={styles.root}>
      <MoonBridgeBackground />
      <CurveGameShell
        theme={SHELL_MOON}
        gameLabel="MOON ARCH BRIDGE"
        gameTitle={STAGE_LABELS[stage]}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LunaMascot hint={STAGE_HINTS[stage]} />

        <View style={styles.stageRow}>
          {STAGES.map((s, i) => (
            <View key={s} style={[styles.stagePill, i <= stageIdx && styles.stagePillActive]}>
              <Text style={[styles.stagePillText, i <= stageIdx && styles.stagePillTextActive]}>
                {STAGE_LABELS[s]}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.canvasWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(15,23,42,0.45)"
              randomColors={false}
              onStrokeEnd={handleStrokeEnd}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                <SvgPath d={guide} stroke={MOON_BRIDGE.guide} strokeWidth={2} strokeDasharray="6 6" fill="none" />
                {dots.map((d, i) => (
                  <React.Fragment key={i}>
                    {i === nextDotIdx && (
                      <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke={MOON_BRIDGE.dotActive} strokeWidth={3} opacity={0.8} />
                    )}
                    <Circle
                      cx={d.x}
                      cy={d.y}
                      r={connected.has(i) ? 13 : 10}
                      fill={connected.has(i) ? MOON_BRIDGE.dotDone : MOON_BRIDGE.dotIdle}
                      opacity={connected.has(i) ? 1 : 0.85}
                    />
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          </View>
          <FlowMeter percent={pct} />
        </View>
      </CurveGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MOON_BRIDGE.skyTop },
  stageRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  stagePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  stagePillActive: { backgroundColor: 'rgba(129,140,248,0.35)' },
  stagePillText: { fontSize: 10, fontWeight: '700', color: MOON_BRIDGE.textMuted },
  stagePillTextActive: { color: MOON_BRIDGE.textLight },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 240, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: MOON_BRIDGE.panelBorder },
});

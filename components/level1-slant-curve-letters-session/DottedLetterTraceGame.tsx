/**
 * Game 4: Dotted Letter Tracing — trace all 14 letters dot-to-dot.
 * ≥70% dots connected per letter → advance.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LETTERS, scaleDots, scaleStrokes, type Point } from './letterData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;
const COLORS = [
  '#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#6366F1', '#10B981', '#E11D48', '#0EA5E9',
  '#A855F7', '#D946EF',
];

export function DottedLetterTraceGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = LETTERS[idx];
  const color = COLORS[idx % COLORS.length];
  const dots = useMemo(() => scaleDots(def.dots, 100, 120, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, 100, 120, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const nextDot = useMemo(() => {
    for (let i = 0; i < dots.length; i++) if (!connected.has(i)) return i;
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    const next = getConnectedDots(strokes, dots, HIT_RADIUS);
    setConnected(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
    if (pct >= SUCCESS_PCT) {
      setShowConfetti(true);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak(`Great ${def.letter}!`, { rate: 0.9 }); } catch (_) {}
      setTimeout(() => {
        setShowConfetti(false);
        if (idx < LETTERS.length - 1) { setIdx((i) => i + 1); setConnected(new Set()); canvasRef.current?.clear(); }
        else onComplete();
      }, 1200);
    }
  }, [dots, def, idx, onComplete]);

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <GameContainerGrip
      title={`Trace ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="✍️"
      mascotHint={`Trace letter ${def.letter}! Connect the dots.`}
      onBack={onBack}
    >
      <View style={styles.indicator}>
        <Text style={styles.indicatorText}>{idx + 1} / {LETTERS.length}</Text>
      </View>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.6)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dims.width} height={dims.height}>
              {guides.map((s, i) => (
                <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                  stroke={color + '30'} strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />
              ))}
              {dots.map((d, i) => (
                <React.Fragment key={i}>
                  {i === nextDot && <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#F59E0B" strokeWidth={3} opacity={0.7} />}
                  <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 13 : 10}
                    fill={connected.has(i) ? '#22C55E' : color} opacity={connected.has(i) ? 1 : 0.8} />
                  {!connected.has(i) && <Circle cx={d.x} cy={d.y} r={5} fill="#FFF" opacity={0.6} />}
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Traced: {pct}%</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  indicator: { alignItems: 'center', marginBottom: 8 },
  indicatorText: { fontSize: 15, fontWeight: '700', color: '#6D28D9' },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 240, borderRadius: 24, overflow: 'hidden' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 7 },
});

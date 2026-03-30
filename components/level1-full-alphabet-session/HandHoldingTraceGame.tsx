/**
 * Game 2: Trace with Hand Holding — auto-guided tracing.
 * The drawing path snaps to the letter strokes, helping the child stay on track.
 * Cycles through a subset of 10 letters: A, B, C, D, E, G, O, R, S, W.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleDots, scaleStrokes, type Point } from './alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const SUBSET = ALPHABET.filter((l) => 'ABCDEGOR SW'.includes(l.letter));
const HIT_RADIUS = 22;
const SUCCESS_PCT = 80;

export function HandHoldingTraceGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = SUBSET[idx];
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  React.useEffect(() => {
    setConnected(new Set());
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Trace ${def.letter} — I'll help you!`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

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
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      if (idx < SUBSET.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [dots, idx, onComplete]);

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <GameContainerGrip
      title={`Guided: ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🤝"
      mascotHint={`Trace ${def.letter} — follow the thick path!`}
      onBack={onBack}
    >
      <Text style={styles.counter}>{def.letter} ({idx + 1}/{SUBSET.length})</Text>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={14} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dims.width} height={dims.height}>
              {guides.map((s, i) => (
                <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                  stroke="#DDD6FE" strokeWidth={18} strokeLinecap="round" />
              ))}
              {guides.map((s, i) => (
                <Line key={`mid-${i}`} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                  stroke="#C4B5FD" strokeWidth={4} strokeDasharray="6 6" strokeLinecap="round" />
              ))}
              {dots.map((d, i) => (
                <React.Fragment key={i}>
                  {i === nextDot && <Circle cx={d.x} cy={d.y} r={20} fill="none" stroke="#F59E0B" strokeWidth={3} opacity={0.8} />}
                  <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 12 : 9}
                    fill={connected.has(i) ? '#22C55E' : '#7C3AED'} opacity={connected.has(i) ? 1 : 0.8} />
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Traced: {pct}%</Text>
          <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#5B21B6', marginBottom: 6 },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  progressRow: { marginTop: 10, gap: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

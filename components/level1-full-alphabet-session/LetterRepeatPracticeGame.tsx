/**
 * Game 3: Letter Repeat Practice — same letter appears 3 times for muscle memory.
 * Cycles through 8 key letters: A, B, D, G, M, R, S, W.
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

const PRACTICE_LETTERS = ALPHABET.filter((l) => 'ABDGMRSW'.includes(l.letter));
const REPEATS = 3;
const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

export function LetterRepeatPracticeGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [letterIdx, setLetterIdx] = useState(0);
  const [rep, setRep] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = PRACTICE_LETTERS[letterIdx];
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  React.useEffect(() => {
    setConnected(new Set());
    canvasRef.current?.clear();
    if (rep === 0) {
      try { Speech.stop(); Speech.speak(`Practice ${def.letter} — trace it ${REPEATS} times!`, { rate: 0.85 }); } catch (_) {}
    } else {
      try { Speech.stop(); Speech.speak(`${def.letter} again!`, { rate: 0.9 }); } catch (_) {}
    }
  }, [letterIdx, rep, def.letter]);

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
      if (rep < REPEATS - 1) {
        setTimeout(() => setRep((r) => r + 1), 800);
      } else if (letterIdx < PRACTICE_LETTERS.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setLetterIdx((i) => i + 1); setRep(0); }, 1200);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [dots, rep, letterIdx, onComplete]);

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <GameContainerGrip
      title={`Practice ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="💪"
      mascotHint={`Trace ${def.letter} — round ${rep + 1} of ${REPEATS}`}
      onBack={onBack}
    >
      <View style={styles.headerRow}>
        <Text style={styles.counter}>{def.letter} · Letter {letterIdx + 1}/{PRACTICE_LETTERS.length}</Text>
        <View style={styles.repRow}>
          {Array.from({ length: REPEATS }, (_, i) => (
            <View key={i} style={[styles.repDot, i <= rep && styles.repDotActive]} />
          ))}
        </View>
      </View>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dims.width} height={dims.height}>
              {guides.map((s, i) => (
                <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                  stroke="#C4B5FD" strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />
              ))}
              {dots.map((d, i) => (
                <React.Fragment key={i}>
                  {i === nextDot && <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#F59E0B" strokeWidth={3} opacity={0.7} />}
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
  headerRow: { alignItems: 'center', marginBottom: 6 },
  counter: { fontSize: 16, fontWeight: '800', color: '#5B21B6' },
  repRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  repDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#E5E7EB' },
  repDotActive: { backgroundColor: '#22C55E' },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  progressRow: { marginTop: 10, gap: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

/**
 * Game 3: Mixed Challenge — identify + write + trace combo.
 * Each round has 3 phases: (1) identify from options, (2) write freehand, (3) trace dotted guides.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Pressable } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleDots, scaleStrokes, type Point, type StrokeDef } from '@/components/level1-full-alphabet-session/alphabetData';
import { letterCopyMatchScore, letterMatchPass, getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const ROUND_SIZE = 6;
const DOT_HIT_R = 22;
const DOT_SUCCESS = 65;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function samplePoints(strokes: StrokeDef[]): Point[] {
  const pts: Point[] = [];
  for (const s of strokes) {
    const len = Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y);
    const steps = Math.max(2, Math.ceil(len / 20));
    for (let i = 0; i <= steps; i++) { const t = i / steps; pts.push({ x: s.from.x + (s.to.x - s.from.x) * t, y: s.from.y + (s.to.y - s.from.y) * t }); }
  }
  return pts;
}

function pickOptions(target: string, all: string[], count: number): string[] {
  const others = shuffleArr(all.filter((l) => l !== target)).slice(0, count - 1);
  return shuffleArr([target, ...others]);
}

export function MixedChallengeGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 260 });
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'identify' | 'write' | 'trace'>('identify');
  const [pct, setPct] = useState(0);
  const [dotConnected, setDotConnected] = useState<Set<number>>(new Set());
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const allNames = useMemo(() => ALPHABET.map((l) => l.letter), []);
  const def = subset[idx];
  const options = useMemo(() => pickOptions(def.letter, allNames, 4), [def, allNames]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);
  const samples = useMemo(() => samplePoints(guides), [guides]);
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPhase('identify');
    setPct(0);
    setDotConnected(new Set());
    setWrongPick(null);
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Find ${def.letter}!`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const handlePick = useCallback((l: string) => {
    if (l === def.letter) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak(`Now write ${def.letter}!`, { rate: 0.9 }); } catch (_) {}
      setPhase('write');
    } else {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (_) {}
      setWrongPick(l);
      setTimeout(() => setWrongPick(null), 500);
    }
  }, [def.letter]);

  const handleWriteEnd = useCallback((strokes: Stroke[]) => {
    if (phase !== 'write') return;
    const match = letterCopyMatchScore(strokes, samples, { coverageHitRadius: 30 });
    setPct(Math.round(match.combined * 100));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    if (letterMatchPass(match, 'master')) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak(`Now trace ${def.letter}!`, { rate: 0.9 }); } catch (_) {}
      canvasRef.current?.clear();
      setPct(0);
      setPhase('trace');
    }
  }, [phase, samples, def.letter]);

  const handleTraceEnd = useCallback((strokes: Stroke[]) => {
    if (phase !== 'trace') return;
    const next = getConnectedDots(strokes, dots, DOT_HIT_R);
    setDotConnected(next);
    const dp = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
    setPct(Math.round(dp));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    if (dp >= DOT_SUCCESS) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [phase, dots, idx, subset.length, onComplete]);

  const phaseLabel = phase === 'identify' ? `Tap ${def.letter}` : phase === 'write' ? `Write ${def.letter}` : `Trace ${def.letter}`;
  const phaseNum = phase === 'identify' ? 1 : phase === 'write' ? 2 : 3;

  return (
    <GameContainerGrip
      title="Mixed Challenge"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔥"
      mascotHint={phaseLabel}
      onBack={onBack}
    >
      <View style={styles.headerRow}>
        <Text style={styles.counter}>{def.letter} · Round {idx + 1}/{subset.length}</Text>
        <View style={styles.phaseRow}>
          {['Identify', 'Write', 'Trace'].map((p, i) => (
            <View key={p} style={[styles.phaseDot, i < phaseNum && styles.phaseDotActive]}>
              <Text style={[styles.phaseText, i < phaseNum && styles.phaseTextActive]}>{i + 1}</Text>
            </View>
          ))}
        </View>
      </View>

      {phase === 'identify' && (
        <View style={styles.quizWrap}>
          <Text style={styles.quizPrompt}>Tap: {def.letter}</Text>
          <View style={styles.optionsRow}>
            {options.map((l) => (
              <Pressable key={l} onPress={() => handlePick(l)}
                style={({ pressed }) => [styles.optionBtn, wrongPick === l && styles.optionWrong, pressed && styles.pressed]}>
                <Text style={[styles.optionText, wrongPick === l && styles.optionTextWrong]}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {phase === 'write' && (
        <>
          <Text style={styles.phaseTitle}>Write {def.letter}:</Text>
          <View style={styles.canvasWrap} onLayout={onLayout}>
            <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleWriteEnd} />
          </View>
          <View style={styles.barRow}><Text style={styles.label}>Match: {pct}%</Text><View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View></View>
        </>
      )}

      {phase === 'trace' && (
        <>
          <Text style={styles.phaseTitle}>Trace {def.letter}:</Text>
          <View style={styles.canvasWrap} onLayout={onLayout}>
            <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleTraceEnd} />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                {guides.map((s, i) => (
                  <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                    stroke="#C4B5FD" strokeWidth={3} strokeDasharray="6 6" strokeLinecap="round" />
                ))}
                {dots.map((d, i) => (
                  <Circle key={i} cx={d.x} cy={d.y} r={dotConnected.has(i) ? 10 : 7}
                    fill={dotConnected.has(i) ? '#22C55E' : '#7C3AED'} opacity={dotConnected.has(i) ? 1 : 0.7} />
                ))}
              </Svg>
            </View>
          </View>
          <View style={styles.barRow}><Text style={styles.label}>Traced: {pct}%</Text><View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View></View>
        </>
      )}
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  headerRow: { alignItems: 'center', marginBottom: 6 },
  counter: { fontSize: 14, fontWeight: '800', color: '#374151' },
  phaseRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  phaseDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  phaseDotActive: { backgroundColor: '#22C55E' },
  phaseText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF' },
  phaseTextActive: { color: '#FFF' },
  quizWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  quizPrompt: { fontSize: 26, fontWeight: '800', color: '#1F2937' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionBtn: { width: 68, height: 68, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#BFDBFE' },
  optionWrong: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  optionText: { fontSize: 30, fontWeight: '900', color: '#1E40AF' },
  optionTextWrong: { color: '#DC2626' },
  pressed: { opacity: 0.85 },
  phaseTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 4 },
  canvasWrap: { flex: 1, minHeight: 180, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#E5E7EB' },
  barRow: { marginTop: 6, gap: 3 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  barBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 5 },
});

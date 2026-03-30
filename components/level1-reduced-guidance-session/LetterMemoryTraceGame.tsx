/**
 * Game 3: Letter Memory Trace — show letter → hide → trace from memory.
 * The letter is shown briefly with animated strokes, then disappears.
 * Child traces from memory — dots are invisible, only used for validation.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Animated as RNAnimated } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleDots, scaleStrokes, type Point } from '@/components/level1-full-alphabet-session/alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const HIT_RADIUS = 28;
const SUCCESS_PCT = 55;
const SHOW_DURATION = 2200;
const LETTERS_COUNT = 8;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function LetterMemoryTraceGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'show' | 'trace'>('show');
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, LETTERS_COUNT), []);
  const def = subset[idx];
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPhase('show');
    setConnected(new Set());
    canvasRef.current?.clear();
    fadeAnim.setValue(1);
    try { Speech.stop(); Speech.speak(`Remember ${def.letter}!`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}

    const timer = setTimeout(() => {
      RNAnimated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        setPhase('trace');
      });
    }, SHOW_DURATION);
    return () => clearTimeout(timer);
  }, [idx, def.letter, fadeAnim]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    if (phase !== 'trace') return;
    const next = getConnectedDots(strokes, dots, HIT_RADIUS);
    setConnected(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
    if (pct >= SUCCESS_PCT) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak(`Great ${def.letter}!`, { rate: 0.9 }); } catch (_) {}
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1200);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [phase, dots, def, idx, subset.length, onComplete]);

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <GameContainerGrip
      title={`Memory: ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🧠"
      mascotHint={phase === 'show' ? `Look at ${def.letter} carefully...` : `Now trace ${def.letter} from memory!`}
      onBack={onBack}
    >
      <Text style={styles.counter}>{def.letter} ({idx + 1}/{subset.length})</Text>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          {phase === 'trace' && (
            <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.45)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
          )}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {phase === 'show' && (
              <RNAnimated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                <Svg width={dims.width} height={dims.height}>
                  {guides.map((s, i) => (
                    <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                      stroke="#7C3AED" strokeWidth={8} strokeLinecap="round" />
                  ))}
                </Svg>
              </RNAnimated.View>
            )}
          </View>
          {phase === 'show' && (
            <View style={styles.showOverlay}>
              <Text style={styles.showLetter}>{def.letter}</Text>
              <Text style={styles.showHint}>Memorize it!</Text>
            </View>
          )}
          {phase === 'trace' && (
            <View style={styles.traceHint}>
              <Text style={styles.traceHintText}>Draw from memory!</Text>
            </View>
          )}
        </View>
        {phase === 'trace' && (
          <View style={styles.progressRow}>
            <Text style={styles.label}>Accuracy: {pct}%</Text>
            <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
          </View>
        )}
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 6 },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  showOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  showLetter: { fontSize: 100, fontWeight: '900', color: '#7C3AED' },
  showHint: { fontSize: 18, fontWeight: '700', color: '#A78BFA', marginTop: 8 },
  traceHint: { position: 'absolute', top: 10, alignSelf: 'center', backgroundColor: 'rgba(124,58,237,0.12)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  traceHintText: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  progressRow: { marginTop: 10, gap: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#374151' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

/**
 * Game 4: Mixed Letter Tracing — random letters one at a time.
 * Only a very faint outline, no dots. Tests full independence.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { coveragePctMinOverGuideSegments } from '@/components/level1-grip-session/shapeFillUtils';

const ROUND_SIZE = 12;
/** Every guide segment must be fully traced (weakest segment drives the %). */
const SUCCESS_THRESHOLD = 1;
/** Tighter than old 25px so nearby strokes (e.g. diagonal vs bottom bar) cross-hit less. */
const HIT_RADIUS_PX = 18;
const SAMPLE_STEP_PX = 14;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MixedLetterTracingGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const def = subset[idx];
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPct(0);
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Trace ${def.letter}`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    const cov = coveragePctMinOverGuideSegments(
      strokes,
      guides,
      HIT_RADIUS_PX,
      SAMPLE_STEP_PX
    );
    setPct(Math.round(cov * 100));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    if (cov >= SUCCESS_THRESHOLD) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [guides, idx, subset.length, onComplete]);

  return (
    <GameContainerGrip
      title={`Random: ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🎲"
      mascotHint="Random letters — show what you've learned!"
      onBack={onBack}
    >
      <Text style={styles.counter}>{def.letter} ({idx + 1}/{subset.length})</Text>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.45)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dims.width} height={dims.height}>
              {guides.map((s, i) => (
                <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                  stroke="#D1D5DB" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>
            Coverage: {pct}% (all parts of the letter) — need 100% to continue
          </Text>
          <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 6 },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  progressRow: { marginTop: 10, gap: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#374151' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

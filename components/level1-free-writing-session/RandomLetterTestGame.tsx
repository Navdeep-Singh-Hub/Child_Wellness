/**
 * Game 2: Random Letter Test — random letters appear one at a time.
 * Child writes each letter on a blank canvas.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleStrokes, type Point, type StrokeDef } from '@/components/level1-full-alphabet-session/alphabetData';
import { letterCopyMatchScore, letterMatchPass } from '@/components/level1-grip-session/shapeFillUtils';

const ROUND_SIZE = 12;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function samplePoints(strokes: StrokeDef[]): Point[] {
  const pts: Point[] = [];
  for (const s of strokes) {
    const len = Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y);
    const steps = Math.max(2, Math.ceil(len / 18));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({ x: s.from.x + (s.to.x - s.from.x) * t, y: s.from.y + (s.to.y - s.from.y) * t });
    }
  }
  return pts;
}

export function RandomLetterTestGame({
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
  const samples = useMemo(() => samplePoints(guides), [guides]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPct(0);
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Write ${def.letter}!`, { rate: 0.9, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    const match = letterCopyMatchScore(strokes, samples, { coverageHitRadius: 30 });
    setPct(Math.round(match.combined * 100));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    if (letterMatchPass(match, 'freeWrite')) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [samples, idx, subset.length, onComplete]);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setPct(0);
  }, []);

  return (
    <GameContainerGrip
      title="Random Letter"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🎲"
      mascotHint="Random letters — write each one!"
      onBack={onBack}
    >
      <View style={styles.promptRow}>
        <Text style={styles.promptLetter}>{def.letter}</Text>
        <Text style={styles.promptCounter}>{idx + 1}/{subset.length}</Text>
      </View>

      <View style={styles.canvasWrap} onLayout={onLayout}>
        <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
      </View>

      <View style={styles.bottomRow}>
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <View style={styles.progressCol}>
          <Text style={styles.label}>Match: {pct}%</Text>
          <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  promptRow: { alignItems: 'center', marginBottom: 6 },
  promptLetter: { fontSize: 60, fontWeight: '900', color: '#7C3AED' },
  promptCounter: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#E5E7EB' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  clearBtn: { backgroundColor: '#F3E8FF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14 },
  clearText: { fontSize: 15, fontWeight: '700', color: '#7C3AED' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1, gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

/**
 * Game 1: Full A–Z Writing — write the entire alphabet sequentially on a blank canvas.
 * No guides. Pure mastery test.
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

function samplePoints(strokes: StrokeDef[]): Point[] {
  const pts: Point[] = [];
  for (const s of strokes) {
    const len = Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y);
    const steps = Math.max(2, Math.ceil(len / 20));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({ x: s.from.x + (s.to.x - s.from.x) * t, y: s.from.y + (s.to.y - s.from.y) * t });
    }
  }
  return pts;
}

export function FullAZWritingGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = ALPHABET[idx];
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);
  const samples = useMemo(() => samplePoints(guides), [guides]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPct(0);
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Write ${def.letter}`, { rate: 0.9, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    const match = letterCopyMatchScore(strokes, samples, { coverageHitRadius: 30 });
    setPct(Math.round(match.combined * 100));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    if (letterMatchPass(match, 'master')) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      if (idx < ALPHABET.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 800);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [samples, idx, onComplete]);

  const handleClear = useCallback(() => { canvasRef.current?.clear(); setPct(0); }, []);

  const progressLetters = ALPHABET.map((l, i) => ({ letter: l.letter, done: i < idx, active: i === idx }));

  return (
    <GameContainerGrip
      title={`Write ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🏆"
      mascotHint={`Full alphabet! Write ${def.letter}`}
      onBack={onBack}
    >
      <View style={styles.letterStrip}>
        {progressLetters.map((l, i) => (
          <Text key={i} style={[styles.stripLetter, l.done && styles.stripDone, l.active && styles.stripActive]}>{l.letter}</Text>
        ))}
      </View>

      <Text style={styles.bigLetter}>{def.letter}</Text>

      <View style={styles.canvasWrap} onLayout={onLayout}>
        <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
      </View>

      <View style={styles.bottomRow}>
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <View style={styles.progressCol}>
          <Text style={styles.label}>{idx}/{ALPHABET.length} · {pct}%</Text>
          <View style={styles.barBg}><View style={[styles.barFill, { width: `${(idx / ALPHABET.length) * 100}%` }]} /></View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  letterStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 3, marginBottom: 4 },
  stripLetter: { fontSize: 11, fontWeight: '700', color: '#D1D5DB', width: 18, textAlign: 'center' },
  stripDone: { color: '#22C55E' },
  stripActive: { color: '#DC2626', fontWeight: '900', fontSize: 13 },
  bigLetter: { fontSize: 52, fontWeight: '900', color: '#DC2626', textAlign: 'center', marginBottom: 4 },
  canvasWrap: { flex: 1, minHeight: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#E5E7EB' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  clearBtn: { backgroundColor: '#FEE2E2', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14 },
  clearText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1, gap: 3 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  barBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 5 },
});

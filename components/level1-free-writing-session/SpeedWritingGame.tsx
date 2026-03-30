/**
 * Game 3: Speed Writing — timer-based writing challenge.
 * A letter appears, child must write it before the timer runs out.
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

const ROUND_SIZE = 10;
const TIME_LIMIT = 12;

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

export function SpeedWritingGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

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
    setTimeLeft(TIME_LIMIT);
    setDone(false);
    doneRef.current = false;
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Quick! Write ${def.letter}`, { rate: 1.0, pitch: 1.2 }); } catch (_) {}

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!doneRef.current) {
            doneRef.current = true;
            setDone(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [idx, def.letter]);

  const advanceLetter = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    doneRef.current = true;
    setDone(true);
    setScore((s) => s + 1);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}

    if (idx < subset.length - 1) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setDone(false);
        doneRef.current = false;
        setIdx((i) => i + 1);
      }, 800);
    } else {
      setShowConfetti(true);
      setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
    }
  }, [idx, subset.length, onComplete]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    if (doneRef.current) return;
    const match = letterCopyMatchScore(strokes, samples, { coverageHitRadius: 30 });
    setPct(Math.round(match.combined * 100));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    if (letterMatchPass(match, 'speed')) advanceLetter();
  }, [samples, advanceLetter]);

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    doneRef.current = true;
    setDone(true);
    if (idx < subset.length - 1) {
      setTimeout(() => { setDone(false); doneRef.current = false; setIdx((i) => i + 1); }, 600);
    } else {
      setTimeout(() => onComplete(), 600);
    }
  }, [idx, subset.length, onComplete]);

  const timerColor = timeLeft <= 3 ? '#DC2626' : timeLeft <= 6 ? '#F59E0B' : '#22C55E';

  return (
    <GameContainerGrip
      title="Speed Writing"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="⚡"
      mascotHint="Write fast before time runs out!"
      onBack={onBack}
    >
      <View style={styles.topRow}>
        <View style={styles.timerBox}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
        </View>
        <Text style={styles.promptLetter}>{def.letter}</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score}/{subset.length}</Text>
        </View>
      </View>

      <View style={styles.canvasWrap} onLayout={onLayout}>
        {!done && (
          <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
        )}
        {done && timeLeft === 0 && (
          <View style={styles.timeUpOverlay}><Text style={styles.timeUpText}>Time's up!</Text></View>
        )}
      </View>

      <View style={styles.bottomRow}>
        {!done && (
          <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  timerBox: { backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  timerText: { fontSize: 22, fontWeight: '900' },
  promptLetter: { fontSize: 56, fontWeight: '900', color: '#DC2626' },
  scoreBox: { backgroundColor: '#D1FAE5', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  scoreText: { fontSize: 18, fontWeight: '800', color: '#059669' },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#E5E7EB' },
  timeUpOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(220,38,38,0.08)' },
  timeUpText: { fontSize: 28, fontWeight: '900', color: '#DC2626' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  skipBtn: { backgroundColor: '#FEE2E2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14 },
  skipText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1, gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

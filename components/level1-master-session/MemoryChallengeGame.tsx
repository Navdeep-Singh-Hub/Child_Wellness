/**
 * Game 2: Memory Challenge — hear a letter, write it from memory.
 * No visual prompt at all — audio only. Tests full recall.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET } from '@/components/level1-full-alphabet-session/alphabetData';
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';

const RECOGNITION_DEBOUNCE_MS = 750;

const ROUND_SIZE = 10;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryChallengeGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const def = subset[idx];

  useEffect(() => {
    setPct(0);
    setRevealed(false);
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    try { Speech.stop(); Speech.speak(`Write the letter ${def.letter}`, { rate: 0.8, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const runRecognition = useCallback(async () => {
    const expected = def.letter;
    const b64 = await captureDrawingForAi(shotRef, latestStrokesRef.current);
    if (!b64) return;
    const reqId = ++requestIdRef.current;
    const data = await validateLetterImage(b64, expected, 'image/png');
    if (reqId !== requestIdRef.current) return;
    if (!data.ok) {
      setPct(0);
      return;
    }
    const p = isLetterValidationPass(data);
    setPct(p ? 100 : Math.round(Number(data.confidence) || 0));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    if (p) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak(`Great ${def.letter}!`, { rate: 0.9 }); } catch (_) {}
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [def.letter, idx, subset.length, onComplete]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    latestStrokesRef.current = strokes;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runRecognition();
    }, RECOGNITION_DEBOUNCE_MS);
  }, [runRecognition]);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    setPct(0);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);
  const handleRepeat = useCallback(() => {
    try { Speech.stop(); Speech.speak(def.letter, { rate: 0.7, pitch: 1.0 }); } catch (_) {}
  }, [def.letter]);
  const handleReveal = useCallback(() => setRevealed(true), []);

  return (
    <GameContainerGrip
      title="Memory Challenge"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🧠"
      mascotHint="Listen and write — no peeking!"
      onBack={onBack}
    >
      <Text style={styles.counter}>{idx + 1}/{subset.length}</Text>

      <View style={styles.audioBox}>
        <Text style={styles.audioIcon}>🔊</Text>
        <Text style={styles.audioHint}>Listen for the letter!</Text>
        <Pressable onPress={handleRepeat} style={({ pressed }) => [styles.replayBtn, pressed && styles.pressed]}>
          <Text style={styles.replayText}>Replay</Text>
        </Pressable>
      </View>

      {revealed && (
        <View style={styles.revealBox}>
          <Text style={styles.revealLetter}>{def.letter}</Text>
        </View>
      )}

      <View style={styles.canvasWrap}>
        <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.actionBtn, styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        {!revealed && (
          <Pressable onPress={handleReveal} style={({ pressed }) => [styles.actionBtn, styles.hintBtn, pressed && styles.pressed]}>
            <Text style={styles.hintText}>Hint</Text>
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
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#9CA3AF', marginBottom: 4 },
  audioBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 16, padding: 12, gap: 10, marginBottom: 8 },
  audioIcon: { fontSize: 28 },
  audioHint: { flex: 1, fontSize: 15, fontWeight: '700', color: '#92400E' },
  replayBtn: { backgroundColor: '#FDE68A', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10 },
  replayText: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  revealBox: { alignSelf: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 12, marginBottom: 6 },
  revealLetter: { fontSize: 28, fontWeight: '900', color: '#1E40AF' },
  canvasWrap: { flex: 1, minHeight: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#E5E7EB' },
  captureWrap: { flex: 1, minHeight: 200 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14 },
  clearBtn: { backgroundColor: '#FEE2E2' },
  clearText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  hintBtn: { backgroundColor: '#DBEAFE' },
  hintText: { fontSize: 14, fontWeight: '700', color: '#1E40AF' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1, gap: 3 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  barBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 5 },
});

/**
 * Game 4: Fun Writing Game — write letters in creative ways.
 * Each round has a fun prompt: rainbow, giant, tiny, backwards, wavy style.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

interface FunRound {
  letter: string;
  style: string;
  emoji: string;
  hint: string;
  useColors: boolean;
}

const FUN_ROUNDS: FunRound[] = [
  { letter: 'A', style: 'Rainbow', emoji: '🌈', hint: 'Use all the colors!', useColors: true },
  { letter: 'B', style: 'Giant', emoji: '🦕', hint: 'Make it HUGE!', useColors: false },
  { letter: 'C', style: 'Tiny', emoji: '🐜', hint: 'Make it super small!', useColors: false },
  { letter: 'M', style: 'Rainbow', emoji: '🌈', hint: 'Colorful M!', useColors: true },
  { letter: 'O', style: 'Decorative', emoji: '🎨', hint: 'Add decorations around it!', useColors: true },
  { letter: 'S', style: 'Giant', emoji: '🦕', hint: 'Fill the whole space!', useColors: false },
  { letter: 'W', style: 'Rainbow', emoji: '🌈', hint: 'Rainbow W!', useColors: true },
  { letter: 'Z', style: 'Zigzag', emoji: '⚡', hint: 'Make it sharp and bold!', useColors: false },
];

export function FunWritingGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const round = FUN_ROUNDS[idx];

  useEffect(() => {
    setPct(0);
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    try { Speech.stop(); Speech.speak(`${round.style} ${round.letter}! ${round.hint}`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, round]);

  const runRecognition = useCallback(async () => {
    const expected = round.letter;
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
      if (idx < FUN_ROUNDS.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [round.letter, idx, onComplete]);

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

  return (
    <GameContainerGrip
      title="Fun Writing"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot={round.emoji}
      mascotHint={round.hint}
      onBack={onBack}
    >
      <View style={styles.promptBox}>
        <Text style={styles.promptEmoji}>{round.emoji}</Text>
        <View style={styles.promptTextWrap}>
          <Text style={styles.promptStyle}>{round.style}</Text>
          <Text style={styles.promptLetter}>{round.letter}</Text>
        </View>
        <Text style={styles.promptHint}>{round.hint}</Text>
      </View>

      <Text style={styles.counter}>{idx + 1}/{FUN_ROUNDS.length}</Text>

      <View style={styles.canvasWrap}>
        <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={12} canvasColor="rgba(255,255,255,0.55)"
            randomColors={round.useColors} onStrokeEnd={handleStrokeEnd} />
        </View>
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
  promptBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderRadius: 18, padding: 12, gap: 10, marginBottom: 6, borderWidth: 2, borderColor: '#FED7AA' },
  promptEmoji: { fontSize: 34 },
  promptTextWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flex: 1 },
  promptStyle: { fontSize: 16, fontWeight: '700', color: '#9A3412' },
  promptLetter: { fontSize: 36, fontWeight: '900', color: '#EA580C' },
  promptHint: { fontSize: 12, fontWeight: '600', color: '#C2410C', maxWidth: 80, textAlign: 'right' },
  counter: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#9CA3AF', marginBottom: 4 },
  canvasWrap: { flex: 1, minHeight: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#FED7AA' },
  captureWrap: { flex: 1, minHeight: 200 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  clearBtn: { backgroundColor: '#FEE2E2', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14 },
  clearText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1, gap: 3 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  barBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 5 },
});

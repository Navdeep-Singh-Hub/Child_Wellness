/**
 * Game 1: Free Letter Writing — prompt says "Write A", child writes on blank canvas.
 * Validation: OpenAI vision (strict letter check), not coverage-only matching.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET } from '@/components/level1-full-alphabet-session/alphabetData';
import { isLetterValidationPass, letterRecognitionFailureHint, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';
import { LetterRecognitionFeedback } from '@/components/level1-copy-letters-session/LetterRecognitionFeedback';

const ROUND_SIZE = 10;
const RECOGNITION_DEBOUNCE_MS = 750;

export function FreeLetterWritingGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const [checking, setChecking] = useState(false);
  const [predicted, setPredicted] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [validationPassed, setValidationPassed] = useState(false);
  /** Bar label: AI confidence until pass, then 100% is shown via LetterRecognitionFeedback when passed */
  const [barPct, setBarPct] = useState(0);

  const subset = useMemo(() => ALPHABET.slice(0, ROUND_SIZE), []);
  const def = subset[idx];

  useEffect(() => {
    setPredicted(null);
    setConfidence(null);
    setAiFeedback(null);
    setValidationPassed(false);
    setBarPct(0);
    setChecking(false);
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    try { Speech.stop(); Speech.speak(`Write ${def.letter}`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const runRecognition = useCallback(async () => {
    const expected = def.letter;
    const b64 = await captureDrawingForAi(shotRef, latestStrokesRef.current);
    if (!b64) {
      setAiFeedback('Could not save your drawing. Try again.');
      return;
    }

    const reqId = ++requestIdRef.current;
    setChecking(true);
    setPredicted(null);
    setConfidence(null);
    setValidationPassed(false);

    const data = await validateLetterImage(b64, expected, 'image/png');
    if (reqId !== requestIdRef.current) return;

    setChecking(false);

    if (!data.ok) {
      setValidationPassed(false);
      setBarPct(0);
      setAiFeedback(
        data.error === 'recognition_unavailable'
          ? 'Letter check is not set up yet. Ask a grown-up to add the key on the server.'
          : letterRecognitionFailureHint(data) || 'Could not check your letter. Try again.'
      );
      return;
    }

    setPredicted(data.detectedLetter ?? '?');
    setConfidence(data.confidence ?? 0);
    setAiFeedback(data.feedback || null);
    setBarPct(isLetterValidationPass(data) ? 100 : Math.round(Number(data.confidence) || 0));

    const passed = isLetterValidationPass(data);
    setValidationPassed(passed);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}

    if (passed) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [def.letter, idx, subset.length, onComplete]);

  const handleRetry = useCallback(() => {
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    setPredicted(null);
    setConfidence(null);
    setAiFeedback(null);
    setValidationPassed(false);
    setBarPct(0);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    latestStrokesRef.current = strokes;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runRecognition();
    }, RECOGNITION_DEBOUNCE_MS);
  }, [runRecognition]);

  return (
    <GameContainerGrip
      title={`Write ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="✏️"
      mascotHint={`Write the letter ${def.letter} — no help!`}
      onBack={onBack}
    >
      <View style={styles.promptRow}>
        <Text style={styles.promptLabel}>Write:</Text>
        <Text style={styles.promptLetter}>{def.letter}</Text>
        <Text style={styles.promptCounter}>({idx + 1}/{subset.length})</Text>
      </View>

      <View style={styles.canvasWrap}>
        <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
        </View>
      </View>

      <LetterRecognitionFeedback
        checking={checking}
        predicted={predicted}
        confidence={confidence}
        feedback={aiFeedback}
        expectedLetter={def.letter}
        passed={validationPassed}
        onRetry={handleRetry}
      />

      <View style={styles.bottomRow}>
        <Pressable onPress={handleRetry} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <View style={styles.progressCol}>
          <Text style={styles.label}>
            {validationPassed ? 'Match: 100%' : `Match: ${barPct}%`}
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${validationPassed ? 100 : barPct}%` }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  promptRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 8 },
  promptLabel: { fontSize: 18, fontWeight: '700', color: '#374151' },
  promptLetter: { fontSize: 56, fontWeight: '900', color: '#DC2626' },
  promptCounter: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#E5E7EB' },
  captureWrap: { flex: 1, minHeight: 220 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  clearBtn: { backgroundColor: '#FEE2E2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14 },
  clearText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1, gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

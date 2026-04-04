/**
 * Game 4: Letter Quiz — identify the letter from audio/visual prompt, then write it.
 * Two phases: (1) Tap the correct letter from 4 options, (2) Write it on the canvas.
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

const ROUND_SIZE = 8;
const RECOGNITION_DEBOUNCE_MS = 750;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOptions(target: string, all: string[], count: number): string[] {
  const others = shuffleArr(all.filter((l) => l !== target)).slice(0, count - 1);
  return shuffleArr([target, ...others]);
}

export function LetterQuizGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'identify' | 'write'>('identify');
  const [wrongPick, setWrongPick] = useState<string | null>(null);
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
  const [barPct, setBarPct] = useState(0);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const allNames = useMemo(() => ALPHABET.map((l) => l.letter), []);
  const def = subset[idx];
  const options = useMemo(() => pickOptions(def.letter, allNames, 4), [def, allNames]);
  useEffect(() => {
    setPhase('identify');
    setWrongPick(null);
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
    try { Speech.stop(); Speech.speak(`Which one is ${def.letter}?`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const handlePick = useCallback((letter: string) => {
    if (letter === def.letter) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak(`Correct! Now write ${def.letter}`, { rate: 0.9 }); } catch (_) {}
      canvasRef.current?.clear();
      latestStrokesRef.current = [];
      setPredicted(null);
      setConfidence(null);
      setAiFeedback(null);
      setValidationPassed(false);
      setBarPct(0);
      setChecking(false);
      setPhase('write');
    } else {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (_) {}
      setWrongPick(letter);
      setTimeout(() => setWrongPick(null), 600);
    }
  }, [def.letter]);

  const runRecognition = useCallback(async () => {
    if (phase !== 'write') return;
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
  }, [phase, def.letter, idx, subset.length, onComplete]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    if (phase !== 'write') return;
    latestStrokesRef.current = strokes;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runRecognition();
    }, RECOGNITION_DEBOUNCE_MS);
  }, [phase, runRecognition]);

  const handleClear = useCallback(() => {
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

  return (
    <GameContainerGrip
      title="Letter Quiz"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🧩"
      mascotHint={phase === 'identify' ? `Which one is ${def.letter}?` : `Now write ${def.letter}!`}
      onBack={onBack}
    >
      <Text style={styles.counter}>{idx + 1}/{subset.length}</Text>

      {phase === 'identify' && (
        <View style={styles.quizWrap}>
          <Text style={styles.quizPrompt}>Tap the letter: {def.letter}</Text>
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
          <Text style={styles.writePrompt}>Write {def.letter}:</Text>
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
            onRetry={handleClear}
          />
          <View style={styles.bottomRow}>
            <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
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
        </>
      )}
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#9CA3AF', marginBottom: 6 },
  quizWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  quizPrompt: { fontSize: 24, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionBtn: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#BFDBFE' },
  optionWrong: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  optionText: { fontSize: 34, fontWeight: '900', color: '#1E40AF' },
  optionTextWrong: { color: '#DC2626' },
  pressed: { opacity: 0.85 },
  writePrompt: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 6 },
  canvasWrap: { flex: 1, minHeight: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: '#E5E7EB' },
  captureWrap: { flex: 1, minHeight: 200 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  clearBtn: { backgroundColor: '#FEE2E2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14 },
  clearText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  progressCol: { flex: 1, gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

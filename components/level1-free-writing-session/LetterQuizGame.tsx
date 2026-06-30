/**
 * Game 4: Quiz Arena — identify the letter, then write it.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { TraceMeter } from '@/components/level1-full-alphabet-session/alphabet-shared/TraceMeter';
import { ALPHABET } from '@/components/level1-full-alphabet-session/alphabetData';
import { isLetterValidationPass, letterRecognitionFailureHint, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';
import { LetterRecognitionFeedback } from '@/components/level1-copy-letters-session/LetterRecognitionFeedback';

const ROUND_SIZE = 8;
const RECOGNITION_DEBOUNCE_MS = 750;

const SHELL = {
  bg: '#064E3B',
  labelColor: '#6EE7B7',
  titleColor: '#ECFDF5',
  textOnDark: '#ECFDF5',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(52,211,153,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#10B981',
  dotDone: '#34D399',
};

const FEEDBACK_THEME = {
  accent: '#34D399',
  bg: 'rgba(255,255,255,0.08)',
  border: 'rgba(52,211,153,0.35)',
  text: '#ECFDF5',
  letter: '#6EE7B7',
  retryBg: '#059669',
};

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
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'identify' | 'write'>('identify');
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
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
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

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
    speak(`Which one is ${def.letter}?`, 0.72);
  }, [idx, def.letter]);

  const handlePick = useCallback(
    (letter: string) => {
      if (letter === def.letter) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        speak(`Correct! Now write ${def.letter}`, 0.72);
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
    },
    [def.letter],
  );

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
          : letterRecognitionFailureHint(data) || 'Could not check your letter. Try again.',
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
      speak(`Great ${def.letter}!`, 0.72);
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIdx((i) => i + 1);
        }, reduceMotion ? 400 : 1000);
      } else {
        setShowConfetti(true);
        speak('Quiz arena complete!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }
  }, [phase, def.letter, idx, subset.length, onComplete, reduceMotion]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      if (phase !== 'write') return;
      latestStrokesRef.current = strokes;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        runRecognition();
      }, RECOGNITION_DEBOUNCE_MS);
    },
    [phase, runRecognition],
  );

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

  const mascotHint = phase === 'identify' ? `Which one is ${def.letter}?` : `Now write ${def.letter}!`;

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="QUIZ ARENA"
      gameTitle={phase === 'identify' ? 'Pick the Letter' : `Write ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="🧩"
          name="Quizmaster"
          hint={mascotHint}
          accent="#34D399"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(52,211,153,0.35)"
          nameColor="#6EE7B7"
          hintColor="#ECFDF5"
        />
      }
    >
      {phase === 'identify' && (
        <View style={styles.quizWrap}>
          <Text style={styles.quizPrompt}>Tap the letter: {def.letter}</Text>
          <View style={styles.optionsRow}>
            {options.map((l) => (
              <Pressable
                key={l}
                onPress={() => handlePick(l)}
                style={({ pressed }) => [
                  styles.optionBtn,
                  wrongPick === l && styles.optionWrong,
                  pressed && styles.pressed,
                ]}
              >
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
              <DrawingCanvas
                ref={canvasRef}
                brushSize={10}
                canvasColor="#FFFFFF"
                randomColors={false}
                onStrokeEnd={handleStrokeEnd}
              />
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
            theme={FEEDBACK_THEME}
          />
          <View style={styles.bottomRow}>
            <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
            <View style={styles.progressCol}>
              <TraceMeter
                percent={validationPassed ? 100 : barPct}
                label="Match"
                color="#34D399"
                textColor={SHELL.textOnDark}
              />
            </View>
          </View>
        </>
      )}
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 14, fontWeight: '800', color: SHELL.labelColor },
  quizWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  quizPrompt: { fontSize: 24, fontWeight: '800', color: '#ECFDF5', textAlign: 'center' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionBtn: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  optionWrong: { backgroundColor: 'rgba(248,113,113,0.2)', borderColor: '#F87171' },
  optionText: { fontSize: 34, fontWeight: '900', color: '#6EE7B7' },
  optionTextWrong: { color: '#F87171' },
  pressed: { opacity: 0.85 },
  writePrompt: { fontSize: 18, fontWeight: '700', color: '#6EE7B7', marginBottom: 6 },
  canvasWrap: {
    flex: 1,
    minHeight: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  captureWrap: { flex: 1, minHeight: 180, backgroundColor: '#FFFFFF' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  clearBtn: {
    backgroundColor: 'rgba(52,211,153,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  clearText: { fontSize: 15, fontWeight: '700', color: '#6EE7B7' },
  progressCol: { flex: 1 },
});

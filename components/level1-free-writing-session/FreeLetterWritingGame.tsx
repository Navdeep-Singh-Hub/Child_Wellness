/**
 * Game 1: Blank Canvas — prompt says "Write A", child writes on blank canvas.
 * Validation: OpenAI vision (strict letter check).
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

const ROUND_SIZE = 10;
const RECOGNITION_DEBOUNCE_MS = 750;

const SHELL = {
  bg: '#450A0A',
  labelColor: '#FCA5A5',
  titleColor: '#FEF2F2',
  textOnDark: '#FEF2F2',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(248,113,113,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#EF4444',
  dotDone: '#34D399',
};

const FEEDBACK_THEME = {
  accent: '#F87171',
  bg: 'rgba(255,255,255,0.08)',
  border: 'rgba(248,113,113,0.35)',
  text: '#FEF2F2',
  letter: '#FCA5A5',
  retryBg: '#DC2626',
};

export function FreeLetterWritingGame({
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

  const subset = useMemo(() => ALPHABET.slice(0, ROUND_SIZE), []);
  const def = subset[idx];

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

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
    speak(`Write ${def.letter}`, 0.72);
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
        speak('Blank canvas complete!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }
  }, [def.letter, idx, subset.length, onComplete, reduceMotion]);

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

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      latestStrokesRef.current = strokes;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        runRecognition();
      }, RECOGNITION_DEBOUNCE_MS);
    },
    [runRecognition],
  );

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="BLANK CANVAS"
      gameTitle={`Write ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="✏️"
          name="Scribe"
          hint={`Write the letter ${def.letter} — no help!`}
          accent="#F87171"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(248,113,113,0.35)"
          nameColor="#FCA5A5"
          hintColor="#FEF2F2"
        />
      }
    >
      <View style={styles.promptRow}>
        <Text style={styles.promptLabel}>Write:</Text>
        <Text style={styles.promptLetter}>{def.letter}</Text>
      </View>

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
        onRetry={handleRetry}
        theme={FEEDBACK_THEME}
      />

      <View style={styles.bottomRow}>
        <Pressable onPress={handleRetry} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <View style={styles.progressCol}>
          <TraceMeter
            percent={validationPassed ? 100 : barPct}
            label="Match"
            color="#F87171"
            textColor={SHELL.textOnDark}
          />
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 14, fontWeight: '800', color: SHELL.labelColor },
  promptRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 8 },
  promptLabel: { fontSize: 18, fontWeight: '700', color: '#FCA5A5' },
  promptLetter: { fontSize: 56, fontWeight: '900', color: '#F87171' },
  canvasWrap: {
    flex: 1,
    minHeight: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(248,113,113,0.35)',
  },
  captureWrap: { flex: 1, minHeight: 200, backgroundColor: '#FFFFFF' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  clearBtn: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  clearText: { fontSize: 15, fontWeight: '700', color: '#FCA5A5' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1 },
});

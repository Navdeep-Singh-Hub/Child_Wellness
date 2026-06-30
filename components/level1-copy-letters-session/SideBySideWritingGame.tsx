/**
 * Game 1: Mirror Desk — reference letter left, canvas right.
 * Validation: OpenAI vision (GPT-4o).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { ALPHABET, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { isLetterValidationPass, letterRecognitionFailureHint, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from './captureDrawingBase64';
import { LetterRecognitionFeedback } from './LetterRecognitionFeedback';

const ROUND_SIZE = 10;
const RECOGNITION_DEBOUNCE_MS = 750;

const SHELL = {
  bg: '#0C1A3D',
  labelColor: '#93C5FD',
  titleColor: '#EFF6FF',
  textOnDark: '#EFF6FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(96,165,250,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#3B82F6',
  dotDone: '#34D399',
};

const FEEDBACK_THEME = {
  accent: '#60A5FA',
  bg: 'rgba(255,255,255,0.08)',
  border: 'rgba(96,165,250,0.35)',
  text: '#EFF6FF',
  letter: '#93C5FD',
  retryBg: '#2563EB',
};

export function SideBySideWritingGame({
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
  const [refDims, setRefDims] = useState({ width: 140, height: 200 });
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

  const subset = useMemo(() => ALPHABET.slice(5, 5 + ROUND_SIZE), []);
  const def = subset[idx];
  const refGuides = useMemo(() => scaleStrokes(def.strokes, refDims.width, refDims.height), [def, refDims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  const onRefLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setRefDims({ width, height });
  }, []);

  useEffect(() => {
    setPredicted(null);
    setConfidence(null);
    setAiFeedback(null);
    setValidationPassed(false);
    setChecking(false);
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    speak(`Write ${def.letter} next to the reference!`, 0.72);
  }, [idx, def.letter]);

  const runRecognition = useCallback(async () => {
    const expected = def.letter;
    const b64 = await captureDrawingForAi(shotRef, latestStrokesRef.current);
    if (!b64) {
      setAiFeedback('Could not save your drawing. Try drawing again, then wait a moment.');
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
      setAiFeedback(
        data.error === 'recognition_unavailable'
          ? 'Letter check is not set up yet. Ask a grown-up to add the key on the server.'
          : letterRecognitionFailureHint(data) || 'Could not check your letter. Try again in a moment.',
      );
      return;
    }

    setPredicted(data.detectedLetter ?? '?');
    setConfidence(data.confidence ?? 0);
    setAiFeedback(data.feedback || null);

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
        speak('Mirror desk complete!', 0.72);
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
      gameLabel="MIRROR DESK"
      gameTitle={`Copy ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="🪞"
          name="Mirror"
          hint="Look left, write right!"
          accent="#60A5FA"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(96,165,250,0.35)"
          nameColor="#93C5FD"
          hintColor="#EFF6FF"
        />
      }
    >
      <View style={styles.row}>
        <View style={styles.refSide} onLayout={onRefLayout}>
          <Text style={styles.sideLabel}>Look</Text>
          <Svg width={refDims.width} height={refDims.height}>
            {refGuides.map((s, i) => (
              <Line
                key={i}
                x1={s.from.x}
                y1={s.from.y}
                x2={s.to.x}
                y2={s.to.y}
                stroke="#60A5FA"
                strokeWidth={5}
                strokeLinecap="round"
              />
            ))}
          </Svg>
        </View>
        <View style={styles.canvasSide}>
          <Text style={styles.sideLabel}>Write</Text>
          <View style={styles.canvasInner}>
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

      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 14, fontWeight: '800', color: SHELL.labelColor },
  row: { flex: 1, flexDirection: 'row', gap: 10 },
  refSide: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  canvasSide: { flex: 1, alignItems: 'center' },
  sideLabel: { fontSize: 13, fontWeight: '700', color: '#93C5FD', marginBottom: 4 },
  canvasInner: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.25)',
  },
  captureWrap: { flex: 1, width: '100%', minHeight: 120, backgroundColor: '#FFFFFF' },
});

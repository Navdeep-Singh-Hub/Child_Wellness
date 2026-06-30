/**
 * Game 2: Flash Recall — show letter briefly → hide → write from memory.
 * Validation: OpenAI vision (GPT-4o).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Animated as RNAnimated, AccessibilityInfo } from 'react-native';
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

const ROUND_SIZE = 8;
const SHOW_MS = 2500;
const RECOGNITION_DEBOUNCE_MS = 750;

const SHELL = {
  bg: '#2E1065',
  labelColor: '#C4B5FD',
  titleColor: '#F5F3FF',
  textOnDark: '#F5F3FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(167,139,250,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#8B5CF6',
  dotDone: '#34D399',
};

const FEEDBACK_THEME = {
  accent: '#A78BFA',
  bg: 'rgba(255,255,255,0.08)',
  border: 'rgba(167,139,250,0.35)',
  text: '#F5F3FF',
  letter: '#C4B5FD',
  retryBg: '#7C3AED',
};

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryCopyGame({
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
  const [showDims, setShowDims] = useState({ width: 200, height: 160 });
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'show' | 'write'>('show');
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const [checking, setChecking] = useState(false);
  const [predicted, setPredicted] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [validationPassed, setValidationPassed] = useState(false);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const def = subset[idx];
  const showGuides = useMemo(() => scaleStrokes(def.strokes, showDims.width, showDims.height), [def, showDims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  const onShowLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setShowDims({ width, height });
  }, []);

  useEffect(() => {
    setPhase('show');
    setPredicted(null);
    setConfidence(null);
    setAiFeedback(null);
    setChecking(false);
    setValidationPassed(false);
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    fadeAnim.setValue(1);
    speak(`Remember ${def.letter}!`, 0.72);

    const showDuration = reduceMotion ? 1200 : SHOW_MS;
    const fadeDuration = reduceMotion ? 200 : 400;
    const timer = setTimeout(() => {
      RNAnimated.timing(fadeAnim, { toValue: 0, duration: fadeDuration, useNativeDriver: true }).start(() => {
        setPhase('write');
        speak(`Now write ${def.letter} from memory!`, 0.72);
      });
    }, showDuration);
    return () => clearTimeout(timer);
  }, [idx, def.letter, fadeAnim, reduceMotion]);

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
        }, reduceMotion ? 400 : 1200);
      } else {
        setShowConfetti(true);
        speak('Flash recall complete!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }
  }, [def.letter, idx, subset.length, onComplete, reduceMotion]);

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

  const mascotHint = phase === 'show' ? `Look at ${def.letter}…` : `Write ${def.letter} from memory!`;

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="FLASH RECALL"
      gameTitle={`Memory ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="⚡"
          name="Flash"
          hint={mascotHint}
          accent="#A78BFA"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(167,139,250,0.35)"
          nameColor="#C4B5FD"
          hintColor="#F5F3FF"
        />
      }
    >
      {phase === 'show' && (
        <RNAnimated.View style={[styles.showBox, { opacity: fadeAnim }]} onLayout={onShowLayout}>
          <Svg width={showDims.width} height={showDims.height}>
            {showGuides.map((s, i) => (
              <Line
                key={i}
                x1={s.from.x}
                y1={s.from.y}
                x2={s.to.x}
                y2={s.to.y}
                stroke="#A78BFA"
                strokeWidth={7}
                strokeLinecap="round"
              />
            ))}
          </Svg>
          <Text style={styles.showHint}>Memorize!</Text>
        </RNAnimated.View>
      )}

      {phase === 'write' && (
        <>
          <Text style={styles.writeLabel}>Write from memory:</Text>
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
        </>
      )}
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 14, fontWeight: '800', color: SHELL.labelColor },
  showBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  showHint: { fontSize: 18, fontWeight: '800', color: '#C4B5FD', marginTop: 10 },
  writeLabel: { fontSize: 14, fontWeight: '700', color: '#C4B5FD', marginBottom: 4 },
  canvasWrap: {
    flex: 1,
    minHeight: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.25)',
  },
  captureWrap: { flex: 1, width: '100%', minHeight: 160, backgroundColor: '#FFFFFF' },
});

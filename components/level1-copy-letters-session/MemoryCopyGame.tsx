/**
 * Game 3: Memory Copy — show letter briefly → hide → child writes from memory.
 * Validation: OpenAI vision (GPT-4o).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Animated as RNAnimated } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { isLetterValidationPass, letterRecognitionFailureHint, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from './captureDrawingBase64';
import { LetterRecognitionFeedback } from './LetterRecognitionFeedback';

const ROUND_SIZE = 8;
const SHOW_MS = 2500;
const RECOGNITION_DEBOUNCE_MS = 750;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryCopyGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [showDims, setShowDims] = useState({ width: 200, height: 160 });
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'show' | 'write'>('show');
  const [showConfetti, setShowConfetti] = useState(false);
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
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    fadeAnim.setValue(1);
    try { Speech.stop(); Speech.speak(`Remember ${def.letter}!`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
    const timer = setTimeout(() => {
      RNAnimated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setPhase('write'));
    }, SHOW_MS);
    return () => clearTimeout(timer);
  }, [idx, def.letter, fadeAnim]);

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
          : letterRecognitionFailureHint(data) || 'Could not check your letter. Try again.'
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
      try { Speech.stop(); Speech.speak(`Great ${def.letter}!`, { rate: 0.9 }); } catch (_) {}
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1200);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [def.letter, idx, subset.length, onComplete]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    if (phase !== 'write') return;
    latestStrokesRef.current = strokes;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runRecognition();
    }, RECOGNITION_DEBOUNCE_MS);
  }, [phase, runRecognition]);

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

  return (
    <GameContainerGrip
      title={`Memory: ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🧠"
      mascotHint={phase === 'show' ? `Look at ${def.letter}...` : `Now write ${def.letter} from memory!`}
      onBack={onBack}
    >
      <Text style={styles.counter}>{def.letter} ({idx + 1}/{subset.length})</Text>

      {phase === 'show' && (
        <RNAnimated.View style={[styles.showBox, { opacity: fadeAnim }]} onLayout={onShowLayout}>
          <Svg width={showDims.width} height={showDims.height}>
            {showGuides.map((s, i) => (
              <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                stroke="#1E40AF" strokeWidth={7} strokeLinecap="round" />
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
          />
        </>
      )}
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1E40AF', marginBottom: 6 },
  showBox: { flex: 1, backgroundColor: '#EFF6FF', borderRadius: 24, padding: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#BFDBFE' },
  showHint: { fontSize: 18, fontWeight: '800', color: '#3B82F6', marginTop: 10 },
  writeLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 4 },
  canvasWrap: { flex: 1, minHeight: 180, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E7EB' },
  captureWrap: { flex: 1, width: '100%', minHeight: 160, backgroundColor: '#FFFFFF' },
});

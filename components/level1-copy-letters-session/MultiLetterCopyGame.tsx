/**
 * Game 4: Multi Letter Copy — write a sequence of letters (e.g. A B C).
 * Validation: OpenAI vision (GPT-4o).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
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

const SEQUENCES = [
  [0, 1, 2],
  [3, 4, 5],
  [7, 8, 9],
  [11, 12, 13],
  [14, 15, 16],
  [19, 20, 21],
];
const RECOGNITION_DEBOUNCE_MS = 750;

export function MultiLetterCopyGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [refDims, setRefDims] = useState({ width: 280, height: 72 });
  const [seqIdx, setSeqIdx] = useState(0);
  const [letterPos, setLetterPos] = useState(0);
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

  const seq = SEQUENCES[seqIdx];
  const seqLetters = useMemo(() => seq.map((i) => ALPHABET[i]), [seqIdx]);
  const currentDef = seqLetters[letterPos];
  const refRowGuides = useMemo(() => {
    const w = refDims.width;
    const h = refDims.height;
    const n = seqLetters.length;
    const cell = w / n;
    return seqLetters.map((l, i) => ({
      letter: l.letter,
      strokes: scaleStrokes(l.strokes, cell * 0.85, h * 0.9),
      ox: i * cell + cell * 0.08,
      oy: h * 0.05,
    }));
  }, [seqLetters, refDims]);

  const onRefRowLayout = useCallback((e: LayoutChangeEvent) => {
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
    const names = seqLetters.map((l) => l.letter).join(', ');
    try {
      Speech.stop();
      Speech.speak(letterPos === 0 ? `Write ${names}` : `Now write ${currentDef.letter}`, { rate: 0.85 });
    } catch (_) {}
  }, [seqIdx, letterPos, currentDef.letter, seqLetters]);

  const runRecognition = useCallback(async () => {
    const expected = currentDef.letter;
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
      if (letterPos < seq.length - 1) {
        setTimeout(() => setLetterPos((p) => p + 1), 800);
      } else if (seqIdx < SEQUENCES.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setSeqIdx((s) => s + 1); setLetterPos(0); }, 1200);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [currentDef.letter, letterPos, seq.length, seqIdx, onComplete]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    latestStrokesRef.current = strokes;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runRecognition();
    }, RECOGNITION_DEBOUNCE_MS);
  }, [runRecognition]);

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

  const seqDisplay = seqLetters.map((l) => l.letter);

  return (
    <GameContainerGrip
      title="Copy Sequence"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="📋"
      mascotHint={`Write: ${seqDisplay.join(' ')}`}
      onBack={onBack}
    >
      <Text style={styles.seqCounter}>Set {seqIdx + 1}/{SEQUENCES.length}</Text>

      <View style={styles.seqRow}>
        {seqDisplay.map((l, i) => (
          <View key={i} style={[styles.seqBox, i === letterPos && styles.seqBoxActive, i < letterPos && styles.seqBoxDone]}>
            <Text style={[styles.seqLetter, i === letterPos && styles.seqLetterActive, i < letterPos && styles.seqLetterDone]}>{l}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.refLabel}>Look:</Text>
      <View style={styles.refRow} onLayout={onRefRowLayout}>
        <Svg width={refDims.width} height={refDims.height}>
          {refRowGuides.flatMap((g, gi) =>
            g.strokes.map((s, si) => (
              <Line
                key={`${gi}-${si}`}
                x1={s.from.x + g.ox}
                y1={s.from.y + g.oy}
                x2={s.to.x + g.ox}
                y2={s.to.y + g.oy}
                stroke="#1E40AF"
                strokeWidth={4}
                strokeLinecap="round"
              />
            ))
          )}
        </Svg>
      </View>

      <Text style={styles.writeLabel}>Write {currentDef.letter}:</Text>
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
        expectedLetter={currentDef.letter}
        passed={validationPassed}
        onRetry={handleRetry}
      />

      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  seqCounter: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 6 },
  seqRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 10 },
  seqBox: { width: 54, height: 54, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
  seqBoxActive: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  seqBoxDone: { backgroundColor: '#D1FAE5', borderColor: '#059669' },
  seqLetter: { fontSize: 26, fontWeight: '900', color: '#9CA3AF' },
  seqLetterActive: { color: '#1E40AF' },
  seqLetterDone: { color: '#059669' },
  refLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  refRow: { height: 76, backgroundColor: '#EFF6FF', borderRadius: 16, borderWidth: 2, borderColor: '#BFDBFE', marginBottom: 8, overflow: 'hidden' },
  writeLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 4 },
  canvasWrap: { flex: 1, minHeight: 180, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E7EB' },
  captureWrap: { flex: 1, width: '100%', minHeight: 160, backgroundColor: '#FFFFFF' },
});

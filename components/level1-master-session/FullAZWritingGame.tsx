/**
 * Game 1: Alphabet Crown — write the entire alphabet sequentially on a blank canvas.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { TraceMeter } from '@/components/level1-full-alphabet-session/alphabet-shared/TraceMeter';
import { ALPHABET } from '@/components/level1-full-alphabet-session/alphabetData';
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';

const RECOGNITION_DEBOUNCE_MS = 750;

const SHELL = {
  bg: '#451A03',
  labelColor: '#FDE68A',
  titleColor: '#FFFBEB',
  textOnDark: '#FFFBEB',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(251,191,36,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#F59E0B',
  dotDone: '#34D399',
};

export function FullAZWritingGame({
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
  const [pct, setPct] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const def = ALPHABET[idx];

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    setPct(0);
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
      speak(`Great ${def.letter}!`, 0.72);
      if (idx < ALPHABET.length - 1) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIdx((i) => i + 1);
        }, reduceMotion ? 400 : 800);
      } else {
        setShowConfetti(true);
        speak('Alphabet crown complete!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }
  }, [def.letter, idx, onComplete, reduceMotion]);

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

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    setPct(0);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const progressLetters = ALPHABET.map((l, i) => ({ letter: l.letter, done: i < idx, active: i === idx }));

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="ALPHABET CROWN"
      gameTitle={`Write ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{ALPHABET.length}</Text>}
      footer={
        <LetterMascot
          emoji="👑"
          name="Regent"
          hint={`Full alphabet! Write ${def.letter}`}
          accent="#FBBF24"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(251,191,36,0.35)"
          nameColor="#FDE68A"
          hintColor="#FFFBEB"
        />
      }
    >
      <View style={styles.letterStrip}>
        {progressLetters.map((l, i) => (
          <Text key={i} style={[styles.stripLetter, l.done && styles.stripDone, l.active && styles.stripActive]}>
            {l.letter}
          </Text>
        ))}
      </View>

      <Text style={styles.bigLetter}>{def.letter}</Text>

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

      <View style={styles.bottomRow}>
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <View style={styles.progressCol}>
          <TraceMeter
            percent={(idx / ALPHABET.length) * 100}
            label={`Alphabet ${idx}/${ALPHABET.length} · Match ${pct}%`}
            color="#FBBF24"
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
  letterStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 3, marginBottom: 4 },
  stripLetter: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.25)', width: 18, textAlign: 'center' },
  stripDone: { color: '#34D399' },
  stripActive: { color: '#FBBF24', fontWeight: '900', fontSize: 13 },
  bigLetter: { fontSize: 52, fontWeight: '900', color: '#FBBF24', textAlign: 'center', marginBottom: 4 },
  canvasWrap: {
    flex: 1,
    minHeight: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  captureWrap: { flex: 1, minHeight: 180, backgroundColor: '#FFFFFF' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  clearBtn: {
    backgroundColor: 'rgba(251,191,36,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  clearText: { fontSize: 14, fontWeight: '700', color: '#FDE68A' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1 },
});

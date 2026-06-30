/**
 * Game 3: Lightning Lane — timer-based writing challenge.
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
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';

const ROUND_SIZE = 10;
const TIME_LIMIT = 12;
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

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SpeedWritingGame({
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
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const def = subset[idx];

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    setPct(0);
    setTimeLeft(TIME_LIMIT);
    setDone(false);
    doneRef.current = false;
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    speak(`Quick! Write ${def.letter}`, 0.78);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!doneRef.current) {
            doneRef.current = true;
            setDone(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [idx, def.letter]);

  const advanceLetter = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    doneRef.current = true;
    setDone(true);
    setScore((s) => s + 1);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}

    if (idx < subset.length - 1) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setDone(false);
        doneRef.current = false;
        setIdx((i) => i + 1);
      }, reduceMotion ? 400 : 800);
    } else {
      setShowConfetti(true);
      speak('Lightning lane complete!', 0.72);
      setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, reduceMotion ? 500 : 1500);
    }
  }, [idx, subset.length, onComplete, reduceMotion]);

  const runRecognition = useCallback(async () => {
    if (doneRef.current) return;
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
    if (p) advanceLetter();
  }, [def.letter, advanceLetter]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      if (doneRef.current) return;
      latestStrokesRef.current = strokes;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        runRecognition();
      }, RECOGNITION_DEBOUNCE_MS);
    },
    [runRecognition],
  );

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    doneRef.current = true;
    setDone(true);
    if (idx < subset.length - 1) {
      setTimeout(() => {
        setDone(false);
        doneRef.current = false;
        setIdx((i) => i + 1);
      }, reduceMotion ? 300 : 600);
    } else {
      setTimeout(() => onComplete(), reduceMotion ? 300 : 600);
    }
  }, [idx, subset.length, onComplete, reduceMotion]);

  const timerColor = timeLeft <= 3 ? '#F87171' : timeLeft <= 6 ? '#FBBF24' : '#34D399';

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="LIGHTNING LANE"
      gameTitle="Speed Write"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={
        <View style={[styles.timerBox, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
        </View>
      }
      footer={
        <LetterMascot
          emoji="⚡"
          name="Bolt"
          hint="Write fast before time runs out!"
          accent="#FBBF24"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(251,191,36,0.35)"
          nameColor="#FDE68A"
          hintColor="#FFFBEB"
        />
      }
    >
      <View style={styles.topRow}>
        <Text style={styles.promptLetter}>{def.letter}</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score}/{subset.length}</Text>
        </View>
      </View>

      <View style={styles.canvasWrap}>
        {!done && (
          <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="#FFFFFF"
              randomColors={false}
              onStrokeEnd={handleStrokeEnd}
            />
          </View>
        )}
        {done && timeLeft === 0 && (
          <View style={styles.timeUpOverlay}>
            <Text style={styles.timeUpText}>Time&apos;s up!</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomRow}>
        {!done && (
          <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
        <View style={styles.progressCol}>
          <TraceMeter percent={pct} label="Match" color="#FBBF24" textColor={SHELL.textOnDark} />
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  timerBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
  },
  timerText: { fontSize: 18, fontWeight: '900' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  promptLetter: { fontSize: 56, fontWeight: '900', color: '#FBBF24' },
  scoreBox: {
    backgroundColor: 'rgba(52,211,153,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  scoreText: { fontSize: 18, fontWeight: '800', color: '#34D399' },
  canvasWrap: {
    flex: 1,
    minHeight: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  captureWrap: { flex: 1, minHeight: 200, backgroundColor: '#FFFFFF' },
  timeUpOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(248,113,113,0.12)' },
  timeUpText: { fontSize: 28, fontWeight: '900', color: '#F87171' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  skipBtn: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  skipText: { fontSize: 15, fontWeight: '700', color: '#FCA5A5' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1 },
});

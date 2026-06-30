/**
 * Game 2: Echo Chamber — hear a letter, write it from memory (audio only).
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

const RECOGNITION_DEBOUNCE_MS = 750;
const ROUND_SIZE = 10;

const SHELL = {
  bg: '#1E1B4B',
  labelColor: '#A5B4FC',
  titleColor: '#EEF2FF',
  textOnDark: '#EEF2FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(129,140,248,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#6366F1',
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

export function MemoryChallengeGame({
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
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const def = subset[idx];

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    setPct(0);
    setRevealed(false);
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    speak(`Write the letter ${def.letter}`, 0.72);
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
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIdx((i) => i + 1);
        }, reduceMotion ? 400 : 1000);
      } else {
        setShowConfetti(true);
        speak('Echo chamber complete!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }
  }, [def.letter, idx, subset.length, onComplete, reduceMotion]);

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

  const handleRepeat = useCallback(() => {
    speak(def.letter, 0.65);
  }, [def.letter]);

  const handleReveal = useCallback(() => setRevealed(true), []);

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="ECHO CHAMBER"
      gameTitle="Audio Memory"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="🔊"
          name="Echo"
          hint="Listen and write — no peeking!"
          accent="#818CF8"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(129,140,248,0.35)"
          nameColor="#A5B4FC"
          hintColor="#EEF2FF"
        />
      }
    >
      <View style={styles.audioBox}>
        <Text style={styles.audioIcon}>🔊</Text>
        <Text style={styles.audioHint}>Listen for the letter!</Text>
        <Pressable onPress={handleRepeat} style={({ pressed }) => [styles.replayBtn, pressed && styles.pressed]}>
          <Text style={styles.replayText}>Replay</Text>
        </Pressable>
      </View>

      {revealed && (
        <View style={styles.revealBox}>
          <Text style={styles.revealLetter}>{def.letter}</Text>
        </View>
      )}

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
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.actionBtn, styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        {!revealed && (
          <Pressable onPress={handleReveal} style={({ pressed }) => [styles.actionBtn, styles.hintBtn, pressed && styles.pressed]}>
            <Text style={styles.hintText}>Hint</Text>
          </Pressable>
        )}
        <View style={styles.progressCol}>
          <TraceMeter percent={pct} label="Match" color="#818CF8" textColor={SHELL.textOnDark} />
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 14, fontWeight: '800', color: SHELL.labelColor },
  audioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
  },
  audioIcon: { fontSize: 28 },
  audioHint: { flex: 1, fontSize: 15, fontWeight: '700', color: '#A5B4FC' },
  replayBtn: {
    backgroundColor: 'rgba(129,140,248,0.25)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  replayText: { fontSize: 14, fontWeight: '700', color: '#EEF2FF' },
  revealBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(129,140,248,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
  },
  revealLetter: { fontSize: 28, fontWeight: '900', color: '#A5B4FC' },
  canvasWrap: {
    flex: 1,
    minHeight: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(129,140,248,0.35)',
  },
  captureWrap: { flex: 1, minHeight: 180, backgroundColor: '#FFFFFF' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14 },
  clearBtn: { backgroundColor: 'rgba(248,113,113,0.2)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
  clearText: { fontSize: 14, fontWeight: '700', color: '#FCA5A5' },
  hintBtn: { backgroundColor: 'rgba(129,140,248,0.2)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.4)' },
  hintText: { fontSize: 14, fontWeight: '700', color: '#A5B4FC' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1 },
});

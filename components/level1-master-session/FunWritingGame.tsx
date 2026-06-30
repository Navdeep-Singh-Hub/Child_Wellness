/**
 * Game 4: Artistry Studio — write letters in creative fun styles.
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
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';

const RECOGNITION_DEBOUNCE_MS = 750;

interface FunRound {
  letter: string;
  style: string;
  emoji: string;
  hint: string;
  useColors: boolean;
}

const FUN_ROUNDS: FunRound[] = [
  { letter: 'A', style: 'Rainbow', emoji: '🌈', hint: 'Use all the colors!', useColors: true },
  { letter: 'B', style: 'Giant', emoji: '🦕', hint: 'Make it HUGE!', useColors: false },
  { letter: 'C', style: 'Tiny', emoji: '🐜', hint: 'Make it super small!', useColors: false },
  { letter: 'M', style: 'Rainbow', emoji: '🌈', hint: 'Colorful M!', useColors: true },
  { letter: 'O', style: 'Decorative', emoji: '🎨', hint: 'Add decorations around it!', useColors: true },
  { letter: 'S', style: 'Giant', emoji: '🦕', hint: 'Fill the whole space!', useColors: false },
  { letter: 'W', style: 'Rainbow', emoji: '🌈', hint: 'Rainbow W!', useColors: true },
  { letter: 'Z', style: 'Zigzag', emoji: '⚡', hint: 'Make it sharp and bold!', useColors: false },
];

const SHELL = {
  bg: '#500724',
  labelColor: '#F9A8D4',
  titleColor: '#FDF2F8',
  textOnDark: '#FDF2F8',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(244,114,182,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#EC4899',
  dotDone: '#34D399',
};

export function FunWritingGame({
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

  const round = FUN_ROUNDS[idx];

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
    speak(`${round.style} ${round.letter}! ${round.hint}`, 0.72);
  }, [idx, round]);

  const runRecognition = useCallback(async () => {
    const expected = round.letter;
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
      speak(`Creative ${round.letter}!`, 0.72);
      if (idx < FUN_ROUNDS.length - 1) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIdx((i) => i + 1);
        }, reduceMotion ? 400 : 1000);
      } else {
        setShowConfetti(true);
        speak('Artistry studio complete!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }
  }, [round.letter, idx, onComplete, reduceMotion]);

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

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="ARTISTRY STUDIO"
      gameTitle={`${round.style} ${round.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{FUN_ROUNDS.length}</Text>}
      footer={
        <LetterMascot
          emoji={round.emoji}
          name="Artist"
          hint={round.hint}
          accent="#F472B6"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(244,114,182,0.35)"
          nameColor="#F9A8D4"
          hintColor="#FDF2F8"
        />
      }
    >
      <View style={styles.promptBox}>
        <Text style={styles.promptEmoji}>{round.emoji}</Text>
        <View style={styles.promptTextWrap}>
          <Text style={styles.promptStyle}>{round.style}</Text>
          <Text style={styles.promptLetter}>{round.letter}</Text>
        </View>
        <Text style={styles.promptHint}>{round.hint}</Text>
      </View>

      <View style={styles.canvasWrap}>
        <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={12}
            canvasColor="#FFFFFF"
            randomColors={round.useColors}
            onStrokeEnd={handleStrokeEnd}
          />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <View style={styles.progressCol}>
          <TraceMeter percent={pct} label="Match" color="#F472B6" textColor={SHELL.textOnDark} />
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 14, fontWeight: '800', color: SHELL.labelColor },
  promptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 12,
    gap: 10,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  promptEmoji: { fontSize: 34 },
  promptTextWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flex: 1 },
  promptStyle: { fontSize: 16, fontWeight: '700', color: '#F9A8D4' },
  promptLetter: { fontSize: 36, fontWeight: '900', color: '#F472B6' },
  promptHint: { fontSize: 12, fontWeight: '600', color: '#FBCFE8', maxWidth: 80, textAlign: 'right' },
  canvasWrap: {
    flex: 1,
    minHeight: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  captureWrap: { flex: 1, minHeight: 180, backgroundColor: '#FFFFFF' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  clearBtn: {
    backgroundColor: 'rgba(244,114,182,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.4)',
  },
  clearText: { fontSize: 14, fontWeight: '700', color: '#F9A8D4' },
  pressed: { opacity: 0.85 },
  progressCol: { flex: 1 },
});

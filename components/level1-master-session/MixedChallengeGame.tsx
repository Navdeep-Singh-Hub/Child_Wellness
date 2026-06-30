/**
 * Game 3: Triad Trial — identify + write + trace combo per round.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Pressable, AccessibilityInfo } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { TraceMeter } from '@/components/level1-full-alphabet-session/alphabet-shared/TraceMeter';
import { ALPHABET, scaleDots, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';

const ROUND_SIZE = 6;
const RECOGNITION_DEBOUNCE_MS = 750;
const DOT_HIT_R = 22;
const DOT_SUCCESS = 65;

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

export function MixedChallengeGame({
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
  const [dims, setDims] = useState({ width: 300, height: 260 });
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'identify' | 'write' | 'trace'>('identify');
  const [pct, setPct] = useState(0);
  const [dotConnected, setDotConnected] = useState<Set<number>>(new Set());
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
  const allNames = useMemo(() => ALPHABET.map((l) => l.letter), []);
  const def = subset[idx];
  const options = useMemo(() => pickOptions(def.letter, allNames, 4), [def, allNames]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPhase('identify');
    setPct(0);
    setDotConnected(new Set());
    setWrongPick(null);
    canvasRef.current?.clear();
    latestStrokesRef.current = [];
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    speak(`Find ${def.letter}!`, 0.72);
  }, [idx, def.letter]);

  const handlePick = useCallback(
    (l: string) => {
      if (l === def.letter) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        speak(`Now write ${def.letter}!`, 0.72);
        setPhase('write');
      } else {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (_) {}
        setWrongPick(l);
        setTimeout(() => setWrongPick(null), 500);
      }
    },
    [def.letter],
  );

  const runWriteRecognition = useCallback(async () => {
    if (phase !== 'write') return;
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
      speak(`Now trace ${def.letter}!`, 0.72);
      canvasRef.current?.clear();
      latestStrokesRef.current = [];
      setPct(0);
      setPhase('trace');
    }
  }, [phase, def.letter]);

  const handleWriteEnd = useCallback(
    (strokes: Stroke[]) => {
      if (phase !== 'write') return;
      latestStrokesRef.current = strokes;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        runWriteRecognition();
      }, RECOGNITION_DEBOUNCE_MS);
    },
    [phase, runWriteRecognition],
  );

  const handleTraceEnd = useCallback(
    (strokes: Stroke[]) => {
      if (phase !== 'trace') return;
      const next = getConnectedDots(strokes, dots, DOT_HIT_R);
      setDotConnected(next);
      const dp = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
      setPct(Math.round(dp));
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      if (dp >= DOT_SUCCESS) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        speak(`Triad complete for ${def.letter}!`, 0.72);
        if (idx < subset.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setIdx((i) => i + 1);
          }, reduceMotion ? 400 : 1000);
        } else {
          setShowConfetti(true);
          speak('Triad trial complete!', 0.72);
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [phase, dots, idx, subset.length, onComplete, def.letter, reduceMotion],
  );

  const phaseLabel = phase === 'identify' ? `Tap ${def.letter}` : phase === 'write' ? `Write ${def.letter}` : `Trace ${def.letter}`;
  const phaseNum = phase === 'identify' ? 1 : phase === 'write' ? 2 : 3;

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="TRIAD TRIAL"
      gameTitle={`Round ${idx + 1}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{def.letter} · {idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="🔥"
          name="Trial"
          hint={phaseLabel}
          accent="#F87171"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(248,113,113,0.35)"
          nameColor="#FCA5A5"
          hintColor="#FEF2F2"
        />
      }
    >
      <View style={styles.phaseRow}>
        {['Identify', 'Write', 'Trace'].map((p, i) => (
          <View key={p} style={[styles.phaseDot, i < phaseNum && styles.phaseDotActive]}>
            <Text style={[styles.phaseText, i < phaseNum && styles.phaseTextActive]}>{i + 1}</Text>
          </View>
        ))}
      </View>

      {phase === 'identify' && (
        <View style={styles.quizWrap}>
          <Text style={styles.quizPrompt}>Tap: {def.letter}</Text>
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
          <Text style={styles.phaseTitle}>Write {def.letter}:</Text>
          <View style={styles.canvasWrap} onLayout={onLayout}>
            <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
              <DrawingCanvas
                ref={canvasRef}
                brushSize={10}
                canvasColor="#FFFFFF"
                randomColors={false}
                onStrokeEnd={handleWriteEnd}
              />
            </View>
          </View>
          <TraceMeter percent={pct} label="Match" color="#F87171" textColor={SHELL.textOnDark} />
        </>
      )}

      {phase === 'trace' && (
        <>
          <Text style={styles.phaseTitle}>Trace {def.letter}:</Text>
          <View style={styles.canvasWrap} onLayout={onLayout}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(255,255,255,0.12)"
              randomColors={false}
              onStrokeEnd={handleTraceEnd}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                {guides.map((s, i) => (
                  <Line
                    key={i}
                    x1={s.from.x}
                    y1={s.from.y}
                    x2={s.to.x}
                    y2={s.to.y}
                    stroke="#FCA5A5"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                  />
                ))}
                {dots.map((d, i) => (
                  <Circle
                    key={i}
                    cx={d.x}
                    cy={d.y}
                    r={dotConnected.has(i) ? 10 : 7}
                    fill={dotConnected.has(i) ? '#34D399' : '#F87171'}
                    opacity={dotConnected.has(i) ? 1 : 0.7}
                  />
                ))}
              </Svg>
            </View>
          </View>
          <TraceMeter percent={pct} label="Traced" color="#F87171" textColor={SHELL.textOnDark} />
        </>
      )}
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 13, fontWeight: '800', color: SHELL.labelColor },
  phaseRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 10 },
  phaseDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseDotActive: { backgroundColor: '#34D399' },
  phaseText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF' },
  phaseTextActive: { color: '#FFF' },
  quizWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  quizPrompt: { fontSize: 26, fontWeight: '800', color: '#FEF2F2' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionBtn: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  optionWrong: { backgroundColor: 'rgba(248,113,113,0.25)', borderColor: '#F87171' },
  optionText: { fontSize: 30, fontWeight: '900', color: '#FCA5A5' },
  optionTextWrong: { color: '#F87171' },
  pressed: { opacity: 0.85 },
  phaseTitle: { fontSize: 16, fontWeight: '700', color: '#FCA5A5', marginBottom: 4 },
  canvasWrap: {
    flex: 1,
    minHeight: 160,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(248,113,113,0.35)',
  },
  captureWrap: { flex: 1, minHeight: 160, backgroundColor: '#FFFFFF' },
});

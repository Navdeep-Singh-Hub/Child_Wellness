/**
 * Game 3: Muscle Memory Dojo — trace same letter 3 times (A,B,D,G,M,R,S,W).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { TraceMeter } from './alphabet-shared/TraceMeter';
import { letterColor, letterIndex } from './alphabet-shared/letterColor';
import { ALPHABET, ALPHABET_NAMES, scaleDots, scaleStrokes } from './alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const PRACTICE_LETTERS = ALPHABET.filter((l) => 'ABDGMRSW'.includes(l.letter));
const REPEATS = 3;
const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

const SHELL = {
  bg: '#431407',
  labelColor: '#FDBA74',
  titleColor: '#FFF7ED',
  textOnDark: '#FFF7ED',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(251,146,60,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#FB923C',
  dotDone: '#34D399',
};

export function LetterRepeatPracticeGame({
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
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [letterIdx, setLetterIdx] = useState(0);
  const [rep, setRep] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = PRACTICE_LETTERS[letterIdx];
  const color = letterColor(letterIndex(def.letter, ALPHABET_NAMES));
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    setConnected(new Set());
    canvasRef.current?.clear();
    if (rep === 0) {
      speak(`Practice ${def.letter} — trace it ${REPEATS} times in the dojo!`, 0.72);
    } else {
      speak(`${def.letter} again!`, 0.72);
    }
  }, [letterIdx, rep, def.letter]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const nextDot = useMemo(() => {
    for (let i = 0; i < dots.length; i++) if (!connected.has(i)) return i;
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const next = getConnectedDots(strokes, dots, HIT_RADIUS);
      setConnected(next);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
      if (pct >= SUCCESS_PCT) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        if (rep < REPEATS - 1) {
          setTimeout(() => setRep((r) => r + 1), reduceMotion ? 400 : 800);
        } else if (letterIdx < PRACTICE_LETTERS.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setLetterIdx((i) => i + 1);
            setRep(0);
          }, reduceMotion ? 500 : 1200);
        } else {
          setShowConfetti(true);
          speak('Muscle memory mastered! Your hands remember every letter!', 0.72);
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [dots, rep, letterIdx, onComplete, reduceMotion],
  );

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="MUSCLE MEMORY DOJO"
        gameTitle={`Practice ${def.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="💪"
          name="Sensei"
          hint={`Trace ${def.letter} — round ${rep + 1} of ${REPEATS}!`}
          accent="#FB923C"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(251,146,60,0.35)"
          nameColor="#FB923C"
          hintColor="#FFF7ED"
        />
        <View style={styles.headerRow}>
          <Text style={styles.counter}>{def.letter} · Letter {letterIdx + 1}/{PRACTICE_LETTERS.length}</Text>
          <View style={styles.repRow}>
            {Array.from({ length: REPEATS }, (_, i) => (
              <View key={i} style={[styles.repDot, i <= rep && styles.repDotActive]} />
            ))}
          </View>
        </View>
        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.canvasWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(67,20,7,0.35)"
              randomColors={false}
              onStrokeEnd={handleStrokeEnd}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                {guides.map((s, i) => (
                  <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke="#FDBA74" strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" opacity={0.6} />
                ))}
                {dots.map((d, i) => (
                  <React.Fragment key={i}>
                    {i === nextDot && <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#FBBF24" strokeWidth={3} opacity={0.8} />}
                    <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 12 : 9} fill={connected.has(i) ? '#34D399' : color} opacity={connected.has(i) ? 1 : 0.85} />
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          </View>
          <TraceMeter percent={pct} label="Dojo progress" color={color} textColor="#FDBA74" />
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { alignItems: 'center', marginBottom: 6 },
  counter: { fontSize: 14, fontWeight: '800', color: '#FDBA74' },
  repRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  repDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.15)' },
  repDotActive: { backgroundColor: '#34D399' },
  outer: { flex: 1 },
  canvasWrap: {
    flex: 1,
    minHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(251,146,60,0.35)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

/**
 * Game 3: Mind Palace — show letter → hide → trace from memory.
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
import { TraceMeter } from '@/components/level1-full-alphabet-session/alphabet-shared/TraceMeter';
import { ALPHABET, scaleDots, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const HIT_RADIUS = 28;
const SUCCESS_PCT = 55;
const SHOW_DURATION = 2200;
const LETTERS_COUNT = 8;

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

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function LetterMemoryTraceGame({
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
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'show' | 'trace'>('show');
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, LETTERS_COUNT), []);
  const def = subset[idx];
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPhase('show');
    setConnected(new Set());
    canvasRef.current?.clear();
    fadeAnim.setValue(1);
    speak(`Remember ${def.letter}! Look carefully.`, 0.72);

    const showMs = reduceMotion ? 1200 : SHOW_DURATION;
    const fadeMs = reduceMotion ? 200 : 500;
    const timer = setTimeout(() => {
      RNAnimated.timing(fadeAnim, { toValue: 0, duration: fadeMs, useNativeDriver: true }).start(() => {
        setPhase('trace');
        speak(`Now trace ${def.letter} from memory!`, 0.72);
      });
    }, showMs);
    return () => clearTimeout(timer);
  }, [idx, def.letter, fadeAnim, reduceMotion]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      if (phase !== 'trace') return;
      const next = getConnectedDots(strokes, dots, HIT_RADIUS);
      setConnected(next);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
      if (pct >= SUCCESS_PCT) {
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
          speak('Mind palace unlocked!', 0.72);
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [phase, dots, def.letter, idx, subset.length, onComplete, reduceMotion],
  );

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;
  const mascotHint =
    phase === 'show' ? `Look at ${def.letter} carefully…` : `Draw ${def.letter} from memory!`;

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="MIND PALACE"
      gameTitle={`Memory ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="🧠"
          name="Palace"
          hint={mascotHint}
          accent="#F472B6"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(244,114,182,0.35)"
          nameColor="#F9A8D4"
          hintColor="#FDF2F8"
        />
      }
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          {phase === 'trace' && (
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(255,255,255,0.12)"
              randomColors={false}
              onStrokeEnd={handleStrokeEnd}
            />
          )}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {phase === 'show' && (
              <RNAnimated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                <Svg width={dims.width} height={dims.height}>
                  {guides.map((s, i) => (
                    <Line
                      key={i}
                      x1={s.from.x}
                      y1={s.from.y}
                      x2={s.to.x}
                      y2={s.to.y}
                      stroke="#EC4899"
                      strokeWidth={8}
                      strokeLinecap="round"
                    />
                  ))}
                </Svg>
              </RNAnimated.View>
            )}
          </View>
          {phase === 'show' && (
            <View style={styles.showOverlay}>
              <Text style={styles.showLetter}>{def.letter}</Text>
              <Text style={styles.showHint}>Memorize it!</Text>
            </View>
          )}
          {phase === 'trace' && (
            <View style={styles.traceHint}>
              <Text style={styles.traceHintText}>Draw from memory!</Text>
            </View>
          )}
        </View>
        {phase === 'trace' && (
          <TraceMeter percent={pct} label="Accuracy" color="#F472B6" textColor={SHELL.textOnDark} />
        )}
      </View>
      {showConfetti && <ConfettiEffect />}
    </LetterGameShell>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 14, fontWeight: '800', color: SHELL.labelColor },
  outer: { flex: 1 },
  canvasWrap: {
    flex: 1,
    minHeight: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(244,114,182,0.3)',
  },
  showOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  showLetter: { fontSize: 100, fontWeight: '900', color: '#F472B6' },
  showHint: { fontSize: 18, fontWeight: '700', color: '#F9A8D4', marginTop: 8 },
  traceHint: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(236,72,153,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  traceHintText: { fontSize: 14, fontWeight: '700', color: '#FDF2F8' },
});

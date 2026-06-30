/**
 * Game 1: Whisper Dots Studio — faint dots, no arrows.
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
import { TraceMeter } from '@/components/level1-full-alphabet-session/alphabet-shared/TraceMeter';
import { ALPHABET, scaleDots, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const SNAP_HIT_RADIUS = 26;
const COMPLETE_PROGRESS = 1;
const LETTERS_PER_ROUND = 10;

const SHELL = {
  bg: '#3B0764',
  labelColor: '#C4B5FD',
  titleColor: '#F5F3FF',
  textOnDark: '#F5F3FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(167,139,250,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#A78BFA',
  dotDone: '#34D399',
};

export function LightDottedTracingGame({
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
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const letterDoneRef = useRef(false);

  const subset = useMemo(() => ALPHABET.slice(0, LETTERS_PER_ROUND), []);
  const def = subset[idx];
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const totalDots = dots.length;
  const tracedCount = connected.size;
  const progress = totalDots > 0 ? tracedCount / totalDots : 0;
  const pctDisplay = totalDots > 0 ? Math.min(100, Math.round(progress * 100)) : 0;

  const nextDotIndex = useMemo(() => {
    for (let i = 0; i < totalDots; i++) {
      if (!connected.has(i)) return i;
    }
    return -1;
  }, [connected, totalDots]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setConnected(new Set());
    canvasRef.current?.clear();
    letterDoneRef.current = false;
    speak(`Trace letter ${def.letter}. Whisper dots only!`, 0.72);
  }, [idx, def.letter]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setPulsePhase((p) => (p + 1) % 2), 520);
    return () => clearInterval(id);
  }, [idx, reduceMotion]);

  const updateFromPaths = useCallback(
    (paths: { path: string }[]) => {
      const next = getConnectedDots(paths, dots, SNAP_HIT_RADIUS);
      setConnected(next);
      const p = totalDots > 0 ? next.size / totalDots : 0;
      if (p < COMPLETE_PROGRESS || letterDoneRef.current) return;
      letterDoneRef.current = true;
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      speak(`Beautiful ${def.letter}!`, 0.72);
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIdx((i) => i + 1);
        }, reduceMotion ? 400 : 1000);
      } else {
        setShowConfetti(true);
        speak('Whisper dots mastered!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    },
    [dots, totalDots, idx, subset.length, onComplete, def.letter, reduceMotion],
  );

  const handleTracingChange = useCallback(
    (paths: { path: string }[]) => updateFromPaths(paths),
    [updateFromPaths],
  );

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      updateFromPaths(strokes.map((s) => ({ path: s.path })));
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    },
    [updateFromPaths],
  );

  let hint: string | null = null;
  if (progress < COMPLETE_PROGRESS) {
    if (pctDisplay >= 90) hint = 'Almost there! Finish the last dot.';
    else if (pctDisplay >= 60) hint = 'Follow every faint dot.';
  }

  const untracedPulseOpacity = reduceMotion ? 0.45 : 0.38 + pulsePhase * 0.22;

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="WHISPER DOTS STUDIO"
      gameTitle={`Trace ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="👁️"
          name="Whisper"
          hint={hint ?? 'Faint dots only — you have got this!'}
          accent="#A78BFA"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(167,139,250,0.35)"
          nameColor="#C4B5FD"
          hintColor="#F5F3FF"
        />
      }
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={10}
            canvasColor="rgba(255,255,255,0.12)"
            randomColors={false}
            onTracingChange={handleTracingChange}
            onStrokeEnd={handleStrokeEnd}
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
                  stroke="rgba(196,181,253,0.25)"
                  strokeWidth={2}
                  strokeDasharray="4 8"
                  strokeLinecap="round"
                />
              ))}
              {dots.map((d, i) => {
                const done = connected.has(i);
                const isNext = !done && i === nextDotIndex;
                if (done) {
                  return <Circle key={i} cx={d.x} cy={d.y} r={10} fill="#34D399" opacity={1} />;
                }
                if (isNext) {
                  return (
                    <React.Fragment key={i}>
                      <Circle cx={d.x} cy={d.y} r={16} fill="none" stroke="#A78BFA" strokeWidth={2.5} opacity={0.85} />
                      <Circle cx={d.x} cy={d.y} r={11} fill="#8B5CF6" opacity={1} />
                    </React.Fragment>
                  );
                }
                return (
                  <Circle key={i} cx={d.x} cy={d.y} r={5} fill="#94A3B8" opacity={untracedPulseOpacity} />
                );
              })}
            </Svg>
          </View>
        </View>
        <TraceMeter
          percent={pctDisplay}
          label={`Dots ${tracedCount}/${totalDots} — need 100%`}
          color="#A78BFA"
          textColor={SHELL.textOnDark}
        />
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
    borderColor: 'rgba(167,139,250,0.3)',
  },
});

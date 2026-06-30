/**
 * Game 2: Silent Outline — thin outline only, no glow helpers.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { TraceMeter } from '@/components/level1-full-alphabet-session/alphabet-shared/TraceMeter';
import { ALPHABET, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { coveragePerGuideSegment } from '@/components/level1-grip-session/shapeFillUtils';

const LETTERS_PER_ROUND = 10;
const SAMPLE_STEP_PX = 10;
const OUTLINE_HIT_RADIUS = 24;
const COMPLETE_PROGRESS = 1;
const SEGMENT_DONE = 1;

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

export function TraceWithoutHighlightGame({
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
  const [pct, setPct] = useState(0);
  const [segmentCov, setSegmentCov] = useState<number[]>([]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const letterDoneRef = useRef(false);

  const subset = useMemo(() => ALPHABET.slice(10, 10 + LETTERS_PER_ROUND), []);
  const def = subset[idx];
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
    setPct(0);
    setSegmentCov(guides.map(() => 0));
    letterDoneRef.current = false;
    canvasRef.current?.clear();
    speak(`Trace ${def.letter} — outline only, no helpers!`, 0.72);
  }, [idx, def.letter, guides]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setPulsePhase((p) => (p + 1) % 2), 520);
    return () => clearInterval(id);
  }, [idx, reduceMotion]);

  const updateFromPaths = useCallback(
    (paths: { path: string }[]) => {
      if (guides.length === 0) return;
      const perSeg = coveragePerGuideSegment(paths, guides, OUTLINE_HIT_RADIUS, SAMPLE_STEP_PX);
      setSegmentCov(perSeg);
      const minCov = Math.min(...perSeg);
      setPct(Math.min(100, Math.round(minCov * 100)));

      if (minCov < COMPLETE_PROGRESS || letterDoneRef.current) return;
      letterDoneRef.current = true;
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      speak(`Perfect ${def.letter}!`, 0.72);
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIdx((i) => i + 1);
        }, reduceMotion ? 400 : 1000);
      } else {
        setShowConfetti(true);
        speak('Silent outline complete!', 0.72);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    },
    [guides, idx, subset.length, onComplete, def.letter, reduceMotion],
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

  const hasIncomplete = segmentCov.some((c) => c < SEGMENT_DONE);
  let hint = 'Just the outline — trace carefully!';
  if (hasIncomplete && pct >= 90) hint = 'Almost there! Trace the remaining part!';
  else if (hasIncomplete && pct >= 50) hint = 'Cover every part of the outline.';

  const pulseBoost = reduceMotion ? 0 : pulsePhase * 0.12;

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="SILENT OUTLINE"
      gameTitle={`Outline ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="✨"
          name="Silence"
          hint={hint}
          accent="#818CF8"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(129,140,248,0.35)"
          nameColor="#A5B4FC"
          hintColor="#EEF2FF"
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
              {guides.map((s, i) => {
                const cov = segmentCov[i] ?? 0;
                const done = cov >= SEGMENT_DONE;
                return (
                  <Line
                    key={i}
                    x1={s.from.x}
                    y1={s.from.y}
                    x2={s.to.x}
                    y2={s.to.y}
                    stroke={done ? '#34D399' : '#818CF8'}
                    strokeWidth={done ? 3 : 4.5}
                    strokeLinecap="round"
                    strokeOpacity={done ? 0.55 : 0.75 + pulseBoost}
                  />
                );
              })}
            </Svg>
          </View>
        </View>
        <TraceMeter
          percent={pct}
          label="Coverage — every part of the outline"
          color="#818CF8"
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
    borderColor: 'rgba(129,140,248,0.3)',
  },
});

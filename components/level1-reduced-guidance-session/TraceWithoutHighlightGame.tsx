/**
 * Game 2: Trace Without Highlight — no glowing path, only a thin letter outline.
 * Coverage = min over outline segments (path samples); scribbles off the letter do not add score.
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
import { coveragePerGuideSegment } from '@/components/level1-grip-session/shapeFillUtils';

const LETTERS_PER_ROUND = 10;
/** Dense samples along each guide (~100–200 total on typical letters). */
const SAMPLE_STEP_PX = 10;
/** Forgiveness near the outline (px). */
const OUTLINE_HIT_RADIUS = 24;
/** Full outline required on every segment (no slack). */
const COMPLETE_PROGRESS = 1;
const SEGMENT_DONE = 1;

export function TraceWithoutHighlightGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [segmentCov, setSegmentCov] = useState<number[]>([]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const letterDoneRef = useRef(false);

  const subset = useMemo(() => ALPHABET.slice(10, 10 + LETTERS_PER_ROUND), []);
  const def = subset[idx];
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setPct(0);
    setSegmentCov(guides.map(() => 0));
    letterDoneRef.current = false;
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Trace ${def.letter} — no helpers!`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter, guides]);

  useEffect(() => {
    const id = setInterval(() => setPulsePhase((p) => (p + 1) % 2), 520);
    return () => clearInterval(id);
  }, [idx]);

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
      if (idx < subset.length - 1) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIdx((i) => i + 1);
        }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, 1500);
      }
    },
    [guides, idx, subset.length, onComplete]
  );

  const handleTracingChange = useCallback(
    (paths: { path: string }[]) => updateFromPaths(paths),
    [updateFromPaths]
  );

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      updateFromPaths(strokes.map((s) => ({ path: s.path })));
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    },
    [updateFromPaths]
  );

  const hasIncomplete = segmentCov.some((c) => c < SEGMENT_DONE);
  let hint: string | null = null;
  if (hasIncomplete && pct >= 90) hint = 'Almost there! Trace the remaining part!';
  else if (hasIncomplete && pct >= 50) hint = 'Trace the parts that still glow purple.';

  const pulseBoost = pulsePhase * 0.12;

  return (
    <GameContainerGrip
      title={`Outline: ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="✨"
      mascotHint="Just the outline — trace carefully!"
      onBack={onBack}
    >
      <Text style={styles.counter}>{def.letter} ({idx + 1}/{subset.length})</Text>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={10}
            canvasColor="rgba(255,255,255,0.45)"
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
                    stroke={done ? '#4ADE80' : '#9333EA'}
                    strokeWidth={done ? 3 : 4.5}
                    strokeLinecap="round"
                    strokeOpacity={done ? 0.55 : 0.75 + pulseBoost}
                  />
                );
              })}
            </Svg>
          </View>
        </View>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        <View style={styles.progressRow}>
          <Text style={styles.label}>
            Coverage: {pct}% (every part of the outline) — need 100%
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 6 },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  hint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#6D28D9',
  },
  progressRow: { marginTop: 10, gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

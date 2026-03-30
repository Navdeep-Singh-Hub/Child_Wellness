/**
 * Game 1: Light Dotted Tracing — faint dots, no arrows.
 * Reduced guidance: child relies on muscle memory with minimal visual cues.
 *
 * Completion: nearly all dots hit (≥98%) so tiny touch gaps still count; live updates while drawing.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleDots, scaleStrokes } from '@/components/level1-full-alphabet-session/alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

/** Wider than stroke width so “near” a dot counts (snap-friendly). */
const SNAP_HIT_RADIUS = 26;
/** All dots must be traced (no intentional slack). */
const COMPLETE_PROGRESS = 1;
const LETTERS_PER_ROUND = 10;

export function LightDottedTracingGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
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

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setConnected(new Set());
    canvasRef.current?.clear();
    letterDoneRef.current = false;
    try { Speech.stop(); Speech.speak(`Trace ${def.letter}`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  useEffect(() => {
    const id = setInterval(() => setPulsePhase((p) => (p + 1) % 2), 520);
    return () => clearInterval(id);
  }, [idx]);

  const updateFromPaths = useCallback(
    (paths: { path: string }[]) => {
      const next = getConnectedDots(paths, dots, SNAP_HIT_RADIUS);
      setConnected(next);
      const p = totalDots > 0 ? next.size / totalDots : 0;
      if (p < COMPLETE_PROGRESS || letterDoneRef.current) return;
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
    [dots, totalDots, idx, subset.length, onComplete]
  );

  const handleTracingChange = useCallback(
    (paths: { path: string }[]) => {
      updateFromPaths(paths);
    },
    [updateFromPaths]
  );

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      updateFromPaths(strokes.map((s) => ({ path: s.path })));
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    },
    [updateFromPaths]
  );

  let hint: string | null = null;
  if (progress >= COMPLETE_PROGRESS) hint = null;
  else if (pctDisplay >= 90) hint = 'Almost there! Finish the last part.';
  else if (pctDisplay >= 60) hint = 'Keep going — follow every dot.';

  const untracedPulseOpacity = 0.38 + pulsePhase * 0.22;

  return (
    <GameContainerGrip
      title={`Trace ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="👁️"
      mascotHint="Faint dots only — you've got this!"
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
              {guides.map((s, i) => (
                <Line
                  key={i}
                  x1={s.from.x}
                  y1={s.from.y}
                  x2={s.to.x}
                  y2={s.to.y}
                  stroke="#E5E7EB"
                  strokeWidth={2}
                  strokeDasharray="4 8"
                  strokeLinecap="round"
                />
              ))}
              {dots.map((d, i) => {
                const done = connected.has(i);
                const isNext = !done && i === nextDotIndex;
                if (done) {
                  return (
                    <Circle key={i} cx={d.x} cy={d.y} r={10} fill="#22C55E" opacity={1} />
                  );
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
                  <Circle
                    key={i}
                    cx={d.x}
                    cy={d.y}
                    r={5}
                    fill="#9CA3AF"
                    opacity={untracedPulseOpacity}
                  />
                );
              })}
            </Svg>
          </View>
        </View>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        <View style={styles.progressRow}>
          <Text style={styles.label}>
            Traced: {pctDisplay}% ({tracedCount}/{totalDots} dots) — need 100%
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pctDisplay}%` }]} />
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

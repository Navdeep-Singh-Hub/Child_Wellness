/**
 * Game 1: Full Letter Tracing (Guided) — A–Z one by one.
 * Stroke animation first, then trace with direction arrows and glow. ≥75% accuracy.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleDots, scaleStrokes, type Point } from './alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

function arrowHead(from: Point, to: Point, size: number): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const tip = { x: mid.x + Math.cos(angle) * size, y: mid.y + Math.sin(angle) * size };
  const l = { x: mid.x + Math.cos(angle + 2.5) * size * 0.7, y: mid.y + Math.sin(angle + 2.5) * size * 0.7 };
  const r = { x: mid.x + Math.cos(angle - 2.5) * size * 0.7, y: mid.y + Math.sin(angle - 2.5) * size * 0.7 };
  return `${tip.x},${tip.y} ${l.x},${l.y} ${r.x},${r.y}`;
}

export function GuidedLetterTracingGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [strokePhase, setStrokePhase] = useState(true);
  const [revealedStrokes, setRevealedStrokes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = ALPHABET[idx];
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setStrokePhase(true);
    setRevealedStrokes(0);
    setConnected(new Set());
    canvasRef.current?.clear();
    let timer: ReturnType<typeof setTimeout>;
    const reveal = (n: number) => {
      setRevealedStrokes(n);
      if (n < guides.length) timer = setTimeout(() => reveal(n + 1), 450);
      else timer = setTimeout(() => setStrokePhase(false), 600);
    };
    timer = setTimeout(() => reveal(1), 300);
    try { Speech.stop(); Speech.speak(`Trace letter ${def.letter}`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
    return () => clearTimeout(timer);
  }, [idx, guides.length, def.letter]);

  const nextDot = useMemo(() => {
    for (let i = 0; i < dots.length; i++) if (!connected.has(i)) return i;
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    if (strokePhase) return;
    const next = getConnectedDots(strokes, dots, HIT_RADIUS);
    setConnected(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
    if (pct >= SUCCESS_PCT) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      if (idx < ALPHABET.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1000);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [strokePhase, dots, idx, onComplete]);

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <GameContainerGrip
      title={`Trace ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="✏️"
      mascotHint={strokePhase ? `Watch how to write ${def.letter}...` : `Now trace ${def.letter}! Follow the dots.`}
      onBack={onBack}
    >
      <Text style={styles.counter}>{def.letter} ({idx + 1}/{ALPHABET.length})</Text>
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          {!strokePhase && (
            <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false} onStrokeEnd={handleStrokeEnd} />
          )}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dims.width} height={dims.height}>
              {strokePhase
                ? guides.slice(0, revealedStrokes).map((s, i) => (
                    <Line key={`anim-${i}`} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                      stroke="#7C3AED" strokeWidth={8} strokeLinecap="round" />
                  ))
                : guides.map((s, i) => (
                    <React.Fragment key={`g-${i}`}>
                      <Line x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                        stroke="#C4B5FD" strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />
                      <Polygon points={arrowHead(s.from, s.to, 10)} fill="#C4B5FD" opacity={0.7} />
                    </React.Fragment>
                  ))
              }
              {!strokePhase && dots.map((d, i) => (
                <React.Fragment key={i}>
                  {i === nextDot && <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#F59E0B" strokeWidth={3} opacity={0.7} />}
                  <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 12 : 9}
                    fill={connected.has(i) ? '#22C55E' : '#7C3AED'} opacity={connected.has(i) ? 1 : 0.8} />
                  {!connected.has(i) && <Circle cx={d.x} cy={d.y} r={4} fill="#FFF" opacity={0.5} />}
                </React.Fragment>
              ))}
            </Svg>
          </View>
          {strokePhase && (
            <View style={styles.watchOverlay}><Text style={styles.watchText}>Watch...</Text></View>
          )}
        </View>
        {!strokePhase && (
          <View style={styles.progressRow}>
            <Text style={styles.label}>Traced: {pct}%</Text>
            <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
          </View>
        )}
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#5B21B6', marginBottom: 6 },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  watchOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  watchText: { fontSize: 20, fontWeight: '800', color: '#7C3AED', backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16 },
  progressRow: { marginTop: 10, gap: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

/**
 * Game 4: Trace + Sound — tracing while hearing the letter sound continuously.
 * 8 letters: C, F, H, J, K, N, P, Z
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { ALPHABET, scaleDots, scaleStrokes, type Point } from './alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const SOUND_LETTERS = ALPHABET.filter((l) => 'CFHJKNPZ'.includes(l.letter));
const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

export function TraceSoundGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = SOUND_LETTERS[idx];
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setConnected(new Set());
    setIsDrawing(false);
    canvasRef.current?.clear();
    try { Speech.stop(); Speech.speak(`Trace ${def.letter} and listen!`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [idx, def.letter]);

  const handleStrokeStart = useCallback(() => {
    setIsDrawing(true);
    try { Speech.stop(); Speech.speak(def.letter, { rate: 0.6, pitch: 1.0 }); } catch (_) {}
  }, [def.letter]);

  const nextDot = useMemo(() => {
    for (let i = 0; i < dots.length; i++) if (!connected.has(i)) return i;
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback((strokes: Stroke[]) => {
    setIsDrawing(false);
    const next = getConnectedDots(strokes, dots, HIT_RADIUS);
    setConnected(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
    if (pct >= SUCCESS_PCT) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak(`Great ${def.letter}!`, { rate: 0.9 }); } catch (_) {}
      if (idx < SOUND_LETTERS.length - 1) {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); setIdx((i) => i + 1); }, 1200);
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }
  }, [dots, def, idx, onComplete]);

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <GameContainerGrip
      title={`Trace + Sound: ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔊"
      mascotHint={isDrawing ? `${def.letter}...` : `Trace ${def.letter} to hear it!`}
      onBack={onBack}
    >
      <Text style={styles.counter}>{def.letter} ({idx + 1}/{SOUND_LETTERS.length})</Text>
      {isDrawing && (
        <View style={styles.soundBubble}>
          <Text style={styles.soundText}>"{def.letter}..."</Text>
        </View>
      )}
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <DrawingCanvas ref={canvasRef} brushSize={10} canvasColor="rgba(255,255,255,0.55)" randomColors={false}
            onStrokeStart={handleStrokeStart} onStrokeEnd={handleStrokeEnd} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dims.width} height={dims.height}>
              {guides.map((s, i) => (
                <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                  stroke="#C4B5FD" strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />
              ))}
              {dots.map((d, i) => (
                <React.Fragment key={i}>
                  {i === nextDot && <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#F59E0B" strokeWidth={3} opacity={0.7} />}
                  <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 12 : 9}
                    fill={connected.has(i) ? '#22C55E' : '#7C3AED'} opacity={connected.has(i) ? 1 : 0.8} />
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Traced: {pct}%</Text>
          <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  counter: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#5B21B6', marginBottom: 4 },
  soundBubble: { alignSelf: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16, marginBottom: 6 },
  soundText: { fontSize: 22, fontWeight: '900', color: '#92400E' },
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  progressRow: { marginTop: 10, gap: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
});

/**
 * Game 4: Script Sands — dot-to-dot tracing for all 14 letters.
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
import { letterColor } from './slant-shared/letterColors';
import { LETTERS, scaleDots, scaleStrokes } from './letterData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

const SHELL = {
  bg: '#FEF3C7',
  labelColor: '#B45309',
  titleColor: '#78350F',
  textOnDark: '#78350F',
  backBg: 'rgba(255,255,255,0.7)',
  backBorder: 'rgba(234,179,8,0.4)',
  dotIdle: 'rgba(120,53,15,0.15)',
  dotActive: '#EAB308',
  dotDone: '#22C55E',
};

export function DottedLetterTraceGame({
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
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const spokeLetter = useRef(-1);

  const def = LETTERS[idx];
  const color = letterColor(idx);
  const dots = useMemo(() => scaleDots(def.dots, 100, 120, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, 100, 120, dims.width, dims.height), [def, dims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (spokeLetter.current !== idx) {
      spokeLetter.current = idx;
      speak(`Trace letter ${def.letter} in the desert sand!`, 0.72);
    }
  }, [idx, def.letter]);

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
        setShowConfetti(true);
        speak(`Beautiful ${def.letter}!`, 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          if (idx < LETTERS.length - 1) {
            setIdx((i) => i + 1);
            setConnected(new Set());
            canvasRef.current?.clear();
          } else {
            speak('You wrote every letter in the sands! Incredible!', 0.72);
            onComplete();
          }
        }, reduceMotion ? 400 : 1200);
      }
    },
    [dots, def, idx, onComplete, reduceMotion],
  );

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: '#FDE68A' }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: '#D97706', opacity: 0.25 }} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="SCRIPT SANDS"
        gameTitle={`Trace ${def.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🏜️"
          name="Scribe"
          hint={`Draw letter ${def.letter} by connecting the sand dots!`}
          accent="#D97706"
          bubbleBg="rgba(255,255,255,0.85)"
          bubbleBorder="rgba(234,179,8,0.4)"
          nameColor="#B45309"
          hintColor="#78350F"
        />
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>{idx + 1} / {LETTERS.length}</Text>
        </View>
        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.canvasWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(255,255,255,0.65)"
              randomColors={false}
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
                    stroke={color + '35'}
                    strokeWidth={4}
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                ))}
                {dots.map((d, i) => (
                  <React.Fragment key={i}>
                    {i === nextDot && (
                      <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#D97706" strokeWidth={3} opacity={0.8} />
                    )}
                    <Circle
                      cx={d.x}
                      cy={d.y}
                      r={connected.has(i) ? 13 : 10}
                      fill={connected.has(i) ? '#22C55E' : color}
                      opacity={connected.has(i) ? 1 : 0.85}
                    />
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.label}>Sand trail: {pct}%</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
          </View>
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  indicator: { alignItems: 'center', marginBottom: 8 },
  indicatorText: { fontSize: 14, fontWeight: '700', color: '#B45309' },
  outer: { flex: 1 },
  canvasWrap: {
    flex: 1,
    minHeight: 240,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(234,179,8,0.4)',
  },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 15, fontWeight: '700', color: '#B45309' },
  barBg: { height: 12, backgroundColor: 'rgba(120,53,15,0.1)', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
});

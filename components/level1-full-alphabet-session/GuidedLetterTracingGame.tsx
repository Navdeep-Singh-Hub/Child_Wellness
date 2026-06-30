/**
 * Game 1: North Star Tracing — A–Z guided tracing with stroke animation + arrows.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { TraceMeter } from './alphabet-shared/TraceMeter';
import { letterColor } from './alphabet-shared/letterColor';
import { ALPHABET, scaleDots, scaleStrokes, type Point } from './alphabetData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

const SHELL = {
  bg: '#0C4A6E',
  labelColor: '#7DD3FC',
  titleColor: '#F0F9FF',
  textOnDark: '#F0F9FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(125,211,252,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#38BDF8',
  dotDone: '#34D399',
};

function arrowHead(from: Point, to: Point, size: number): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const tip = { x: mid.x + Math.cos(angle) * size, y: mid.y + Math.sin(angle) * size };
  const l = { x: mid.x + Math.cos(angle + 2.5) * size * 0.7, y: mid.y + Math.sin(angle + 2.5) * size * 0.7 };
  const r = { x: mid.x + Math.cos(angle - 2.5) * size * 0.7, y: mid.y + Math.sin(angle - 2.5) * size * 0.7 };
  return `${tip.x},${tip.y} ${l.x},${l.y} ${r.x},${r.y}`;
}

export function GuidedLetterTracingGame({
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
  const [strokePhase, setStrokePhase] = useState(true);
  const [revealedStrokes, setRevealedStrokes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = ALPHABET[idx];
  const color = letterColor(idx);
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
    setStrokePhase(true);
    setRevealedStrokes(0);
    setConnected(new Set());
    canvasRef.current?.clear();
    speak(`Trace letter ${def.letter}. Watch the stars first!`, 0.72);
    let timer: ReturnType<typeof setTimeout>;
    const reveal = (n: number) => {
      setRevealedStrokes(n);
      if (n < guides.length) timer = setTimeout(() => reveal(n + 1), reduceMotion ? 150 : 450);
      else timer = setTimeout(() => setStrokePhase(false), reduceMotion ? 200 : 600);
    };
    timer = setTimeout(() => reveal(1), reduceMotion ? 100 : 300);
    return () => clearTimeout(timer);
  }, [idx, guides.length, def.letter, reduceMotion]);

  const nextDot = useMemo(() => {
    for (let i = 0; i < dots.length; i++) if (!connected.has(i)) return i;
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      if (strokePhase) return;
      const next = getConnectedDots(strokes, dots, HIT_RADIUS);
      setConnected(next);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
      if (pct >= SUCCESS_PCT) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        speak(`Beautiful ${def.letter}!`, 0.72);
        if (idx < ALPHABET.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setIdx((i) => i + 1);
          }, reduceMotion ? 400 : 1000);
        } else {
          setShowConfetti(true);
          speak('You traced the whole alphabet! North star achieved!', 0.72);
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [strokePhase, dots, idx, onComplete, def.letter, reduceMotion],
  );

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;
  const hint = strokePhase ? `Watch how to write ${def.letter}...` : `Follow the stars to trace ${def.letter}!`;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(56,189,248,0.08)' }]} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="NORTH STAR TRACING"
        gameTitle={`Letter ${def.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="⭐"
          name="Polaris"
          hint={hint}
          accent="#38BDF8"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(125,211,252,0.35)"
          nameColor="#7DD3FC"
          hintColor="#F0F9FF"
        />
        <Text style={styles.counter}>{def.letter} · {idx + 1} / {ALPHABET.length}</Text>
        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.canvasWrap}>
            {!strokePhase && (
              <DrawingCanvas
                ref={canvasRef}
                brushSize={10}
                canvasColor="rgba(15,23,42,0.4)"
                randomColors={false}
                onStrokeEnd={handleStrokeEnd}
              />
            )}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                {strokePhase
                  ? guides.slice(0, revealedStrokes).map((s, i) => (
                      <Line key={`anim-${i}`} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke={color} strokeWidth={8} strokeLinecap="round" />
                    ))
                  : guides.map((s, i) => (
                      <React.Fragment key={`g-${i}`}>
                        <Line x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke="#7DD3FC" strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />
                        <Polygon points={arrowHead(s.from, s.to, 10)} fill="#7DD3FC" opacity={0.7} />
                      </React.Fragment>
                    ))}
                {!strokePhase &&
                  dots.map((d, i) => (
                    <React.Fragment key={i}>
                      {i === nextDot && <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#FBBF24" strokeWidth={3} opacity={0.8} />}
                      <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 12 : 9} fill={connected.has(i) ? '#34D399' : color} opacity={connected.has(i) ? 1 : 0.85} />
                    </React.Fragment>
                  ))}
              </Svg>
            </View>
            {strokePhase && (
              <View style={styles.watchOverlay}>
                <Text style={styles.watchText}>Watch the stars...</Text>
              </View>
            )}
          </View>
          {!strokePhase && <TraceMeter percent={pct} label="Star trail" color={color} textColor="#7DD3FC" />}
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#7DD3FC', marginBottom: 6 },
  outer: { flex: 1 },
  canvasWrap: {
    flex: 1,
    minHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(125,211,252,0.35)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  watchOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  watchText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C4A6E',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
});

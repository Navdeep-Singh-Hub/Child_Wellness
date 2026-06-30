/**
 * Game 2: Companion Trail — thick guided path tracing (A,B,C,D,E,G,O,R,S,W).
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

const SUBSET = ALPHABET.filter((l) => 'ABCDEGORSW'.includes(l.letter));
const HIT_RADIUS = 22;
const SUCCESS_PCT = 80;

const SHELL = {
  bg: '#3B0764',
  labelColor: '#C4B5FD',
  titleColor: '#FAF5FF',
  textOnDark: '#FAF5FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(167,139,250,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#A78BFA',
  dotDone: '#34D399',
};

export function HandHoldingTraceGame({
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

  const def = SUBSET[idx];
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
    speak(`Trace ${def.letter} — I will walk beside you on the trail!`, 0.72);
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
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        speak(`Great ${def.letter}!`, 0.72);
        if (idx < SUBSET.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setIdx((i) => i + 1);
          }, reduceMotion ? 400 : 1000);
        } else {
          setShowConfetti(true);
          speak('We walked the whole companion trail together!', 0.72);
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [dots, idx, onComplete, def.letter, reduceMotion],
  );

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="COMPANION TRAIL"
        gameTitle={`Guided ${def.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🤝"
          name="Trail Buddy"
          hint={`Follow the thick glowing path for letter ${def.letter}!`}
          accent="#A78BFA"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(167,139,250,0.35)"
          nameColor="#C4B5FD"
          hintColor="#FAF5FF"
        />
        <Text style={styles.counter}>{def.letter} · {idx + 1} / {SUBSET.length}</Text>
        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.canvasWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={14}
              canvasColor="rgba(59,7,100,0.35)"
              randomColors={false}
              onStrokeEnd={handleStrokeEnd}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                {guides.map((s, i) => (
                  <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke="rgba(167,139,250,0.35)" strokeWidth={18} strokeLinecap="round" />
                ))}
                {guides.map((s, i) => (
                  <Line key={`mid-${i}`} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke="#C4B5FD" strokeWidth={4} strokeDasharray="6 6" strokeLinecap="round" />
                ))}
                {dots.map((d, i) => (
                  <React.Fragment key={i}>
                    {i === nextDot && <Circle cx={d.x} cy={d.y} r={20} fill="none" stroke="#FBBF24" strokeWidth={3} opacity={0.8} />}
                    <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 12 : 9} fill={connected.has(i) ? '#34D399' : color} opacity={connected.has(i) ? 1 : 0.85} />
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          </View>
          <TraceMeter percent={pct} label="Trail progress" color={color} textColor="#C4B5FD" />
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#C4B5FD', marginBottom: 6 },
  outer: { flex: 1 },
  canvasWrap: {
    flex: 1,
    minHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.35)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

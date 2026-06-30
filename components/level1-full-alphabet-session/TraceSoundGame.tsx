/**
 * Game 4: Echo Valley — trace while hearing letter sound (C,F,H,J,K,N,P,Z).
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

const SOUND_LETTERS = ALPHABET.filter((l) => 'CFHJKNPZ'.includes(l.letter));
const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

const SHELL = {
  bg: '#164E63',
  labelColor: '#67E8F9',
  titleColor: '#ECFEFF',
  textOnDark: '#ECFEFF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(34,211,238,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#22D3EE',
  dotDone: '#34D399',
};

export function TraceSoundGame({
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const def = SOUND_LETTERS[idx];
  const color = letterColor(letterIndex(def.letter, ALPHABET_NAMES));
  const dots = useMemo(() => scaleDots(def.dots, dims.width, dims.height), [def, dims]);
  const guides = useMemo(() => scaleStrokes(def.strokes, dims.width, dims.height), [def, dims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    setConnected(new Set());
    setIsDrawing(false);
    canvasRef.current?.clear();
    speak(`Trace ${def.letter} and listen to the echo!`, 0.72);
  }, [idx, def.letter]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const handleStrokeStart = useCallback(() => {
    setIsDrawing(true);
    speak(def.letter, 0.55);
  }, [def.letter]);

  const nextDot = useMemo(() => {
    for (let i = 0; i < dots.length; i++) if (!connected.has(i)) return i;
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      setIsDrawing(false);
      const next = getConnectedDots(strokes, dots, HIT_RADIUS);
      setConnected(next);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
      if (pct >= SUCCESS_PCT) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        speak(`Great ${def.letter}!`, 0.72);
        if (idx < SOUND_LETTERS.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setIdx((i) => i + 1);
          }, reduceMotion ? 400 : 1200);
        } else {
          setShowConfetti(true);
          speak('The valley echoes with every letter! Beautiful!', 0.72);
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [dots, def, idx, onComplete, reduceMotion],
  );

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(34,211,238,0.08)' }]} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="ECHO VALLEY"
        gameTitle={`Sound ${def.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🔊"
          name="Echo"
          hint={isDrawing ? `${def.letter}...` : `Start tracing ${def.letter} to hear it echo!`}
          accent="#22D3EE"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(34,211,238,0.35)"
          nameColor="#67E8F9"
          hintColor="#ECFEFF"
        />
        <Text style={styles.counter}>{def.letter} · {idx + 1} / {SOUND_LETTERS.length}</Text>
        {isDrawing && (
          <View style={styles.soundBubble}>
            <Text style={styles.soundText}>"{def.letter}..."</Text>
          </View>
        )}
        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.canvasWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(22,78,99,0.4)"
              randomColors={false}
              onStrokeStart={handleStrokeStart}
              onStrokeEnd={handleStrokeEnd}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                {guides.map((s, i) => (
                  <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke="#67E8F9" strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" opacity={0.5} />
                ))}
                {dots.map((d, i) => (
                  <React.Fragment key={i}>
                    {i === nextDot && <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke="#FBBF24" strokeWidth={3} opacity={0.8} />}
                    <Circle cx={d.x} cy={d.y} r={connected.has(i) ? 12 : 9} fill={connected.has(i) ? '#34D399' : color} opacity={connected.has(i) ? 1 : 0.85} />
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          </View>
          <TraceMeter percent={pct} label="Echo trail" color={color} textColor="#67E8F9" />
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#67E8F9', marginBottom: 4 },
  soundBubble: {
    alignSelf: 'center',
    backgroundColor: 'rgba(34,211,238,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.4)',
  },
  soundText: { fontSize: 22, fontWeight: '900', color: '#ECFEFF' },
  outer: { flex: 1 },
  canvasWrap: {
    flex: 1,
    minHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

/**
 * Game 4: Wildcard Workshop — random letters, faint outline only.
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
import { coveragePctMinOverGuideSegments } from '@/components/level1-grip-session/shapeFillUtils';

const ROUND_SIZE = 12;
const SUCCESS_THRESHOLD = 1;
const HIT_RADIUS_PX = 18;
const SAMPLE_STEP_PX = 14;

const SHELL = {
  bg: '#042F2E',
  labelColor: '#5EEAD4',
  titleColor: '#F0FDFA',
  textOnDark: '#F0FDFA',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(45,212,191,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#14B8A6',
  dotDone: '#34D399',
};

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MixedLetterTracingGame({
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const subset = useMemo(() => shuffleArr(ALPHABET).slice(0, ROUND_SIZE), []);
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
    canvasRef.current?.clear();
    speak(`Trace ${def.letter}!`, 0.72);
  }, [idx, def.letter]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const cov = coveragePctMinOverGuideSegments(strokes, guides, HIT_RADIUS_PX, SAMPLE_STEP_PX);
      setPct(Math.round(cov * 100));
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      if (cov >= SUCCESS_THRESHOLD) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        speak(`Nice ${def.letter}!`, 0.72);
        if (idx < subset.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setIdx((i) => i + 1);
          }, reduceMotion ? 400 : 1000);
        } else {
          setShowConfetti(true);
          speak('Wildcard workshop complete!', 0.72);
          setTimeout(() => {
            setShowConfetti(false);
            onComplete();
          }, reduceMotion ? 500 : 1500);
        }
      }
    },
    [guides, idx, subset.length, onComplete, def.letter, reduceMotion],
  );

  return (
    <LetterGameShell
      theme={SHELL}
      gameLabel="WILDCARD WORKSHOP"
      gameTitle={`Random ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={<Text style={styles.counter}>{idx + 1}/{subset.length}</Text>}
      footer={
        <LetterMascot
          emoji="🎲"
          name="Wildcard"
          hint="Random letters — show what you have learned!"
          accent="#2DD4BF"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(45,212,191,0.35)"
          nameColor="#5EEAD4"
          hintColor="#F0FDFA"
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
                  stroke="#5EEAD4"
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.45}
                />
              ))}
            </Svg>
          </View>
        </View>
        <TraceMeter
          percent={pct}
          label="Coverage — need 100% to continue"
          color="#2DD4BF"
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
    borderColor: 'rgba(45,212,191,0.3)',
  },
});

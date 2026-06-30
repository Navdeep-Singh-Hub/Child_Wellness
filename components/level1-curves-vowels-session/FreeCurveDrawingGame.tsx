/**
 * Game 2: Swoosh Garden — free curve drawing with vine example.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { CurveGameShell } from './curves-shared/CurveGameShell';
import { GardenBackground } from './swoosh-garden/GardenBackground';
import { BreezeMascot } from './swoosh-garden/BreezeMascot';
import { GARDEN, SHELL_GARDEN, GARDEN_HINTS } from './swoosh-garden/theme';
import { hasCurvature } from './curvedPathUtils';

function exampleCurvePath(w: number): string {
  const h = 60;
  const x0 = w * 0.1;
  const x3 = w * 0.9;
  const cx1 = w * 0.35;
  const cx2 = w * 0.65;
  return `M ${x0} ${h} C ${cx1} ${h - 50}, ${cx2} ${h + 50}, ${x3} ${h}`;
}

export function FreeCurveDrawingGame({
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const spokeIntro = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak(GARDEN_HINTS.idle, 0.72);
    }
    return () => stopTTS();
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      if (done) return;
      const last = strokes[strokes.length - 1];
      if (!last) return;
      if (hasCurvature(last.path)) {
        setFeedback(GARDEN_HINTS.curvy);
        setDone(true);
        setShowConfetti(true);
        speak('What a lovely swoosh! Your curve flows like a garden vine!', 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1800);
      } else {
        setFeedback(GARDEN_HINTS.straight);
        speak('Try making it curvy, like a vine in the wind!', 0.72);
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      }
    },
    [done, onComplete, reduceMotion],
  );

  const exPath = exampleCurvePath(dims.width - 32);
  const hint = feedback ?? GARDEN_HINTS.idle;

  return (
    <View style={styles.root}>
      <GardenBackground />
      <CurveGameShell
        theme={SHELL_GARDEN}
        gameLabel="SWOOSH GARDEN"
        gameTitle="Draw a Curve"
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <BreezeMascot hint={hint} />

        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.exampleWrap}>
            <Text style={styles.exLabel}>Vine example</Text>
            <Svg width={dims.width - 32} height={80}>
              <SvgPath d={exPath} stroke={GARDEN.example} strokeWidth={5} fill="none" strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.drawHint}>Draw your swoosh below ↓</Text>
          <View style={styles.canvasWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(255,255,255,0.55)"
              randomColors
              onStrokeEnd={handleStrokeEnd}
            />
          </View>
          {feedback && (
            <View style={[styles.feedbackBox, done ? styles.feedbackGood : styles.feedbackHint]}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}
        </View>
      </CurveGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GARDEN.skyBottom },
  outer: { flex: 1 },
  exampleWrap: {
    backgroundColor: GARDEN.panel,
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GARDEN.panelBorder,
  },
  exLabel: { fontSize: 13, fontWeight: '800', color: GARDEN.accent, marginBottom: 4 },
  drawHint: { fontSize: 15, fontWeight: '700', color: GARDEN.textMuted, textAlign: 'center', marginBottom: 6 },
  canvasWrap: { flex: 1, minHeight: 200, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: GARDEN.panelBorder },
  feedbackBox: { marginTop: 12, padding: 14, borderRadius: 16, alignItems: 'center' },
  feedbackGood: { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: GARDEN.success },
  feedbackHint: { backgroundColor: GARDEN.hint, borderWidth: 2, borderColor: GARDEN.hintBorder },
  feedbackText: { fontSize: 16, fontWeight: '800', color: GARDEN.textDark },
});

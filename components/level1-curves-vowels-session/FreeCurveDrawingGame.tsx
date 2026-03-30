/**
 * Game 2: Free Curve Drawing
 * Show example curve at top. User draws any curve below. Detect curvature → success.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
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
  const canvasRef = useRef<DrawingCanvasRef>(null);

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
        setFeedback('Nice curve! 🌈');
        setDone(true);
        setShowConfetti(true);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, 1800);
      } else {
        setFeedback('Try making it curvy!');
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      }
    },
    [done, onComplete]
  );

  const exPath = exampleCurvePath(dims.width);

  return (
    <GameContainerGrip
      title="Free Curve Drawing"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🎨"
      mascotHint="Draw a curvy line below — like the example!"
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.exampleWrap}>
          <Text style={styles.exLabel}>Example:</Text>
          <Svg width={dims.width - 32} height={80}>
            <SvgPath d={exPath} stroke="#7C3AED" strokeWidth={4} fill="none" strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={styles.drawHint}>Draw your curve below ↓</Text>
        <View style={styles.canvasWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={10}
            canvasColor="rgba(255,255,255,0.6)"
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
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  exampleWrap: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  exLabel: { fontSize: 14, fontWeight: '700', color: '#7C3AED', marginBottom: 4 },
  drawHint: { fontSize: 16, fontWeight: '700', color: '#5B21B6', textAlign: 'center', marginBottom: 6 },
  canvasWrap: { flex: 1, minHeight: 200, borderRadius: 24, overflow: 'hidden' },
  feedbackBox: { marginTop: 12, padding: 14, borderRadius: 16, alignItems: 'center' },
  feedbackGood: { backgroundColor: '#D1FAE5' },
  feedbackHint: { backgroundColor: '#FEF3C7' },
  feedbackText: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
});

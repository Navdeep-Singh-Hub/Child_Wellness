/**
 * Game 3: Big → Small shapes — fill must come from strokes inside the boundary only.
 * Completes when passesStrict (≥95% inside coverage, ≤10% outside sample points).
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BoundaryDrawingCanvas, type BoundaryDrawingCanvasRef, type FillStats } from './BoundaryDrawingCanvas';
import { circleBoundary, squareBoundary, triangleBoundary } from './boundaryShapes';
import type { Boundary } from './boundaryUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const STAGES: { key: string; label: string; getBoundary: (w: number, h: number) => Boundary }[] = [
  { key: 'circle', label: 'Big Circle', getBoundary: (w, h) => circleBoundary(w, h, 0.44) },
  { key: 'square', label: 'Medium Square', getBoundary: (w, h) => squareBoundary(w, h, 0.4) },
  { key: 'triangle', label: 'Small Triangle', getBoundary: (w, h) => triangleBoundary(w, h, 0.32) },
];

function insideHintForStage(key: string): string {
  if (key === 'circle') return 'Stay inside the circle!';
  if (key === 'square') return 'Stay inside the square!';
  return 'Stay inside the triangle!';
}

export function BigSmallShapesFillGame({
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
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [stageIndex, setStageIndex] = useState(0);
  const [stats, setStats] = useState<FillStats | null>(null);
  const [showReward, setShowReward] = useState(false);
  const canvasRef = useRef<BoundaryDrawingCanvasRef>(null);
  const outsideFrames = useRef(0);
  const completingRef = useRef(false);
  const shakeX = useRef(new Animated.Value(0)).current;

  const stage = STAGES[stageIndex];
  const boundary = stage.getBoundary(dimensions.width, dimensions.height);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const runShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 45, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 45, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 40, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [shakeX]);

  const handleStatsChange = useCallback(
    (s: FillStats) => {
      setStats(s);

      if (s.outsideRatio > 0.05 && s.outsidePoints > 0) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
      }

      if (s.outsideRatio > 0.2) {
        outsideFrames.current += 1;
        if (outsideFrames.current % 4 === 0) {
          runShake();
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch (_) {}
        }
      } else {
        outsideFrames.current = 0;
      }

      if (s.passesStrict && !completingRef.current) {
        completingRef.current = true;
        setShowReward(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        setTimeout(() => {
          setShowReward(false);
          completingRef.current = false;
          if (stageIndex < STAGES.length - 1) {
            setStageIndex((i) => i + 1);
            canvasRef.current?.clear();
            setStats(null);
            outsideFrames.current = 0;
          } else {
            onComplete();
          }
        }, 1800);
      }
    },
    [stageIndex, onComplete, runShake]
  );

  useEffect(() => {
    outsideFrames.current = 0;
    completingRef.current = false;
  }, [stageIndex]);

  const fillShown = stats ? Math.min(100, Math.round(stats.fillDisplayPercent)) : 0;
  const rawFill = stats ? Math.min(100, Math.round(stats.fillInsidePercent)) : 0;
  const showOutsideMsg = stats != null && stats.outsideRatio > 0.05 && stats.outsidePoints > 0;
  const showStayHint = stats != null && stats.outsideRatio > 0.12;

  return (
    <GameContainerGrip
      title="Big → Small Shapes"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="📐"
      mascotHint={`Fill the ${stage.label.toLowerCase()} — only scribbles inside count!`}
      onBack={onBack}
    >
      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
        <View style={styles.outer} onLayout={onLayout}>
          <Text style={styles.stageLabel}>{stage.label}</Text>
          {showOutsideMsg ? (
            <Text style={styles.warnBanner}>Draw inside the shape!</Text>
          ) : null}
          {showStayHint ? (
            <Text style={styles.hintBanner}>{insideHintForStage(stage.key)}</Text>
          ) : null}
          <View style={styles.canvasWrap} key={stage.key}>
            <BoundaryDrawingCanvas
              ref={canvasRef}
              boundary={boundary}
              width={dimensions.width}
              height={dimensions.height}
              brushSize={14}
              onStatsChange={handleStatsChange}
              showBoundaryGlow={stats != null && stats.insideCoverage >= 0.75}
              showInsidePulse
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.label}>
              Fill: {fillShown}% (inside {rawFill}%){stats && stats.outsideRatio > 0.2 ? ' · penalty applied' : ''}
            </Text>
            <Text style={styles.subLabel}>
              Outside strokes: {stats ? Math.round(stats.outsideRatio * 100) : 0}% — need ≤10% to finish
            </Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${fillShown}%` }]} />
            </View>
          </View>
        </View>
      </Animated.View>
      {showReward && (
        <View style={styles.rewardOverlay} pointerEvents="none">
          <ConfettiEffect />
          <Text style={styles.rewardText}>Great job!</Text>
        </View>
      )}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  stageLabel: { fontSize: 18, fontWeight: '800', color: '#5B21B6', marginBottom: 6, textAlign: 'center' },
  warnBanner: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 4,
  },
  hintBanner: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 6,
  },
  canvasWrap: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center' },
  progressRow: { marginTop: 12, gap: 4 },
  label: { fontSize: 15, fontWeight: '700', color: '#5B21B6' },
  subLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
  rewardOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  rewardText: { fontSize: 28, fontWeight: '800', color: '#22C55E', marginTop: 20 },
});

/**
 * Game 3: Big → Small shapes — circle 50%, square 60%, triangle 70%. Transition + reward after each.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BoundaryDrawingCanvas, type BoundaryDrawingCanvasRef, type FillStats } from './BoundaryDrawingCanvas';
import { circleBoundary, squareBoundary, triangleBoundary } from './boundaryShapes';
import type { Boundary } from './boundaryUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const STAGES: { key: string; label: string; getBoundary: (w: number, h: number) => Boundary; fillMin: number }[] = [
  { key: 'circle', label: 'Big Circle', getBoundary: (w, h) => circleBoundary(w, h, 0.44), fillMin: 50 },
  { key: 'square', label: 'Medium Square', getBoundary: (w, h) => squareBoundary(w, h, 0.4), fillMin: 60 },
  { key: 'triangle', label: 'Small Triangle', getBoundary: (w, h) => triangleBoundary(w, h, 0.32), fillMin: 70 },
];

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

  const stage = STAGES[stageIndex];
  const boundary = stage.getBoundary(dimensions.width, dimensions.height);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStatsChange = useCallback((s: FillStats) => {
    setStats(s);
    if (s.fillInsidePercent >= stage.fillMin) {
      setShowReward(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      setTimeout(() => {
        setShowReward(false);
        if (stageIndex < STAGES.length - 1) {
          setStageIndex((i) => i + 1);
          canvasRef.current?.clear();
          setStats(null);
        } else {
          onComplete();
        }
      }, 1800);
    }
  }, [stageIndex, stage.fillMin, onComplete]);

  const fillPct = stats ? Math.min(100, Math.round(stats.fillInsidePercent)) : 0;

  return (
    <GameContainerGrip
      title="Big → Small Shapes"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="📐"
      mascotHint={`Fill the ${stage.label.toLowerCase()} (${stage.fillMin}% needed)`}
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <Text style={styles.stageLabel}>{stage.label}</Text>
        <View style={styles.canvasWrap} key={stage.key}>
          <BoundaryDrawingCanvas
            ref={canvasRef}
            boundary={boundary}
            width={dimensions.width}
            height={dimensions.height}
            brushSize={14}
            onStatsChange={handleStatsChange}
            showBoundaryGlow={stats != null && stats.fillInsidePercent >= stage.fillMin * 0.9}
          />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Fill: {fillPct}% (need {stage.fillMin}%)</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${fillPct}%` }]} />
          </View>
        </View>
      </View>
      {showReward && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.rewardOverlay}>
          <ConfettiEffect />
          <Text style={styles.rewardText}>Great job!</Text>
        </Animated.View>
      )}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  stageLabel: { fontSize: 18, fontWeight: '800', color: '#5B21B6', marginBottom: 8, textAlign: 'center' },
  canvasWrap: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
  rewardOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)' },
  rewardText: { fontSize: 28, fontWeight: '800', color: '#22C55E', marginTop: 20 },
});

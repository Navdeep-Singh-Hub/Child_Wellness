/**
 * Game 2: Scribble inside triangle — ≥60% fill, ≤20% outside. Gentle warning when drawing outside.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BoundaryDrawingCanvas, type BoundaryDrawingCanvasRef, type FillStats } from './BoundaryDrawingCanvas';
import { triangleBoundary } from './boundaryShapes';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const FILL_MIN = 60;
const OUTSIDE_MAX = 20;

export function ScribbleInsideTriangleGame({
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
  const [stats, setStats] = useState<FillStats | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<BoundaryDrawingCanvasRef>(null);

  const boundary = triangleBoundary(dimensions.width, dimensions.height, 0.36);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStatsChange = useCallback((s: FillStats) => {
    setStats(s);
    if (s.fillInsidePercent >= FILL_MIN && s.outsidePercent <= OUTSIDE_MAX) {
      setShowConfetti(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 1500);
    }
  }, [onComplete]);

  const fillPct = stats ? Math.min(100, Math.round(stats.fillInsidePercent)) : 0;
  const outsidePct = stats ? Math.round(stats.outsidePercent) : 0;
  const showWarning = stats != null && stats.outsidePercent > OUTSIDE_MAX && stats.outsidePercent < 50;

  return (
    <GameContainerGrip
      title="Scribble Inside Triangle"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔺"
      mascotHint="Stay inside the triangle!"
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.canvasWrap}>
          <BoundaryDrawingCanvas
            ref={canvasRef}
            boundary={boundary}
            width={dimensions.width}
            height={dimensions.height}
            brushSize={14}
            onStatsChange={handleStatsChange}
          />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.label}>Fill: {fillPct}%</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${fillPct}%` }]} />
          </View>
          <Text style={styles.outsideText}>Outside: {outsidePct}% (keep under {OUTSIDE_MAX}%)</Text>
          {showWarning && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>Try to keep your scribbles inside the shape!</Text>
            </View>
          )}
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 7 },
  outsideText: { fontSize: 14, color: '#6B7280' },
  warningBox: { marginTop: 8, padding: 10, backgroundColor: '#FEF3C7', borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B' },
  warningText: { fontSize: 14, color: '#B45309', fontWeight: '600', textAlign: 'center' },
});

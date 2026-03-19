/**
 * Game 4: Boundary control — scribble only inside; ≥70% accuracy. Red glow when outside, real-time accuracy meter.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BoundaryDrawingCanvas, type BoundaryDrawingCanvasRef, type FillStats } from './BoundaryDrawingCanvas';
import { circleBoundary } from './boundaryShapes';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const ACCURACY_MIN = 70;

export function BoundaryControlGame({
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

  const boundary = circleBoundary(dimensions.width, dimensions.height, 0.4);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStatsChange = useCallback((s: FillStats) => {
    setStats(s);
    if (s.accuracy >= ACCURACY_MIN && (s.totalStrokeArea > 0)) {
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

  const accuracy = stats ? Math.round(stats.accuracy) : 0;
  const isOutside = stats != null && stats.outsidePercent > 30;

  return (
    <GameContainerGrip
      title="Stay Inside!"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="✋"
      mascotHint="Stay inside the boundary!"
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={[styles.canvasWrap, isOutside && styles.canvasWrapOutside]}>
          <BoundaryDrawingCanvas
            ref={canvasRef}
            boundary={boundary}
            width={dimensions.width}
            height={dimensions.height}
            brushSize={14}
            onStatsChange={handleStatsChange}
            showBoundaryGlow={isOutside || (stats != null && stats.accuracy >= 50)}
            boundaryGlowColor={isOutside ? '#EF4444' : '#22C55E'}
          />
        </View>
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>Accuracy: {accuracy}%</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(100, accuracy)}%`, backgroundColor: accuracy >= ACCURACY_MIN ? '#22C55E' : accuracy >= 40 ? '#F59E0B' : '#EF4444' }]} />
          </View>
          <Text style={styles.hint}>Need {ACCURACY_MIN}% inside the shape</Text>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  canvasWrapOutside: { backgroundColor: 'rgba(254,226,226,0.4)', borderWidth: 3, borderColor: 'rgba(239,68,68,0.5)' },
  meterRow: { marginTop: 12, gap: 6 },
  meterLabel: { fontSize: 18, fontWeight: '800', color: '#5B21B6' },
  barBg: { height: 16, backgroundColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 8 },
  hint: { fontSize: 14, color: '#6B7280' },
});

/**
 * Game 2: Drag down lines — start top, end bottom, stroke mostly vertical and downward.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { isMostlyDownward, isPathMostlyVertical } from './verticalTracingUtils';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const MAX_DEVIATION = 45;
const LANE_COUNT = 2;

export function DragDownLinesGame({
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
  const [dimensions, setDimensions] = useState({ width: 300, height: 320 });
  const [lastSuccess, setLastSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = React.useRef<DrawingCanvasRef>(null);

  const margin = 60;
  const topY = margin + 30;
  const bottomY = dimensions.height - margin - 30;
  const spacing = (dimensions.width - margin * 2) / (LANE_COUNT + 1);
  const startPoints = Array.from({ length: LANE_COUNT }, (_, i) => margin + spacing * (i + 1));
  const endPoints = startPoints.map((x) => ({ x, topY, bottomY }));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const last = strokes[strokes.length - 1];
      if (!last) return;
      const downward = isMostlyDownward(last.path);
      const vertical = isPathMostlyVertical(last.path, MAX_DEVIATION);
      const ok = downward && vertical;
      setLastSuccess(ok);
      try {
        Haptics.impactAsync(ok ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
      if (ok) {
        setShowConfetti(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, 1400);
      }
    },
    [onComplete]
  );

  return (
    <GameContainerGrip
      title="Drag Down"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="↓"
      mascotHint="Drag from top to bottom!"
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={[styles.canvasWrap, lastSuccess && styles.canvasWrapSuccess]}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={14}
            canvasColor="rgba(255,255,255,0.5)"
            randomColors={false}
            onStrokeEnd={handleStrokeEnd}
          />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={dimensions.width} height={dimensions.height}>
              {startPoints.map((x, i) => (
                <React.Fragment key={i}>
                  <Circle cx={x} cy={topY} r={16} fill="#5B21B6" opacity={0.9} />
                  <Circle cx={x} cy={bottomY} r={16} fill="#5B21B6" opacity={0.9} />
                  <Line x1={x} y1={topY} x2={x} y2={bottomY} stroke="#C4B5FD" strokeWidth={3} strokeDasharray="8 6" />
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </View>
        <Text style={styles.hint}>Start at the top dot, drag to the bottom dot</Text>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  canvasWrap: { flex: 1, minHeight: 280, borderRadius: 24, overflow: 'hidden' },
  canvasWrapSuccess: { borderWidth: 4, borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)' },
  hint: { fontSize: 15, color: '#5B21B6', marginTop: 12, textAlign: 'center', fontWeight: '600' },
});

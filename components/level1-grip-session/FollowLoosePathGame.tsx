/**
 * Game 4: Follow Loose Path — trace along a wide curved path; 80% progress → success.
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { GameContainerGrip } from './GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const PATH_WIDTH = 70;
const PROGRESS_THRESHOLD = 0.8;
const TRACE_TOLERANCE = PATH_WIDTH / 2;
const START_T_THRESHOLD = 0.12;
const MAX_PROGRESS_JUMP = 0.18;

function samplePath(numPoints: number, width: number, height: number): { x: number; y: number; t: number }[] {
  const pts: { x: number; y: number; t: number }[] = [];
  const margin = 36;
  const W = width - margin * 2;
  const H = height - margin * 2;
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = margin + W * (0.05 + 0.9 * t);
    const y = margin + H * (0.2 + 0.6 * Math.sin(t * Math.PI));
    pts.push({ x, y, t });
  }
  return pts;
}

function getPathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function closestProgress(finger: { x: number; y: number }, points: { x: number; y: number; t: number }[], threshold: number): number | null {
  let bestT = 0;
  let bestDist = Infinity;
  for (const p of points) {
    const d = distance(finger, p);
    if (d < bestDist) {
      bestDist = d;
      bestT = p.t;
    }
  }
  return bestDist <= threshold ? bestT : null;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function FollowLoosePathGame({
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
  const pathPoints = useMemo(
    () => samplePath(80, dimensions.width, dimensions.height),
    [dimensions.width, dimensions.height]
  );
  const pathD = useMemo(() => getPathD(pathPoints), [pathPoints]);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pathError, setPathError] = useState('');
  const progressRef = React.useRef(0);
  const hasStartedTracingRef = React.useRef(false);
  const isCompletingRef = React.useRef(false);
  const dashOffset = useSharedValue(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  React.useEffect(() => {
    dashOffset.value = withRepeat(withTiming(40, { duration: 1500 }), -1, false);
  }, []);

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      setPathError('');
      const startT = closestProgress({ x: e.x, y: e.y }, pathPoints, TRACE_TOLERANCE);
      if (startT === null || startT > START_T_THRESHOLD) {
        hasStartedTracingRef.current = false;
        progressRef.current = 0;
        setProgress(0);
        setPathError('Start tracing from the beginning of the path.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (_) {}
        return;
      }
      hasStartedTracingRef.current = true;
    })
    .onUpdate((e) => {
      if (isCompletingRef.current) return;
      if (!hasStartedTracingRef.current) return;
      const t = closestProgress({ x: e.x, y: e.y }, pathPoints, TRACE_TOLERANCE);
      if (t === null && progressRef.current > 0) {
        progressRef.current = 0;
        setProgress(0);
        setPathError('You moved outside the path. Stay inside the guide and try again.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (_) {}
        return;
      }
      if (t !== null && t - progressRef.current > MAX_PROGRESS_JUMP) {
        progressRef.current = 0;
        setProgress(0);
        hasStartedTracingRef.current = false;
        setPathError('Follow the path continuously. Jumping ahead is not allowed.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (_) {}
        return;
      }
      if (t !== null && t > progressRef.current) {
        progressRef.current = t;
        setProgress(t);
        if (t >= PROGRESS_THRESHOLD) {
          isCompletingRef.current = true;
          setShowConfetti(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_) {}
          setTimeout(() => {
            setShowConfetti(false);
            isCompletingRef.current = false;
            onComplete();
          }, 1500);
        }
      }
    })
    .onEnd(() => {
      hasStartedTracingRef.current = false;
    });

  return (
    <GameContainerGrip
      title="Follow the Path"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="✨"
      mascotHint="Trace along the path with your finger!"
      onBack={onBack}
    >
      <View style={styles.outer}>
        <View style={styles.svgWrap} onLayout={onLayout}>
          <Svg
            style={StyleSheet.absoluteFill}
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          >
            <Path
              d={pathD}
              stroke="rgba(91,33,182,0.25)"
              strokeWidth={PATH_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <AnimatedPath
              d={pathD}
              stroke="#5B21B6"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="20 12"
              animatedProps={animatedPathProps}
            />
          </Svg>
          <GestureDetector gesture={panGesture}>
            <View style={StyleSheet.absoluteFill} />
          </GestureDetector>
        </View>
        <View style={styles.progressRow}>
          {!!pathError && <Text style={styles.errorText}>{pathError}</Text>}
          <Text style={styles.progressLabel}>Progress: {Math.round(progress * 100)}%</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(100, progress * 100)}%` }]} />
          </View>
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  svgWrap: { flex: 1, minHeight: 320, overflow: 'hidden' },
  progressRow: { marginTop: 16, gap: 8 },
  errorText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  progressLabel: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  barBg: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#5B21B6', borderRadius: 7 },
});

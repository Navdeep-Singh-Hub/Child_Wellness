/**
 * Game 4: Follow Loose Path — Sunset Trail
 * Warm sunset river theme, glowing golden path, Ripple mascot,
 * friendly trail guidance with TTS.
 */
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { SunsetBackground } from './follow-path/SunsetBackground';
import { RippleMascot } from './follow-path/RippleMascot';
import { TrailMeter } from './follow-path/TrailMeter';
import { GAME4_CONFIG, SUNSET, TRAIL_HINTS } from './follow-path/theme';

const TOUCH_Y_OFFSET = Platform.OS === 'android' ? 14 : 0;
const PATH_WIDTH = GAME4_CONFIG.pathWidth;
const PROGRESS_THRESHOLD = GAME4_CONFIG.progressThreshold;
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
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  return d;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function closestProgress(
  finger: { x: number; y: number },
  points: { x: number; y: number; t: number }[],
  threshold: number,
): number | null {
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
    [dimensions.width, dimensions.height],
  );
  const pathD = useMemo(() => getPathD(pathPoints), [pathPoints]);
  const [progress, setProgress] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [pathError, setPathError] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);

  const progressRef = useRef(0);
  const hasStartedTracingRef = useRef(false);
  const isCompletingRef = useRef(false);
  const spokeIntro = useRef(false);
  const halfwaySpokeRef = useRef(false);
  const dashOffset = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (!reduceMotion) {
      dashOffset.value = withRepeat(withTiming(30, { duration: 1400 }), -1, false);
    }
  }, [dashOffset, reduceMotion]);

  useEffect(() => {
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Follow the golden river trail from start to finish!', 0.72);
    }
  }, []);

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const mascotHint = pathError
    ? pathError
    : progress > 0
      ? TRAIL_HINTS.tracing(Math.round(progress * 100))
      : TRAIL_HINTS.idle;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      setPathError('');
      const startT = closestProgress({ x: e.x, y: e.y - TOUCH_Y_OFFSET }, pathPoints, TRACE_TOLERANCE);
      if (startT === null || startT > START_T_THRESHOLD) {
        hasStartedTracingRef.current = false;
        progressRef.current = 0;
        setProgress(0);
        setPathError(TRAIL_HINTS.errorStart);
        speak(TRAIL_HINTS.errorStart, 0.75);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (_) {}
        return;
      }
      hasStartedTracingRef.current = true;
      try {
        Haptics.selectionAsync();
      } catch (_) {}
    })
    .onUpdate((e) => {
      if (isCompletingRef.current) return;
      if (!hasStartedTracingRef.current) return;
      const t = closestProgress({ x: e.x, y: e.y - TOUCH_Y_OFFSET }, pathPoints, TRACE_TOLERANCE);
      if (t === null && progressRef.current > 0) {
        progressRef.current = 0;
        setProgress(0);
        setPathError(TRAIL_HINTS.errorOff);
        speak(TRAIL_HINTS.errorOff, 0.75);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (_) {}
        return;
      }
      if (t !== null && t - progressRef.current > MAX_PROGRESS_JUMP) {
        progressRef.current = 0;
        setProgress(0);
        hasStartedTracingRef.current = false;
        setPathError(TRAIL_HINTS.errorJump);
        speak(TRAIL_HINTS.errorJump, 0.75);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (_) {}
        return;
      }
        if (t !== null && t > progressRef.current) {
        progressRef.current = t;
        setProgress(t);
        if (t >= 0.5 && !halfwaySpokeRef.current) {
          halfwaySpokeRef.current = true;
          speak('Halfway down the trail!', 0.75);
        }
        if (t >= PROGRESS_THRESHOLD) {
          isCompletingRef.current = true;
          setShowCelebrate(true);
          speak(TRAIL_HINTS.success, 0.72);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_) {}
          setTimeout(() => {
            setShowCelebrate(false);
            isCompletingRef.current = false;
            onComplete();
          }, 1800);
        }
      }
    })
    .onEnd(() => {
      hasStartedTracingRef.current = false;
    });

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <SunsetBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>🌅</Text>
            <Text style={styles.celebrateTitle}>Trail Complete!</Text>
            <Text style={styles.celebrateSub}>{TRAIL_HINTS.success}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SunsetBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={22} color={SUNSET.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>SUNSET TRAIL</Text>
            <Text style={styles.gameTitle}>River Run</Text>
          </View>
        </View>

        <View style={styles.dotsRow}>
          {stepDots.map((n) => (
            <View
              key={n}
              style={[styles.dot, n === currentStep && styles.dotActive, n < currentStep && styles.dotDone]}
            />
          ))}
        </View>

        <RippleMascot hint={mascotHint} hasError={!!pathError} />
        <TrailMeter progress={progress} />

        <View style={styles.trailFrame} onLayout={onLayout}>
          <Svg
            style={StyleSheet.absoluteFill}
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          >
            <Path
              d={pathD}
              stroke={SUNSET.pathOuter}
              strokeWidth={PATH_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d={pathD}
              stroke={SUNSET.waterGlow}
              strokeWidth={PATH_WIDTH * 0.55}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <AnimatedPath
              d={pathD}
              stroke={SUNSET.pathCore}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="18 10"
              animatedProps={animatedPathProps}
            />
          </Svg>
          <GestureDetector gesture={panGesture}>
            <View style={StyleSheet.absoluteFill} />
          </GestureDetector>
          {progress === 0 && !pathError ? (
            <View style={styles.startMarker} pointerEvents="none">
              <Text style={styles.startText}>START 🌅</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SUNSET.skyBottom },
  safe: { flex: 1, paddingHorizontal: 18 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SUNSET.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SUNSET.panelBorder,
  },
  headerCenter: { flex: 1 },
  gameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: SUNSET.accent,
    letterSpacing: 1.2,
  },
  gameTitle: { fontSize: 22, fontWeight: '900', color: SUNSET.textDark },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(124,45,18,0.15)' },
  dotActive: { width: 22, backgroundColor: SUNSET.accent },
  dotDone: { backgroundColor: SUNSET.success },

  trailFrame: {
    flex: 1,
    minHeight: 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 2,
    borderColor: SUNSET.panelBorder,
    marginBottom: 12,
  },
  startMarker: {
    position: 'absolute',
    left: 24,
    top: '28%',
    backgroundColor: SUNSET.panel,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: SUNSET.pathCore,
  },
  startText: { fontSize: 13, fontWeight: '800', color: SUNSET.textDark },
  pressed: { opacity: 0.85 },

  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253,230,138,0.88)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: SUNSET.panel,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: SUNSET.pathCore,
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 26, fontWeight: '900', color: SUNSET.textDark, marginBottom: 6 },
  celebrateSub: { fontSize: 15, fontWeight: '600', color: SUNSET.waterDeep, textAlign: 'center' },
});

/**
 * Game 2: Color Scribble Fill — Garden Bloom Studio
 * Sunny meadow theme, butterfly + sunflower shapes, live bloom meter,
 * Flutter mascot, per-shape celebrations.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import {
  BUTTERFLY_POLYGON,
  FLOWER_POLYGON,
  getButterflyPath,
  getFlowerPath,
  shapeToCanvas,
} from './shapes';
import { MeadowBackground } from './color-scribble-fill/MeadowBackground';
import { FlutterMascot } from './color-scribble-fill/FlutterMascot';
import { BloomMeter } from './color-scribble-fill/BloomMeter';
import { computeFillRatio, pathsToStrokes } from './color-scribble-fill/fillUtils';
import {
  BLOOM_SHAPES,
  GAME2_CONFIG,
  hintForRatio,
  MEADOW,
} from './color-scribble-fill/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SHAPE_DATA = [
  { ...BLOOM_SHAPES[0], polygon: BUTTERFLY_POLYGON, getPath: getButterflyPath },
  { ...BLOOM_SHAPES[1], polygon: FLOWER_POLYGON, getPath: getFlowerPath },
] as const;

export function ColorScribbleFillGame({
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
  const [shapeIndex, setShapeIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 280, height: 280 });
  const [fillRatio, setFillRatio] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebrateMsg, setCelebrateMsg] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const isAdvancingRef = useRef(false);
  const lastMilestoneRef = useRef(0);
  const spokeIntro = useRef(false);

  const bloom = SHAPE_DATA[shapeIndex] ?? SHAPE_DATA[0];
  const shapePolygonCanvas = useMemo(
    () => shapeToCanvas(bloom.polygon, dimensions.width, dimensions.height),
    [bloom.polygon, dimensions.width, dimensions.height],
  );
  const outlinePath = bloom.getPath(dimensions.width, dimensions.height);

  const dashOffset = useSharedValue(0);
  const outlinePulse = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!reduceMotion) {
      dashOffset.value = withRepeat(withTiming(24, { duration: 1200, easing: Easing.linear }), -1, false);
    }
    return () => stopTTS();
  }, [dashOffset, reduceMotion]);

  useEffect(() => {
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Welcome to the garden! Scribble inside each shape to make it bloom.', 0.72);
    }
  }, []);

  useEffect(() => {
    lastMilestoneRef.current = 0;
    canvasRef.current?.clear();
    setFillRatio(0);
    speak(bloom.intro, 0.72);
  }, [shapeIndex, bloom.intro]);

  useEffect(() => {
    if (fillRatio >= GAME2_CONFIG.fillThreshold) {
      outlinePulse.value = withRepeat(
        withTiming(1.08, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      outlinePulse.value = withTiming(1);
    }
  }, [fillRatio, outlinePulse]);

  const updateFill = useCallback(
    (strokes: Stroke[]) => {
      if (isAdvancingRef.current) return;
      const ratio = computeFillRatio(strokes, shapePolygonCanvas, GAME2_CONFIG.brushSize);
      setFillRatio(ratio);

      const milestone = ratio >= 0.5 ? 50 : ratio >= 0.3 ? 30 : 0;
      if (milestone > lastMilestoneRef.current) {
        lastMilestoneRef.current = milestone;
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
        if (milestone === 50) speak('Halfway bloomed! Keep scribbling!', 0.75);
      }

      if (ratio >= GAME2_CONFIG.fillThreshold && !isAdvancingRef.current) {
        isAdvancingRef.current = true;
        setCelebrateMsg(bloom.success);
        setShowCelebrate(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        speak(bloom.success, 0.72);

        setTimeout(() => {
          setShowCelebrate(false);
          if (shapeIndex < SHAPE_DATA.length - 1) {
            setShapeIndex((i) => i + 1);
            isAdvancingRef.current = false;
          } else {
            onComplete();
            isAdvancingRef.current = false;
          }
        }, 1800);
      }
    },
    [shapePolygonCanvas, shapeIndex, bloom.success, onComplete],
  );

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => updateFill(strokes),
    [updateFill],
  );

  const handleTracingChange = useCallback(
    (paths: { path: string }[]) => {
      updateFill(pathsToStrokes(paths, GAME2_CONFIG.brushSize));
    },
    [updateFill],
  );

  const handleStrokeStart = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch (_) {}
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setFillRatio(0);
    lastMilestoneRef.current = 0;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
    speak('Let\'s try again! Scribble inside the shape.', 0.75);
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const animatedOutlineProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
    strokeWidth: 4 * outlinePulse.value,
  }));

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const shapeProgress = `${shapeIndex + 1} / ${SHAPE_DATA.length}`;

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <MeadowBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>{bloom.emoji}</Text>
            <Text style={styles.celebrateTitle}>It Bloomed!</Text>
            <Text style={styles.celebrateSub}>{celebrateMsg}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MeadowBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={MEADOW.grassDeep} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>GARDEN BLOOM STUDIO</Text>
            <Text style={styles.gameTitle}>{bloom.label}</Text>
          </View>
          <View style={styles.shapeBadge}>
            <Text style={styles.shapeBadgeText}>{shapeProgress}</Text>
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

        <FlutterMascot
          hint={hintForRatio(fillRatio)}
          emoji={bloom.emoji}
          isCelebrating={fillRatio >= GAME2_CONFIG.fillThreshold}
        />

        <BloomMeter ratio={fillRatio} shapeEmoji={bloom.emoji} />

        <View style={styles.canvasFrame}>
          <View style={styles.canvasInner} onLayout={handleLayout}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={GAME2_CONFIG.brushSize}
              canvasColor={MEADOW.paper}
              randomColors
              onStrokeStart={handleStrokeStart}
              onStrokeEnd={handleStrokeEnd}
              onTracingChange={handleTracingChange}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg
                style={StyleSheet.absoluteFill}
                width={dimensions.width}
                height={dimensions.height}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              >
                <Path
                  d={outlinePath}
                  fill={bloom.fillHint}
                  stroke="none"
                />
                <AnimatedPath
                  d={outlinePath}
                  stroke={bloom.stroke}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="14 8"
                  animatedProps={animatedOutlineProps}
                />
              </Svg>
            </View>
            {fillRatio < 0.05 ? (
              <View style={styles.canvasHint} pointerEvents="none">
                <Text style={styles.canvasHintText}>Scribble inside {bloom.emoji}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
          accessibilityLabel="Clear drawing"
        >
          <Ionicons name="leaf-outline" size={20} color={MEADOW.grassDeep} />
          <Text style={styles.clearText}>Start Fresh</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MEADOW.skyBottom },
  safe: { flex: 1, paddingHorizontal: 18 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MEADOW.clearBorder,
  },
  headerCenter: { flex: 1 },
  gameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: MEADOW.coral,
    letterSpacing: 1.2,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: MEADOW.grassDeep,
  },
  shapeBadge: {
    backgroundColor: MEADOW.sunflowerLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: MEADOW.sunflower,
  },
  shapeBadgeText: { fontSize: 13, fontWeight: '800', color: MEADOW.grassDeep },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(20,83,45,0.15)' },
  dotActive: { width: 22, backgroundColor: MEADOW.coral },
  dotDone: { backgroundColor: MEADOW.grassDark },

  canvasFrame: { flex: 1, minHeight: 240, marginBottom: 12 },
  canvasInner: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: MEADOW.paperBorder,
    backgroundColor: MEADOW.paper,
    shadowColor: MEADOW.grassDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  canvasHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  canvasHintText: {
    fontSize: 16,
    fontWeight: '700',
    color: MEADOW.textMuted,
  },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: MEADOW.clearBg,
    borderWidth: 1,
    borderColor: MEADOW.clearBorder,
    marginBottom: 8,
  },
  clearText: { fontSize: 16, fontWeight: '700', color: MEADOW.grassDeep },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236,253,245,0.85)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: MEADOW.sunflowerLight,
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 26, fontWeight: '900', color: MEADOW.grassDeep, marginBottom: 6 },
  celebrateSub: { fontSize: 15, fontWeight: '600', color: MEADOW.coral, textAlign: 'center' },
});

/**
 * Game 2: Butterfly Garden Paint — fill butterfly & flower shapes with colorful scribbles.
 * >60% fill triggers bloom celebration and advances to next shape.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { GRIP_SESSION, GARDEN_FILL_THEME as T } from './gripSessionTheme';
import { speakGripHint, stopGripSpeech } from './gripSessionSpeech';
import { GardenFillBackground } from './GardenFillBackground';
import {
  BUTTERFLY_POLYGON,
  FLOWER_POLYGON,
  getButterflyPath,
  getFlowerPath,
  shapeToCanvas,
} from './shapes';
import { pathToPoints, pointInPolygon } from './shapeFillUtils';

const FILL_THRESHOLD = 0.6;
const BRUSH_SIZE = 14;

const SHAPES = [
  {
    key: 'butterfly',
    polygon: BUTTERFLY_POLYGON,
    getPath: getButterflyPath,
    theme: T.shapes[0],
  },
  {
    key: 'flower',
    polygon: FLOWER_POLYGON,
    getPath: getFlowerPath,
    theme: T.shapes[1],
  },
] as const;

function computeFillRatio(
  strokes: Stroke[],
  shapePolygonCanvas: { x: number; y: number }[],
  brushSize: number
): number {
  if (shapePolygonCanvas.length < 3) return 0;

  const radius = brushSize;
  const cellSize = Math.max(4, Math.floor(brushSize * 0.6));
  const filledCells = new Set<string>();

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of shapePolygonCanvas) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const markBrushCoverage = (x: number, y: number) => {
    const gxMin = Math.floor((x - radius) / cellSize);
    const gxMax = Math.floor((x + radius) / cellSize);
    const gyMin = Math.floor((y - radius) / cellSize);
    const gyMax = Math.floor((y + radius) / cellSize);
    for (let gx = gxMin; gx <= gxMax; gx++) {
      for (let gy = gyMin; gy <= gyMax; gy++) {
        const cx = gx * cellSize + cellSize / 2;
        const cy = gy * cellSize + cellSize / 2;
        const dx = cx - x;
        const dy = cy - y;
        if (dx * dx + dy * dy > radius * radius) continue;
        if (!pointInPolygon({ x: cx, y: cy }, shapePolygonCanvas)) continue;
        filledCells.add(`${gx},${gy}`);
      }
    }
  };

  for (const stroke of strokes) {
    const points = pathToPoints(stroke.path);
    if (points.length === 0) continue;
    markBrushCoverage(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(dist / (cellSize * 0.5)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        markBrushCoverage(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
      }
    }
  }

  let shapeCellCount = 0;
  const gxMin = Math.floor(minX / cellSize);
  const gxMax = Math.floor(maxX / cellSize);
  const gyMin = Math.floor(minY / cellSize);
  const gyMax = Math.floor(maxY / cellSize);
  for (let gx = gxMin; gx <= gxMax; gx++) {
    for (let gy = gyMin; gy <= gyMax; gy++) {
      const cx = gx * cellSize + cellSize / 2;
      const cy = gy * cellSize + cellSize / 2;
      if (pointInPolygon({ x: cx, y: cy }, shapePolygonCanvas)) shapeCellCount += 1;
    }
  }

  if (shapeCellCount === 0) return 0;
  return Math.min(1, filledCells.size / shapeCellCount);
}

function promptForFill(ratio: number): string {
  if (ratio < 0.15) return T.prompts[0];
  if (ratio < 0.45) return T.prompts[1];
  if (ratio < FILL_THRESHOLD) return T.prompts[2];
  return T.prompts[3];
}

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
  const [prompt, setPrompt] = useState(T.shapes[0].intro);
  const [roundCelebration, setRoundCelebration] = useState<string | null>(null);
  const [finalCelebration, setFinalCelebration] = useState(false);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const isAdvancingRef = useRef(false);
  const bubbleScale = useSharedValue(0.92);
  const bloomPulse = useSharedValue(1);
  const outlineGlow = useSharedValue(0);

  const shapeDef = SHAPES[shapeIndex] ?? SHAPES[0];
  const shapeTheme = shapeDef.theme;
  const shapePolygonCanvas = shapeToCanvas(shapeDef.polygon, dimensions.width, dimensions.height);
  const outlinePath = shapeDef.getPath(dimensions.width, dimensions.height);
  const fillPct = Math.round(fillRatio * 100);
  const isNearBloom = fillRatio >= FILL_THRESHOLD * 0.75;
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakGripHint(shapeTheme.intro);
    bubbleScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    return () => stopGripSpeech();
  }, [shapeIndex, shapeTheme.intro, bubbleScale]);

  useEffect(() => {
    if (isNearBloom) {
      outlineGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      bloomPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      outlineGlow.value = withTiming(0, { duration: 300 });
      bloomPulse.value = withTiming(1, { duration: 300 });
    }
  }, [isNearBloom, outlineGlow, bloomPulse]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStrokeStart = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* ignore */
    }
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      if (isAdvancingRef.current) return;
      const ratio = computeFillRatio(strokes, shapePolygonCanvas, BRUSH_SIZE);
      setFillRatio(ratio);
      setPrompt(promptForFill(ratio));

      if (ratio >= 0.3 && ratio < FILL_THRESHOLD) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
          /* ignore */
        }
      }

      if (ratio >= FILL_THRESHOLD) {
        isAdvancingRef.current = true;
        speakGripHint(shapeTheme.done);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }

        if (shapeIndex < SHAPES.length - 1) {
          setRoundCelebration(shapeTheme.done);
          setTimeout(() => {
            setRoundCelebration(null);
            setShapeIndex((i) => i + 1);
            canvasRef.current?.clear();
            setFillRatio(0);
            setPrompt(T.shapes[shapeIndex + 1].intro);
            isAdvancingRef.current = false;
          }, 1800);
        } else {
          setFinalCelebration(true);
          setTimeout(() => onComplete(), 2400);
        }
      }
    },
    [shapePolygonCanvas, shapeIndex, shapeTheme.done, onComplete]
  );

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const meterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bloomPulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + outlineGlow.value * 0.55,
  }));

  if (finalCelebration) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Garden Bloomed!"
          subtitle="You painted the whole garden!"
          badgeEmoji="🌸"
          variant="mint"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...T.gradient]}
        locations={[...T.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <GardenFillBackground />

      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <View style={styles.shapePill}>
            <Text style={styles.shapePillEmoji}>{shapeTheme.emoji}</Text>
            <Text style={styles.shapePillText}>
              {shapeIndex + 1}/{SHAPES.length}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        <Text style={styles.subtitle}>Paint the {shapeTheme.label}</Text>

        <Animated.View style={[styles.speechBubble, bubbleStyle]}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Text style={styles.prompt}>{prompt}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.playArea}>
        <View style={[styles.coloringPage, GRIP_SESSION.shadow.card]}>
          <View style={styles.coloringInner} onLayout={handleLayout}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={BRUSH_SIZE}
              canvasColor="transparent"
              randomColors
              onStrokeStart={handleStrokeStart}
              onStrokeEnd={handleStrokeEnd}
            />
            <Animated.View style={[StyleSheet.absoluteFill, styles.glowRing, glowStyle]} pointerEvents="none" />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg
                style={StyleSheet.absoluteFill}
                width={dimensions.width}
                height={dimensions.height}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              >
                <Path
                  d={outlinePath}
                  stroke={shapeTheme.outlineColor}
                  strokeWidth={isNearBloom ? 5 : 4}
                  fill={shapeTheme.fillHint}
                  strokeDasharray={fillRatio < 0.1 ? '10 8' : undefined}
                />
              </Svg>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.bloomMeter, meterStyle]}>
          <View style={styles.bloomHeader}>
            <Text style={styles.bloomEmoji}>🌱</Text>
            <Text style={styles.bloomLabel}>Bloom Meter</Text>
            <Text style={[styles.bloomPct, isNearBloom && styles.bloomPctReady]}>{fillPct}%</Text>
          </View>
          <View style={styles.bloomTrack}>
            <LinearGradient
              colors={isNearBloom ? [...T.bloomGradient] : ['#A7F3D0', '#6EE7B7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.bloomFill, { width: `${Math.min(100, fillPct)}%` }]}
            />
            <View style={[styles.bloomThreshold, { left: `${FILL_THRESHOLD * 100}%` }]} />
          </View>
          <Text style={styles.bloomHint}>
            {fillPct < FILL_THRESHOLD * 100
              ? `Fill ${Math.round(FILL_THRESHOLD * 100)}% to make it bloom!`
              : '✨ Blooming beautifully!'}
          </Text>
        </Animated.View>

        <View style={styles.shapeTabs}>
          {SHAPES.map((s, i) => {
            const active = i === shapeIndex;
            const done = i < shapeIndex;
            return (
              <View
                key={s.key}
                style={[
                  styles.shapeTab,
                  active && styles.shapeTabActive,
                  done && styles.shapeTabDone,
                ]}
              >
                <Text style={styles.shapeTabEmoji}>{s.theme.emoji}</Text>
                <Text style={[styles.shapeTabLabel, active && styles.shapeTabLabelActive]}>
                  {s.theme.label}
                </Text>
                {done && <Text style={styles.shapeTabCheck}>✓</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {roundCelebration && (
        <View style={styles.roundOverlay}>
          <ConfettiEffect />
          <View style={styles.roundCard}>
            <Text style={styles.roundEmoji}>{shapeTheme.emoji}</Text>
            <Text style={styles.roundTitle}>{roundCelebration}</Text>
            <Text style={styles.roundSub}>Next up: {SHAPES[shapeIndex + 1]?.theme.label ?? ''}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'web' ? 12 : 48,
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    zIndex: 10,
    ...GRIP_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.inkMuted, letterSpacing: 0.3 },
  shapePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.accentSoft,
  },
  shapePillEmoji: { fontSize: 14 },
  shapePillText: { fontSize: 14, fontWeight: '900', color: T.accent },
  title: { fontSize: 28, fontWeight: '900', color: T.ink, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 2, marginBottom: 12 },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(134, 239, 172, 0.6)',
    ...GRIP_SESSION.shadow.soft,
  },
  mascot: { fontSize: 36 },
  bubbleBody: { flex: 1 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 15, fontWeight: '700', color: T.ink, lineHeight: 22, marginTop: 2 },
  playArea: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, zIndex: 5 },
  coloringPage: {
    flex: 1,
    minHeight: 260,
    borderRadius: GRIP_SESSION.radius.card,
    backgroundColor: T.canvasBorder,
    padding: 4,
  },
  coloringInner: {
    flex: 1,
    borderRadius: GRIP_SESSION.radius.card - 2,
    backgroundColor: T.canvas,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  glowRing: {
    borderRadius: GRIP_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.outlineActive,
  },
  bloomMeter: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(134, 239, 172, 0.5)',
    ...GRIP_SESSION.shadow.soft,
  },
  bloomHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bloomEmoji: { fontSize: 18 },
  bloomLabel: { flex: 1, fontSize: 14, fontWeight: '800', color: T.ink },
  bloomPct: { fontSize: 18, fontWeight: '900', color: T.accent },
  bloomPctReady: { color: '#047857' },
  bloomTrack: {
    height: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  bloomFill: { height: '100%', borderRadius: 8 },
  bloomThreshold: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: 'rgba(4, 120, 87, 0.45)',
  },
  bloomHint: { fontSize: 12, fontWeight: '600', color: T.inkMuted, marginTop: 8, textAlign: 'center' },
  shapeTabs: { flexDirection: 'row', gap: 10, marginTop: 12 },
  shapeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  shapeTabActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: T.accentSoft,
    ...GRIP_SESSION.shadow.soft,
  },
  shapeTabDone: { backgroundColor: 'rgba(209, 250, 229, 0.8)' },
  shapeTabEmoji: { fontSize: 22 },
  shapeTabLabel: { fontSize: 11, fontWeight: '700', color: T.inkMuted, marginTop: 2 },
  shapeTabLabelActive: { color: T.accentDeep },
  shapeTabCheck: { position: 'absolute', top: 4, right: 8, fontSize: 12, color: T.accent, fontWeight: '900' },
  roundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 78, 59, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  roundCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: T.accentSoft,
    ...GRIP_SESSION.shadow.card,
  },
  roundEmoji: { fontSize: 56, marginBottom: 8 },
  roundTitle: { fontSize: 20, fontWeight: '900', color: T.ink, textAlign: 'center' },
  roundSub: { fontSize: 14, fontWeight: '600', color: T.inkMuted, marginTop: 6, textAlign: 'center' },
});

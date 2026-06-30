/**
 * Game 2: Pyramid Peak — scribble inside triangle (≥60% fill, ≤20% outside).
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BoundaryDrawingCanvas, type BoundaryDrawingCanvasRef, type FillStats } from './BoundaryDrawingCanvas';
import { triangleBoundary } from './boundaryShapes';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { BoundaryGameShell } from './controlled-shared/BoundaryGameShell';
import { PrecisionMeter } from './controlled-shared/PrecisionMeter';

const FILL_MIN = 60;
const OUTSIDE_MAX = 20;

const THEME = {
  bg: '#78350F',
  labelColor: '#FCD34D',
  titleColor: '#FFFBEB',
  textOnDark: '#FFFBEB',
  backBg: 'rgba(255,255,255,0.12)',
  backBorder: 'rgba(252,211,77,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#F59E0B',
  dotDone: '#84CC16',
  accent: '#D97706',
};

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
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const completingRef = useRef(false);
  const canvasRef = useRef<BoundaryDrawingCanvasRef>(null);

  const boundary = triangleBoundary(dimensions.width, dimensions.height, 0.36);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    speak('Climb the pyramid! Scribble inside the triangle shape.', 0.72);
    return () => stopTTS();
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStatsChange = useCallback(
    (s: FillStats) => {
      setStats(s);
      if (s.fillInsidePercent >= FILL_MIN && s.outsidePercent <= OUTSIDE_MAX && !completingRef.current) {
        completingRef.current = true;
        setShowCelebrate(true);
        speak('You reached the peak! Amazing control!', 0.72);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        setTimeout(() => {
          setShowCelebrate(false);
          onComplete();
        }, 1600);
      }
    },
    [onComplete],
  );

  const fillPct = stats ? Math.min(100, Math.round(stats.fillInsidePercent)) : 0;
  const outsidePct = stats ? Math.round(stats.outsidePercent) : 0;
  const showWarning = stats != null && stats.outsidePercent > OUTSIDE_MAX && stats.outsidePercent < 50;

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#78350F', '#B45309', '#FDE68A']} style={StyleSheet.absoluteFill} />
        <View style={styles.celebrate}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <Text style={styles.celebrateEmoji}>⛰️</Text>
          <Text style={styles.celebrateTitle}>Peak Reached!</Text>
        </View>
      </View>
    );
  }

  return (
    <BoundaryGameShell
      theme={THEME}
      gameLabel="PYRAMID PEAK"
      gameTitle="Triangle Climb"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
    >
      <LinearGradient colors={['#78350F', '#92400E', '#FEF3C7']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <View style={styles.mascotRow}>
        <Text style={styles.mascotEmoji}>⛰️</Text>
        <Text style={styles.mascotHint}>
          {showWarning ? 'Stay on the mountain — inside the triangle!' : 'Color inside the pyramid peak'}
        </Text>
      </View>

      {showWarning ? (
        <View style={styles.warnBox}>
          <Text style={styles.warnText}>⚠️ Scribbles escaping the peak!</Text>
        </View>
      ) : null}

      <PrecisionMeter
        fillPct={fillPct}
        outsidePct={outsidePct}
        outsideMax={OUTSIDE_MAX}
        fillMin={FILL_MIN}
        accent={THEME.accent}
        warnColor="#DC2626"
      />

      <View style={styles.canvasFrame} onLayout={onLayout}>
        <View style={styles.canvasInner}>
          <BoundaryDrawingCanvas
            ref={canvasRef}
            boundary={boundary}
            width={dimensions.width}
            height={dimensions.height}
            brushSize={14}
            onStatsChange={handleStatsChange}
          />
        </View>
      </View>
    </BoundaryGameShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  celebrate: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  celebrateEmoji: { fontSize: 64, marginBottom: 12 },
  celebrateTitle: { fontSize: 28, fontWeight: '900', color: '#FFFBEB' },
  mascotRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  mascotEmoji: { fontSize: 32 },
  mascotHint: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FDE68A', lineHeight: 19 },
  warnBox: {
    backgroundColor: 'rgba(254,243,199,0.95)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  warnText: { fontSize: 14, fontWeight: '800', color: '#B45309', textAlign: 'center' },
  canvasFrame: { flex: 1, minHeight: 240 },
  canvasInner: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.5)',
    backgroundColor: 'rgba(255,251,235,0.9)',
  },
});

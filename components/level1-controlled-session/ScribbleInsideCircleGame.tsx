/**
 * Game 1: Crystal Orb Studio — scribble inside circle (≥60% fill, ≤25% outside).
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BoundaryDrawingCanvas, type BoundaryDrawingCanvasRef, type FillStats } from './BoundaryDrawingCanvas';
import { circleBoundary } from './boundaryShapes';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { BoundaryGameShell } from './controlled-shared/BoundaryGameShell';
import { PrecisionMeter } from './controlled-shared/PrecisionMeter';

const FILL_MIN = 60;
const OUTSIDE_MAX = 25;

const THEME = {
  bg: '#0C4A6E',
  labelColor: '#67E8F9',
  titleColor: '#F0F9FF',
  textOnDark: '#F0F9FF',
  backBg: 'rgba(255,255,255,0.1)',
  backBorder: 'rgba(103,232,249,0.3)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#22D3EE',
  dotDone: '#34D399',
  accent: '#06B6D4',
};

export function ScribbleInsideCircleGame({
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

  const boundary = circleBoundary(dimensions.width, dimensions.height, 0.42);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    speak('Scribble inside the crystal orb. Stay within the glowing circle!', 0.72);
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
        speak('Perfect! The orb is glowing!', 0.72);
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
  const showGlow = stats != null && stats.fillInsidePercent >= 50;

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#0C4A6E', '#155E75', '#0891B2']} style={StyleSheet.absoluteFill} />
        <View style={styles.celebrate}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <Text style={styles.celebrateEmoji}>🔮</Text>
          <Text style={styles.celebrateTitle}>Orb Charged!</Text>
        </View>
      </View>
    );
  }

  return (
    <BoundaryGameShell
      theme={THEME}
      gameLabel="CRYSTAL ORB STUDIO"
      gameTitle="Orb Fill"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
    >
      <LinearGradient colors={['#0C4A6E', '#164E63']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <View style={styles.mascotRow}>
        <Text style={styles.mascotEmoji}>🔮</Text>
        <Text style={styles.mascotHint}>
          {outsidePct > OUTSIDE_MAX
            ? 'Oops — keep inside the orb!'
            : fillPct >= FILL_MIN
              ? 'Almost perfect control!'
              : 'Fill the orb with colorful scribbles'}
        </Text>
      </View>

      <PrecisionMeter
        fillPct={fillPct}
        outsidePct={outsidePct}
        outsideMax={OUTSIDE_MAX}
        fillMin={FILL_MIN}
        accent={THEME.accent}
      />

      <View style={styles.canvasFrame} onLayout={onLayout}>
        <View style={[styles.canvasInner, showGlow && styles.canvasGlow]}>
          <BoundaryDrawingCanvas
            ref={canvasRef}
            boundary={boundary}
            width={dimensions.width}
            height={dimensions.height}
            brushSize={14}
            onStatsChange={handleStatsChange}
            showBoundaryGlow={showGlow}
            boundaryGlowColor="#22D3EE"
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
  celebrateTitle: { fontSize: 28, fontWeight: '900', color: '#F0F9FF' },
  mascotRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  mascotEmoji: { fontSize: 32 },
  mascotHint: { flex: 1, fontSize: 14, fontWeight: '600', color: '#BAE6FD', lineHeight: 19 },
  canvasFrame: { flex: 1, minHeight: 240 },
  canvasInner: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.4)',
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  canvasGlow: {
    borderColor: '#22D3EE',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
});

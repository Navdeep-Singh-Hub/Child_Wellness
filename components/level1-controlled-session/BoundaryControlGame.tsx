/**
 * Game 4: Fortress Gate — ≥70% accuracy inside boundary.
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

const ACCURACY_MIN = 70;

const THEME = {
  bg: '#1C1917',
  labelColor: '#FCA5A5',
  titleColor: '#FAFAF9',
  textOnDark: '#FAFAF9',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(248,113,113,0.3)',
  dotIdle: 'rgba(255,255,255,0.12)',
  dotActive: '#EF4444',
  dotDone: '#22C55E',
};

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
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const completingRef = useRef(false);
  const canvasRef = useRef<BoundaryDrawingCanvasRef>(null);

  const boundary = circleBoundary(dimensions.width, dimensions.height, 0.4);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    speak('Guard the fortress gate! Keep your scribbles inside.', 0.72);
    return () => stopTTS();
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const handleStatsChange = useCallback(
    (s: FillStats) => {
      setStats(s);
      if (s.accuracy >= ACCURACY_MIN && s.totalStrokeArea > 0 && !completingRef.current) {
        completingRef.current = true;
        setShowCelebrate(true);
        speak('The gate is secure! Excellent guarding!', 0.72);
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

  const accuracy = stats ? Math.round(stats.accuracy) : 0;
  const isOutside = stats != null && stats.outsidePercent > 30;
  const barColor = accuracy >= ACCURACY_MIN ? '#22C55E' : accuracy >= 40 ? '#F59E0B' : '#EF4444';

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#1C1917', '#44403C']} style={StyleSheet.absoluteFill} />
        <View style={styles.celebrate}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <Text style={styles.celebrateEmoji}>🛡️</Text>
          <Text style={styles.celebrateTitle}>Gate Secured!</Text>
        </View>
      </View>
    );
  }

  return (
    <BoundaryGameShell
      theme={THEME}
      gameLabel="FORTRESS GATE"
      gameTitle="Boundary Guard"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
    >
      <LinearGradient colors={['#1C1917', '#292524', '#44403C']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <View style={styles.shieldMeter}>
        <Text style={styles.shieldEmoji}>🛡️</Text>
        <View style={styles.shieldBody}>
          <Text style={styles.shieldLabel}>Shield Accuracy</Text>
          <Text style={[styles.shieldValue, { color: barColor }]}>{accuracy}%</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(100, accuracy)}%`, backgroundColor: barColor }]} />
          </View>
          <Text style={styles.shieldHint}>Need {ACCURACY_MIN}% to secure the gate</Text>
        </View>
      </View>

      {isOutside ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>⚔️ Breach detected — stay inside!</Text>
        </View>
      ) : null}

      <View style={[styles.canvasFrame, isOutside && styles.canvasAlert]} onLayout={onLayout}>
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
    </BoundaryGameShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  celebrate: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  celebrateEmoji: { fontSize: 64, marginBottom: 12 },
  celebrateTitle: { fontSize: 28, fontWeight: '900', color: '#FAFAF9' },
  shieldMeter: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  shieldEmoji: { fontSize: 36 },
  shieldBody: { flex: 1 },
  shieldLabel: { fontSize: 11, fontWeight: '800', color: '#A8A29E', letterSpacing: 0.8, textTransform: 'uppercase' },
  shieldValue: { fontSize: 28, fontWeight: '900', marginVertical: 4 },
  barBg: { height: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: '100%', borderRadius: 5 },
  shieldHint: { fontSize: 12, color: '#A8A29E' },
  alertBox: {
    backgroundColor: 'rgba(127,29,29,0.5)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  alertText: { fontSize: 14, fontWeight: '800', color: '#FCA5A5', textAlign: 'center' },
  canvasFrame: {
    flex: 1,
    minHeight: 240,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(120,113,108,0.5)',
  },
  canvasAlert: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(127,29,29,0.2)',
  },
});

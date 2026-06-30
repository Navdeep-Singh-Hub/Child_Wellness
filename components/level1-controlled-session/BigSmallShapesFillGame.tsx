/**
 * Game 3: Shrink Lab — big circle → square → small triangle.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, Animated, Easing, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BoundaryDrawingCanvas, type BoundaryDrawingCanvasRef, type FillStats } from './BoundaryDrawingCanvas';
import { circleBoundary, squareBoundary, triangleBoundary } from './boundaryShapes';
import type { Boundary } from './boundaryUtils';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { BoundaryGameShell } from './controlled-shared/BoundaryGameShell';

const STAGES: { key: string; label: string; emoji: string; getBoundary: (w: number, h: number) => Boundary }[] = [
  { key: 'circle', label: 'Big Circle', emoji: '⭕', getBoundary: (w, h) => circleBoundary(w, h, 0.44) },
  { key: 'square', label: 'Medium Square', emoji: '⬜', getBoundary: (w, h) => squareBoundary(w, h, 0.4) },
  { key: 'triangle', label: 'Small Triangle', emoji: '🔺', getBoundary: (w, h) => triangleBoundary(w, h, 0.32) },
];

const THEME = {
  bg: '#312E81',
  labelColor: '#C4B5FD',
  titleColor: '#F5F3FF',
  textOnDark: '#F5F3FF',
  backBg: 'rgba(255,255,255,0.1)',
  backBorder: 'rgba(167,139,250,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#A78BFA',
  dotDone: '#34D399',
};

export function BigSmallShapesFillGame({
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
  const [stageIndex, setStageIndex] = useState(0);
  const [stats, setStats] = useState<FillStats | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebrateLabel, setCelebrateLabel] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<BoundaryDrawingCanvasRef>(null);
  const outsideFrames = useRef(0);
  const completingRef = useRef(false);
  const shakeX = useRef(new Animated.Value(0)).current;

  const stage = STAGES[stageIndex];
  const boundary = stage.getBoundary(dimensions.width, dimensions.height);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    speak('Welcome to the Shrink Lab! Fill each shape — they get smaller!', 0.72);
    return () => stopTTS();
  }, []);

  useEffect(() => {
    outsideFrames.current = 0;
    completingRef.current = false;
    speak(`Now shrink to the ${stage.label.toLowerCase()}!`, 0.75);
  }, [stageIndex, stage.label]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDimensions({ width, height });
  }, []);

  const runShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeX]);

  const handleStatsChange = useCallback(
    (s: FillStats) => {
      setStats(s);
      if (s.outsideRatio > 0.2) {
        outsideFrames.current += 1;
        if (outsideFrames.current % 4 === 0) {
          runShake();
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch (_) {}
        }
      } else {
        outsideFrames.current = 0;
      }

      if (s.passesStrict && !completingRef.current) {
        completingRef.current = true;
        setCelebrateLabel(stage.label);
        setShowCelebrate(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        setTimeout(() => {
          setShowCelebrate(false);
          completingRef.current = false;
          if (stageIndex < STAGES.length - 1) {
            setStageIndex((i) => i + 1);
            canvasRef.current?.clear();
            setStats(null);
            outsideFrames.current = 0;
          } else {
            speak('Shrink Lab complete! Incredible precision!', 0.72);
            onComplete();
          }
        }, 1500);
      }
    },
    [stageIndex, stage.label, onComplete, runShake],
  );

  const fillShown = stats ? Math.min(100, Math.round(stats.fillDisplayPercent)) : 0;

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#312E81', '#4C1D95']} style={StyleSheet.absoluteFill} />
        <View style={styles.celebrate}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <Text style={styles.celebrateEmoji}>{stage.emoji}</Text>
          <Text style={styles.celebrateTitle}>{celebrateLabel} shrunk!</Text>
        </View>
      </View>
    );
  }

  return (
    <BoundaryGameShell
      theme={THEME}
      gameLabel="SHRINK LAB"
      gameTitle={stage.label}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerRight={
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{stageIndex + 1}/{STAGES.length}</Text>
        </View>
      }
    >
      <LinearGradient colors={['#312E81', '#3730A3']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <View style={styles.stagePills}>
        {STAGES.map((s, i) => (
          <View key={s.key} style={[styles.pill, i === stageIndex && styles.pillActive, i < stageIndex && styles.pillDone]}>
            <Text style={styles.pillText}>{s.emoji}</Text>
          </View>
        ))}
      </View>

      <Animated.View style={{ flex: 1, transform: [{ translateX: shakeX }] }}>
        <View style={styles.meter}>
          <Text style={styles.meterLabel}>Inside fill: {fillShown}%</Text>
          <Text style={styles.meterSub}>
            Outside: {stats ? Math.round(stats.outsideRatio * 100) : 0}% · need ≤10%
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${fillShown}%` }]} />
          </View>
        </View>

        <View style={styles.canvasFrame} onLayout={onLayout}>
          <View style={styles.canvasInner} key={stage.key}>
            <BoundaryDrawingCanvas
              ref={canvasRef}
              boundary={boundary}
              width={dimensions.width}
              height={dimensions.height}
              brushSize={14}
              onStatsChange={handleStatsChange}
              showBoundaryGlow={stats != null && stats.insideCoverage >= 0.75}
              showInsidePulse
            />
          </View>
        </View>
      </Animated.View>
    </BoundaryGameShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  celebrate: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 24, fontWeight: '900', color: '#F5F3FF' },
  stageBadge: {
    backgroundColor: 'rgba(167,139,250,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  stageBadgeText: { fontSize: 12, fontWeight: '800', color: '#E9D5FF' },
  stagePills: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  pill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pillActive: { borderColor: '#A78BFA', backgroundColor: 'rgba(167,139,250,0.25)' },
  pillDone: { backgroundColor: 'rgba(52,211,153,0.25)', borderColor: '#34D399' },
  pillText: { fontSize: 20 },
  meter: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  meterLabel: { fontSize: 14, fontWeight: '800', color: '#E9D5FF', marginBottom: 4 },
  meterSub: { fontSize: 12, color: '#C4B5FD', marginBottom: 8 },
  barBg: { height: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#A78BFA', borderRadius: 5 },
  canvasFrame: { flex: 1, minHeight: 220 },
  canvasInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.5)',
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
});

/**
 * Game 1: Free Scribbling — Aurora Sketch Studio
 * Unique identity: aurora night sky, warm paper canvas, Pip the pencil mascot,
 * magic stroke meter, sparkle feedback, guided UX before Done unlocks.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { AuroraBackground } from './free-scribbling/AuroraBackground';
import { SketchyMascot } from './free-scribbling/SketchyMascot';
import { MagicMeter } from './free-scribbling/MagicMeter';
import { StrokeSparkles } from './free-scribbling/StrokeSparkles';
import {
  AURORA,
  ENCOURAGEMENTS,
  GAME1_CONFIG,
  HINTS,
} from './free-scribbling/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FreeScribblingGame({
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
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const [lastEncouragement, setLastEncouragement] = useState('');
  const [mascotHappy, setMascotHappy] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const spokeIntro = useRef(false);

  const ready = strokeCount >= GAME1_CONFIG.minStrokes;
  const donePulse = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Move your finger on the paper to draw colorful lines!', 0.72);
    }
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (ready && !reduceMotion) {
      donePulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 700 }),
          withTiming(1, { duration: 700 }),
        ),
        -1,
        true,
      );
    } else {
      donePulse.value = withTiming(1);
    }
  }, [ready, reduceMotion, donePulse]);

  const mascotHint = useMemo(() => {
    if (lastEncouragement) return lastEncouragement;
    if (ready) return HINTS.ready;
    if (strokeCount >= GAME1_CONFIG.minStrokes - 1) return HINTS.almost;
    if (strokeCount > 0) return HINTS.started;
    return HINTS.idle;
  }, [strokeCount, ready, lastEncouragement]);

  const handleStrokeStart = useCallback(() => {
    setSparkleTrigger((t) => t + 1);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  }, []);

  const handleStrokeEnd = useCallback(() => {
    const count = canvasRef.current?.getStrokeCount() ?? 0;
    setStrokeCount(count);
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setLastEncouragement(msg);
    setTimeout(() => setLastEncouragement(''), 2200);
    try {
      Haptics.selectionAsync();
    } catch (_) {}
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setStrokeCount(0);
    setLastEncouragement('');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
    speak('Canvas cleared. Let\'s draw again!', 0.75);
  }, []);

  const handleDone = useCallback(() => {
    if (!ready) {
      speak(`Draw ${GAME1_CONFIG.minStrokes - strokeCount} more lines first!`, 0.75);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (_) {}
      return;
    }
    setMascotHappy(true);
    setShowCelebrate(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    speak('Wonderful scribbling! Great job!', 0.72);
    setTimeout(() => {
      setShowCelebrate(false);
      onComplete();
    }, 1600);
  }, [ready, strokeCount, onComplete]);

  const doneBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: donePulse.value }],
  }));

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>🎨</Text>
            <Text style={styles.celebrateTitle}>Masterpiece!</Text>
            <Text style={styles.celebrateSub}>{strokeCount} colorful strokes</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AuroraBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color={AURORA.textOnDark} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>AURORA SKETCH STUDIO</Text>
            <Text style={styles.gameTitle}>Free Scribbling</Text>
          </View>

          <MagicMeter strokes={strokeCount} />
        </View>

        {/* Step dots */}
        <View style={styles.dotsRow} accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}>
          {stepDots.map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                n === currentStep && styles.dotActive,
                n < currentStep && styles.dotDone,
              ]}
            />
          ))}
        </View>

        <SketchyMascot hint={mascotHint} isHappy={mascotHappy} />

        {/* Canvas frame — warm paper on dark (figure-ground contrast) */}
        <View style={styles.canvasFrame}>
          <View style={styles.canvasGlow} />
          <View style={styles.canvasInner}>
            <StrokeSparkles trigger={sparkleTrigger} />
            <DrawingCanvas
              ref={canvasRef}
              brushSize={GAME1_CONFIG.brushSize}
              canvasColor={AURORA.paper}
              randomColors
              onStrokeStart={handleStrokeStart}
              onStrokeEnd={handleStrokeEnd}
            />
            {strokeCount === 0 ? (
              <View style={styles.canvasPlaceholder} pointerEvents="none">
                <Text style={styles.placeholderIcon}>👆</Text>
                <Text style={styles.placeholderText}>Draw here</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleClear}
            disabled={strokeCount === 0}
            style={({ pressed }) => [
              styles.btnClear,
              strokeCount === 0 && styles.btnDisabled,
              pressed && strokeCount > 0 && styles.pressed,
            ]}
            accessibilityLabel="Clear canvas"
            accessibilityRole="button"
          >
            <Ionicons name="refresh-outline" size={20} color={strokeCount > 0 ? AURORA.textOnDark : AURORA.textMuted} />
            <Text style={[styles.btnClearText, strokeCount === 0 && styles.btnTextDisabled]}>Clear</Text>
          </Pressable>

          <AnimatedPressable
            onPress={handleDone}
            style={[
              styles.btnDone,
              !ready && styles.btnDoneDisabled,
              ready && styles.btnDoneReady,
              ready && doneBtnStyle,
            ]}
            accessibilityLabel={ready ? 'Finish drawing' : `Draw ${GAME1_CONFIG.minStrokes - strokeCount} more strokes to finish`}
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready }}
          >
            <Ionicons name={ready ? 'checkmark-circle' : 'lock-closed-outline'} size={22} color="#FFF" />
            <Text style={styles.btnDoneText}>{ready ? 'Done!' : `${GAME1_CONFIG.minStrokes - strokeCount} more`}</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AURORA.spaceDeep },
  safe: { flex: 1, paddingHorizontal: 18 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerCenter: { flex: 1 },
  gameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AURORA.gold,
    letterSpacing: 1.4,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: AURORA.textOnDark,
    letterSpacing: -0.3,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    width: 22,
    backgroundColor: AURORA.gold,
  },
  dotDone: {
    backgroundColor: AURORA.auroraGreen,
  },

  canvasFrame: {
    flex: 1,
    minHeight: 260,
    marginBottom: 16,
    position: 'relative',
  },
  canvasGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: AURORA.paperShadow,
    transform: [{ scale: 1.02 }],
  },
  canvasInner: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: AURORA.paperBorder,
    backgroundColor: AURORA.paper,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  canvasPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  placeholderIcon: { fontSize: 36, marginBottom: 6 },
  placeholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: AURORA.textOnPaper,
    letterSpacing: 0.5,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  btnClear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: AURORA.clearBg,
    borderWidth: 1,
    borderColor: AURORA.clearBorder,
  },
  btnClearText: {
    fontSize: 16,
    fontWeight: '700',
    color: AURORA.textOnDark,
  },
  btnDone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
  },
  btnDoneDisabled: {
    backgroundColor: AURORA.doneDisabled,
  },
  btnDoneReady: {
    backgroundColor: AURORA.doneActive,
    shadowColor: AURORA.doneGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  },
  btnDoneText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  btnDisabled: { opacity: 0.45 },
  btnTextDisabled: { color: AURORA.textMuted },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 18, 34, 0.75)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 12 },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: AURORA.textOnDark,
    marginBottom: 6,
  },
  celebrateSub: {
    fontSize: 15,
    fontWeight: '600',
    color: AURORA.auroraMint,
  },
});

/**
 * Game 3: Tap to Draw — Dot Galaxy
 * Cosmic constellation theme: each tap places a glowing star,
 * Nova mascot guides, constellation meter tracks 10 stars.
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
import * as Haptics from 'expo-haptics';
import { DrawingCanvas } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak, stopTTS } from '@/utils/tts';
import { GalaxyBackground } from './tap-to-draw/GalaxyBackground';
import { NovaMascot } from './tap-to-draw/NovaMascot';
import { ConstellationMeter } from './tap-to-draw/ConstellationMeter';
import { GAME3_CONFIG, GALAXY, TAP_HINTS } from './tap-to-draw/theme';

export function TapToDrawGame({
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
  const [tapCount, setTapCount] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const completingRef = useRef(false);
  const spokeIntro = useRef(false);
  const canvasKey = useRef(0);

  const goal = GAME3_CONFIG.tapsRequired;
  const ready = tapCount >= goal;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Tap the sky to place colorful stars and build your constellation!', 0.72);
    }
  }, []);

  const hint = useMemo(() => {
    if (ready) return TAP_HINTS.ready;
    if (tapCount >= goal - 2) return TAP_HINTS.almost(goal - tapCount);
    if (tapCount > 0) return TAP_HINTS.started(tapCount, goal);
    return TAP_HINTS.idle;
  }, [tapCount, goal, ready]);

  const handleStrokeEnd = useCallback(
    (strokes: { length: number }[]) => {
      if (completingRef.current) return;
      const count = strokes.length;
      setTapCount(count);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}

      if (count === Math.floor(goal / 2)) {
        speak('Halfway there! Keep tapping!', 0.75);
      }

      if (count >= goal) {
        completingRef.current = true;
        setShowCelebrate(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
        speak('Amazing! Your constellation is complete!', 0.72);
        setTimeout(() => {
          setShowCelebrate(false);
          onComplete();
        }, 1800);
      }
    },
    [goal, onComplete],
  );

  const handleStrokeStart = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch (_) {}
  }, []);

  const handleReset = useCallback(() => {
    canvasKey.current += 1;
    setTapCount(0);
    completingRef.current = false;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
    speak('Stars cleared. Tap to build a new constellation!', 0.75);
  }, []);

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <GalaxyBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>🌌</Text>
            <Text style={styles.celebrateTitle}>Constellation!</Text>
            <Text style={styles.celebrateSub}>{goal} stars shining bright</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GalaxyBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={GALAXY.textPrimary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>DOT GALAXY</Text>
            <Text style={styles.gameTitle}>Star Tapper</Text>
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

        <NovaMascot hint={hint} />
        <ConstellationMeter taps={tapCount} />

        <View style={styles.canvasFrame}>
          <View style={styles.canvasGlow} />
          <View style={styles.canvasInner}>
            <DrawingCanvas
              key={canvasKey.current}
              brushSize={GAME3_CONFIG.brushSize}
              canvasColor={GALAXY.canvas}
              randomColors
              singleDotMode
              onStrokeStart={handleStrokeStart}
              onStrokeEnd={handleStrokeEnd}
            />
            {tapCount === 0 ? (
              <View style={styles.tapHint} pointerEvents="none">
                <Text style={styles.tapHintIcon}>✨</Text>
                <Text style={styles.tapHintText}>Tap to place stars</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={handleReset}
          disabled={tapCount === 0}
          style={({ pressed }) => [
            styles.resetBtn,
            tapCount === 0 && styles.resetDisabled,
            pressed && tapCount > 0 && styles.pressed,
          ]}
        >
          <Ionicons name="planet-outline" size={20} color={tapCount > 0 ? GALAXY.accent : GALAXY.textMuted} />
          <Text style={[styles.resetText, tapCount === 0 && styles.resetTextDisabled]}>Reset Sky</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GALAXY.void },
  safe: { flex: 1, paddingHorizontal: 18 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GALAXY.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GALAXY.panelBorder,
  },
  headerCenter: { flex: 1 },
  gameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: GALAXY.accent,
    letterSpacing: 1.4,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: GALAXY.textPrimary,
  },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.12)' },
  dotActive: { width: 22, backgroundColor: GALAXY.accent },
  dotDone: { backgroundColor: GALAXY.starGold },

  canvasFrame: { flex: 1, minHeight: 260, marginBottom: 12, position: 'relative' },
  canvasGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: 'rgba(34,211,238,0.12)',
    transform: [{ scale: 1.02 }],
  },
  canvasInner: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: GALAXY.canvasBorder,
    backgroundColor: GALAXY.canvas,
    shadowColor: GALAXY.cosmicCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  tapHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  tapHintIcon: { fontSize: 40, marginBottom: 8 },
  tapHintText: { fontSize: 16, fontWeight: '700', color: GALAXY.textMuted },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: GALAXY.panel,
    borderWidth: 1,
    borderColor: GALAXY.panelBorder,
    marginBottom: 8,
  },
  resetDisabled: { opacity: 0.45 },
  resetText: { fontSize: 16, fontWeight: '700', color: GALAXY.accent },
  resetTextDisabled: { color: GALAXY.textMuted },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,13,33,0.8)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: GALAXY.panel,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 1.5,
    borderColor: GALAXY.starGold,
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 26, fontWeight: '900', color: GALAXY.starGold, marginBottom: 6 },
  celebrateSub: { fontSize: 15, fontWeight: '600', color: GALAXY.textPrimary },
});

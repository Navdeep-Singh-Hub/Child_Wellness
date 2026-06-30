/**
 * Builder Session 5 — Game 1: Apex Trace Plateau
 * Tap triangle corner dots in order: top → bottom left → bottom right.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, TRIANGLE_TRACE_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const CORNERS = [
  { id: 'top', label: 'Top', order: 0 },
  { id: 'left', label: 'Bottom left', order: 1 },
  { id: 'right', label: 'Bottom right', order: 2 },
];

export interface TraceShapeGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function TraceShapeGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: TraceShapeGameProps) {
  const [traced, setTraced] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(
      'Trace the triangle. Tap the dots in order: top, then bottom left, then bottom right.'
    );
    return () => stopBuilderSpeech();
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakBuilderHint('Try again. Tap the dots in order to trace the triangle.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleDotTap = useCallback(
    (order: number) => {
      if (order !== traced) {
        triggerWrong();
        return;
      }

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      const next = traced + 1;
      setTraced(next);
      speakBuilderHint(CORNERS.find((c) => c.order === order)?.label ?? '');

      if (next >= 3) {
        speakBuilderHint('You traced the triangle! Great job!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [onComplete, traced, triggerWrong]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Triangle Traced!"
          subtitle="You connected all three corners!"
          badgeEmoji="🔺"
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
      <MountainWorkshopBackground />

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.tracePill}>
            <Text style={styles.tracePillText}>{traced}/3 dots</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable
              onPress={() =>
                speakBuilderHint('Tap dots one, two, three to trace the triangle.')
              }
            >
              <Text style={styles.prompt}>Tap 1 → 2 → 3 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Triangle Blueprint</Text>
          <Animated.View style={[styles.triangleWrap, shakeStyle]}>
            {traced >= 2 ? <View style={styles.lineLeft} /> : null}
            {traced >= 3 ? <View style={styles.lineRight} /> : null}
            {traced >= 2 ? <View style={styles.lineBase} /> : null}

            <Pressable
              style={[styles.dot, styles.dotTop, traced > 0 && styles.dotTraced]}
              onPress={() => handleDotTap(0)}
              accessibilityLabel="Dot 1 top"
            >
              <Text style={styles.dotNum}>1</Text>
            </Pressable>
            <Pressable
              style={[styles.dot, styles.dotLeft, traced > 1 && styles.dotTraced]}
              onPress={() => handleDotTap(1)}
              accessibilityLabel="Dot 2 bottom left"
            >
              <Text style={styles.dotNum}>2</Text>
            </Pressable>
            <Pressable
              style={[styles.dot, styles.dotRight, traced > 2 && styles.dotTraced]}
              onPress={() => handleDotTap(2)}
              accessibilityLabel="Dot 3 bottom right"
            >
              <Text style={styles.dotNum}>3</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
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
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  tracePill: {
    backgroundColor: 'rgba(209, 250, 229, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  tracePillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  playArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 24,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  triangleWrap: { width: 220, height: 190, position: 'relative' },
  lineLeft: {
    position: 'absolute',
    top: 24,
    left: 34,
    width: 3,
    height: 120,
    backgroundColor: T.line,
    transform: [{ rotate: '28deg' }],
  },
  lineRight: {
    position: 'absolute',
    top: 24,
    right: 34,
    width: 3,
    height: 120,
    backgroundColor: T.line,
    transform: [{ rotate: '-28deg' }],
  },
  lineBase: {
    position: 'absolute',
    bottom: 24,
    left: 34,
    right: 34,
    height: 3,
    backgroundColor: T.line,
  },
  dot: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.dot,
    borderWidth: 4,
    borderColor: T.dotBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotTop: { top: 0, left: '50%', marginLeft: -26 },
  dotLeft: { bottom: 0, left: 10 },
  dotRight: { bottom: 0, right: 10 },
  dotTraced: { backgroundColor: T.dotTraced, borderColor: '#16A34A' },
  dotNum: { fontSize: 18, fontWeight: '900', color: '#FFF' },
});

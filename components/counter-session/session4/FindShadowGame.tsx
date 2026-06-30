/**
 * Counter Session 4 — Game 4: Shadow Silhouette Deck — ball → circle shadow
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { SHADOW_SILHOUETTE_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { ColorCloudBackground } from '../ColorCloudBackground';

const CORRECT_ID = 'circle';

export function FindShadowGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint('Match the ball to its shadow. Which shadow matches the ball?');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. The ball is round. Find the round shadow.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speakCounterHint("Correct! The circle is the ball's shadow!");
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
      }
    },
    [onComplete, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Shadow Found!" subtitle="The circle matches the ball!" badgeEmoji="🌑" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <ColorCloudBackground />
      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable onPress={() => speakCounterHint('Find the round shadow for the ball.')}>
                <Text style={styles.prompt}>Match the shadow 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.objectCard}>
          <Text style={styles.objectEmoji}>⚽</Text>
          <Text style={styles.objectLabel}>Ball</Text>
        </View>
        <Text style={styles.tapLabel}>Tap the matching shadow</Text>
        <Animated.View style={[styles.shadowsRow, shakeStyle]}>
          <Pressable onPress={() => handleTap('circle')} style={({ pressed }) => [styles.shadowBtn, pressed && styles.pressed]}>
            <View style={styles.shadowCircle} />
            <Text style={styles.shadowLabel}>Circle</Text>
          </Pressable>
          <Pressable onPress={() => handleTap('square')} style={({ pressed }) => [styles.shadowBtn, pressed && styles.pressed]}>
            <View style={styles.shadowSquare} />
            <Text style={styles.shadowLabel}>Square</Text>
          </Pressable>
          <Pressable onPress={() => handleTap('triangle')} style={({ pressed }) => [styles.shadowBtn, pressed && styles.pressed]}>
            <View style={styles.shadowTriangle} />
            <Text style={styles.shadowLabel}>Triangle</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20 },
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
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...COUNTER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  stepPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...COUNTER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink },
  objectCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 20,
    ...COUNTER_SESSION.shadow.card,
  },
  objectEmoji: { fontSize: 56, marginBottom: 6 },
  objectLabel: { fontSize: 16, fontWeight: '800', color: T.ink },
  tapLabel: { fontSize: 15, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 24, marginBottom: 16 },
  shadowsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', paddingHorizontal: 20 },
  shadowBtn: {
    minWidth: 100,
    paddingVertical: 16,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.tileBorder,
    backgroundColor: T.tile,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  shadowCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: T.shadow, marginBottom: 8 },
  shadowSquare: { width: 42, height: 42, backgroundColor: T.shadow, borderRadius: 6, marginBottom: 8 },
  shadowTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderBottomWidth: 38,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: T.shadow,
    marginBottom: 8,
  },
  shadowLabel: { fontSize: 13, fontWeight: '800', color: T.inkMuted },
});

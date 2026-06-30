/**
 * Counter Session 2 — Game 1: Star Tally Tower — count 7 stars
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { STAR_TALLY_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { CountCornerBackground } from '../CountCornerBackground';

const STAR_COUNT = 7;
const OPTIONS = [5, 6, 7, 8];

export function CountingChallengeGame({
  onComplete,
  onBack,
  currentStep = 1,
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
    speakCounterHint('How many stars? Count the stars, then tap the number.');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Count the stars carefully.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === STAR_COUNT) {
        speakCounterHint('Correct! Seven stars!');
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
        <SuccessCelebration
          title="Seven Stars!"
          subtitle="You counted every star in the tower!"
          badgeEmoji="⭐"
          variant="ocean"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <CountCornerBackground />

      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Quest {currentStep} · {progressPct}%
            </Text>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable onPress={() => speakCounterHint('Count the stars and tap seven.')}>
                <Text style={styles.prompt}>How many stars? 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.towerCard}>
          <Text style={styles.towerLabel}>Star tower</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: STAR_COUNT }, (_, i) => (
              <Text key={i} style={styles.star}>
                ⭐
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.tapLabel}>Tap the correct number</Text>
        <Animated.View style={[styles.optionsRow, shakeStyle]}>
          {OPTIONS.map((num) => (
            <Pressable
              key={num}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
            >
              <Text style={styles.optionText}>{num}</Text>
            </Pressable>
          ))}
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
  towerCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 20,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.card,
  },
  towerLabel: { fontSize: 13, fontWeight: '800', color: T.inkMuted, marginBottom: 14, textTransform: 'uppercase' },
  starsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  star: { fontSize: 34 },
  tapLabel: { fontSize: 15, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 24, marginBottom: 16 },
  optionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, paddingHorizontal: 20 },
  optionBtn: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: T.tile,
    borderWidth: 3,
    borderColor: T.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  optionText: { fontSize: 28, fontWeight: '900', color: T.ink },
});

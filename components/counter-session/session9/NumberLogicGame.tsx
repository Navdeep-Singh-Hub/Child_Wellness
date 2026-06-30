/**
 * Counter Session 9 — Game 1: Next Number — 2, 4, 6, ? → 8
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { NEXT_NUMBER_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { LogicLoftBackground } from '../LogicLoftBackground';

const PATTERN = [2, 4, 6];
const OPTIONS = [6, 7, 8, 9];
const CORRECT = 8;

export function NumberLogicGame({
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
    speakCounterHint('What number comes next? Two, four, six, what?');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Count by twos: two, four, six...');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === CORRECT) {
        speakCounterHint('Correct! Eight comes next!');
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
        <SuccessCelebration title="Next Number!" subtitle="Eight comes after six!" badgeEmoji="🔢" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <LogicLoftBackground />
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
              <Pressable onPress={() => speakCounterHint('Two, four, six — what number comes next?')}>
                <Text style={styles.prompt}>2, 4, 6, ? 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.patternRow}>
          {PATTERN.map((n, i) => (
            <View key={i} style={styles.patternBox}>
              <Text style={styles.patternNum}>{n}</Text>
            </View>
          ))}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>?</Text>
          </View>
        </View>

        <Animated.View style={[styles.optionsRow, shakeStyle]}>
          {OPTIONS.map((num) => (
            <Pressable
              key={num}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${num}`}
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
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20, alignItems: 'center', paddingHorizontal: 20 },
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
  header: { paddingHorizontal: 0, paddingTop: 8, gap: 8, zIndex: 5, width: '100%' },
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
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 28 },
  patternBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.patternBox,
    borderWidth: 4,
    borderColor: T.patternBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternNum: { fontSize: 26, fontWeight: '800', color: T.ink },
  questionBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 24, fontWeight: '800', color: T.inkMuted },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  optionBtn: {
    minWidth: 64,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: T.optionBtn,
    borderWidth: 4,
    borderColor: T.optionBorder,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  optionText: { fontSize: 28, fontWeight: '800', color: T.ink },
});

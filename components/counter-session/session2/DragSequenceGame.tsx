/**
 * Counter Session 2 — Game 3: Number Ladder — tap 4, 5, 6, 7 in order
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
import { NUMBER_LADDER_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, speakCounterWord, stopCounterSpeech } from '../counterSessionSpeech';
import { CountCornerBackground } from '../CountCornerBackground';

const SEQUENCE = [4, 5, 6, 7];
const NUMBERS = [5, 4, 7, 6];

export function DragSequenceGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [nextIndex, setNextIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint('Tap the numbers in order: 4, 5, 6, 7.');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Tap 4, then 5, then 6, then 7.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (num: number) => {
      const expected = SEQUENCE[nextIndex];
      if (num === expected) {
        speakCounterWord(String(num));
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        if (newIndex >= SEQUENCE.length) {
          speakCounterHint('Correct! 4, 5, 6, 7!');
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            /* ignore */
          }
          setCelebrating(true);
          setTimeout(() => onComplete(), 2200);
        }
      } else {
        triggerWrong();
      }
    },
    [nextIndex, onComplete, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Ladder Climbed!"
          subtitle="You ordered 4, 5, 6, 7!"
          badgeEmoji="🔢"
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
              <Pressable onPress={() => speakCounterHint('Tap four, five, six, seven in order.')}>
                <Text style={styles.prompt}>Climb the ladder 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.ladderCard}>
          <Text style={styles.ladderLabel}>Order: 4 → 5 → 6 → 7</Text>
          <View style={styles.slotsRow}>
            {SEQUENCE.map((n, i) => (
              <View key={i} style={[styles.slot, i < nextIndex && styles.slotFilled]}>
                <Text style={styles.slotText}>{i < nextIndex ? n : '?'}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.tapLabel}>Tap numbers in order</Text>
        <Animated.View style={[styles.numbersRow, shakeStyle]}>
          {NUMBERS.map((num, i) => (
            <Pressable
              key={`${num}-${i}`}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.numBtn, pressed && styles.pressed]}
            >
              <Text style={styles.numText}>{num}</Text>
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
  pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
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
  ladderCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 22,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.card,
  },
  ladderLabel: { fontSize: 14, fontWeight: '800', color: T.inkMuted, marginBottom: 16 },
  slotsRow: { flexDirection: 'row', gap: 12 },
  slot: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: T.slot,
    borderWidth: 3,
    borderColor: T.slotBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: 'rgba(153, 246, 228, 0.5)', borderColor: T.accent },
  slotText: { fontSize: 24, fontWeight: '900', color: T.ink },
  tapLabel: { fontSize: 15, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 24, marginBottom: 16 },
  numbersRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, paddingHorizontal: 20 },
  numBtn: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: T.numBtn,
    borderWidth: 3,
    borderColor: T.numBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  numText: { fontSize: 28, fontWeight: '900', color: T.ink },
});

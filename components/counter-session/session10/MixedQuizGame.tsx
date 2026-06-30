/**
 * Counter Session 10 — Game 1: Shape & Color Quiz (2 rounds)
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { MIXED_QUIZ_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { SummitSkyBackground } from '../SummitSkyBackground';

type Option = { id: string; label: string; emoji: string };
type Round = { prompt: string; correctId: string; options: Option[] };

export function MixedQuizGame({
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
  const rounds: Round[] = useMemo(
    () => [
      {
        prompt: 'Tap the BLUE circle.',
        correctId: 'blue-circle',
        options: [
          { id: 'blue-circle', label: 'Blue Circle', emoji: '🔵' },
          { id: 'red-square', label: 'Red Square', emoji: '🟥' },
          { id: 'green-triangle', label: 'Green Triangle', emoji: '🔺' },
        ],
      },
      {
        prompt: 'Tap the RED square.',
        correctId: 'red-square',
        options: [
          { id: 'green-circle', label: 'Green Circle', emoji: '🟢' },
          { id: 'red-square', label: 'Red Square', emoji: '🟥' },
          { id: 'blue-triangle', label: 'Blue Triangle', emoji: '🔷' },
        ],
      },
    ],
    []
  );

  const [roundIndex, setRoundIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const current = rounds[roundIndex];

  useEffect(() => {
    speakCounterHint(current.prompt);
    return () => stopCounterSpeech();
  }, [current.prompt]);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === current.correctId) {
        speakCounterHint('Correct!');
        const next = roundIndex + 1;
        if (next >= rounds.length) {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            /* ignore */
          }
          setCelebrating(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setRoundIndex(next);
        }
      } else {
        triggerWrong();
      }
    },
    [current.correctId, onComplete, roundIndex, rounds.length, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Quiz Complete!" subtitle="You identified shapes and colors!" badgeEmoji="🎯" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <SummitSkyBackground />
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
              <Pressable onPress={() => speakCounterHint(current.prompt)}>
                <Text style={styles.prompt}>{current.prompt} 🔊</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.roundLabel}>Question {roundIndex + 1} / {rounds.length}</Text>
        </View>
        <Animated.View style={[styles.row, shakeStyle]}>
          {current.options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={styles.label}>{opt.label}</Text>
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
  header: { paddingHorizontal: 0, paddingTop: 8, gap: 8, zIndex: 5, width: '100%', alignItems: 'center' },
  stepPill: {
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
    width: '100%',
    ...COUNTER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink },
  roundLabel: { fontSize: 14, fontWeight: '800', color: T.accentDeep },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 20 },
  optionBtn: {
    minWidth: 110,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: T.optionBtn,
    borderWidth: 4,
    borderColor: T.optionBorder,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  emoji: { fontSize: 44, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '700', color: T.ink, textAlign: 'center' },
});

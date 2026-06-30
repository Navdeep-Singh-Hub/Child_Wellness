/**
 * Counter Session 7 — Game 1: Pattern Echo — watch then repeat red, blue, green
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { PATTERN_ECHO_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, speakCounterWord, stopCounterSpeech } from '../counterSessionSpeech';
import { PuzzlePeakBackground } from '../PuzzlePeakBackground';

const PATTERN = ['red', 'blue', 'green'];
const OPTIONS = [
  { id: 'red', label: 'Red', color: '#EF4444' },
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'green', label: 'Green', color: '#22C55E' },
];

export function PatternMemoryGame({
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
  const [phase, setPhase] = useState<'show' | 'repeat'>('show');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [userIndex, setUserIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint('Watch the pattern. Then tap the colors in the same order.');
    return () => stopCounterSpeech();
  }, []);

  useEffect(() => {
    if (phase !== 'show') return;
    let i = 0;
    const run = () => {
      if (i >= PATTERN.length) {
        setHighlightIndex(-1);
        speakCounterHint('Your turn! Tap red, then blue, then green.');
        setPhase('repeat');
        return;
      }
      setHighlightIndex(i);
      i += 1;
      setTimeout(run, 700);
    };
    const t = setTimeout(run, 800);
    return () => clearTimeout(t);
  }, [phase]);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Remember: red, blue, green.');
    setUserIndex(0);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (id: string) => {
      if (phase !== 'repeat') return;
      const expected = PATTERN[userIndex];
      if (id === expected) {
        speakCounterWord(id);
        const next = userIndex + 1;
        setUserIndex(next);
        if (next >= PATTERN.length) {
          speakCounterHint('Correct! You repeated the pattern!');
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
    [phase, userIndex, onComplete, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Pattern Echoed!" subtitle="You remembered the pattern!" badgeEmoji="🧠" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <PuzzlePeakBackground />
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
              <Pressable onPress={() => speakCounterHint('Watch, then repeat the color pattern.')}>
                <Text style={styles.prompt}>{phase === 'show' ? 'Watch the pattern 🔊' : 'Your turn — repeat it! 🔊'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {phase === 'show' ? (
          <>
            <Text style={styles.phaseLabel}>Watch the pattern</Text>
            <View style={styles.patternRow}>
              {PATTERN.map((id, i) => {
                const opt = OPTIONS.find((o) => o.id === id);
                return (
                  <View
                    key={i}
                    style={[
                      styles.patternDot,
                      { backgroundColor: opt?.color ?? '#999' },
                      highlightIndex === i && styles.patternDotHighlight,
                    ]}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.phaseLabel}>Tap in order: Red, Blue, Green</Text>
            <Animated.View style={[styles.optionsRow, shakeStyle]}>
              {OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => handleTap(opt.id)}
                  style={({ pressed }) => [styles.optionBtn, { backgroundColor: opt.color }, pressed && styles.pressed]}
                  accessibilityLabel={opt.label}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}
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
  phaseLabel: { fontSize: 18, fontWeight: '800', color: T.accentDeep, marginTop: 20, marginBottom: 20, textAlign: 'center' },
  patternRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  patternDot: { width: 56, height: 56, borderRadius: 28, opacity: 0.55 },
  patternDotHighlight: { opacity: 1, transform: [{ scale: 1.15 }] },
  optionsRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
  optionBtn: {
    minWidth: 88,
    paddingVertical: 20,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  optionLabel: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});

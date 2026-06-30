/**
 * Counter Session 1 — Game 1: Pattern Orbit
 * Pattern: circle, square, triangle, circle, square, ? → triangle
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
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { PATTERN_ORBIT_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { CloudTerraceBackground } from '../CloudTerraceBackground';

const PATTERN = ['circle', 'square', 'triangle', 'circle', 'square'];
const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const CORRECT_ID = 'triangle';
const SHAPE_EMOJI: Record<string, string> = { circle: '⭕', square: '⬜', triangle: '🔺' };

export function PatternCompletionGame({
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
  const [wrongId, setWrongId] = useState<string | null>(null);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint(
      'Complete the pattern. Circle, square, triangle, circle, square. What comes next?'
    );
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Look at the pattern: circle, square, triangle, circle, square.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speakCounterHint('Correct! Triangle comes next!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setWrongId(id);
        triggerWrong();
        setTimeout(() => setWrongId(null), 600);
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
          title="Pattern Complete!"
          subtitle="Triangle completes the orbit!"
          badgeEmoji="🔺"
          variant="ocean"
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
      <CloudTerraceBackground />

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
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
              <Pressable onPress={() => speakCounterHint('What shape comes next in the pattern?')}>
                <Text style={styles.prompt}>Complete the orbit 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.patternCard}>
          <Text style={styles.patternLabel}>Orbit pattern</Text>
          <View style={styles.patternRow}>
            {PATTERN.map((p, i) => (
              <View key={i} style={styles.shapeDot}>
                <Text style={styles.shapeEmoji}>{SHAPE_EMOJI[p]}</Text>
              </View>
            ))}
            <View style={styles.questionDot}>
              <Text style={styles.questionText}>?</Text>
            </View>
          </View>
        </View>

        <Text style={styles.chooseLabel}>Tap the correct shape</Text>
        <Animated.View style={[styles.optionsRow, shakeStyle]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [
                styles.optionBtn,
                wrongId === opt.id && styles.optionWrong,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <Text style={styles.optionLabel}>{opt.label}</Text>
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
  patternCard: {
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
  patternLabel: { fontSize: 14, fontWeight: '800', color: T.inkMuted, marginBottom: 14, textTransform: 'uppercase' },
  patternRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  shapeDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(219, 234, 254, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.tileBorder,
  },
  shapeEmoji: { fontSize: 24 },
  questionDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accent,
  },
  questionText: { fontSize: 24, fontWeight: '900', color: '#fff' },
  chooseLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: T.inkMuted,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  optionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, paddingHorizontal: 20 },
  optionBtn: {
    width: 96,
    paddingVertical: 16,
    borderRadius: COUNTER_SESSION.radius.card,
    backgroundColor: T.tile,
    borderWidth: 3,
    borderColor: T.tileBorder,
    alignItems: 'center',
    gap: 6,
    ...COUNTER_SESSION.shadow.soft,
  },
  optionWrong: { borderColor: T.tileWrong, backgroundColor: 'rgba(254, 226, 226, 0.9)' },
  optionEmoji: { fontSize: 32 },
  optionLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
});

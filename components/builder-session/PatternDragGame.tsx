/**
 * Builder Session 7 — Game 3: Stripe Pattern Row
 * Complete the pattern: Red, Blue, Red → ?
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
import { BUILDER_SESSION, STRIPE_ROW_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PATTERN = ['red', 'blue', 'red'] as const;
const OPTIONS = [
  { id: 'red', label: 'Red', color: T.redDot },
  { id: 'blue', label: 'Blue', color: T.blueDot },
  { id: 'green', label: 'Green', color: T.greenDot },
];
const CORRECT_ID = 'blue';

const DOT_COLORS: Record<string, string> = {
  red: T.redDot,
  blue: T.blueDot,
  green: T.greenDot,
};

function OptionTile({
  label,
  color,
  onPress,
  state,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  state: 'idle' | 'wrong' | 'correct';
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
    if (state === 'correct') {
      scale.value = withSequence(withSpring(1.1, { damping: 6 }), withSpring(1, { damping: 10 }));
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : 'rgba(0,0,0,0.12)';

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.optionBtn,
          { backgroundColor: color, borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <Text style={styles.optionLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface PatternDragGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function PatternDragGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: PatternDragGameProps) {
  const [optionStates, setOptionStates] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({
    red: 'idle',
    blue: 'idle',
    green: 'idle',
  });
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Complete the pattern. Red, blue, red. What comes next?');
    return () => stopBuilderSpeech();
  }, []);

  const handleTap = useCallback(
    (id: string) => {
      if (locked) return;

      if (id === CORRECT_ID) {
        setOptionStates((s) => ({ ...s, [id]: 'correct' }));
        setLocked(true);
        speakBuilderHint('Correct! Blue comes next!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setOptionStates((s) => ({ ...s, [id]: 'wrong' }));
        speakBuilderHint('Try again. Red, blue, red. What is next?');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setOptionStates((s) => ({ ...s, [id]: 'idle' })), 700);
      }
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Pattern Complete!"
          subtitle="You finished the stripe row!"
          badgeEmoji="🔵"
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>

          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable
                onPress={() => speakBuilderHint('Red, blue, red. What color comes next?')}
              >
                <Text style={styles.prompt}>Complete the stripe 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.patternCard}>
          <Text style={styles.sectionLabel}>Pattern so far</Text>
          <View style={styles.patternRow}>
            {PATTERN.map((p, i) => (
              <View key={i} style={[styles.patternDot, { backgroundColor: DOT_COLORS[p] }]} />
            ))}
            <View style={styles.questionDot}>
              <Text style={styles.questionText}>?</Text>
            </View>
          </View>
        </View>

        <Text style={styles.chooseLabel}>Tap what comes next</Text>
        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <OptionTile
              key={opt.id}
              label={opt.label}
              color={opt.color}
              onPress={() => handleTap(opt.id)}
              state={optionStates[opt.id]}
              disabled={locked}
            />
          ))}
        </View>
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
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5, alignItems: 'center' },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
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
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    width: '100%',
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  patternCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: BUILDER_SESSION.radius.card,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patternDot: { width: 48, height: 48, borderRadius: 24 },
  questionDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: T.accentSoft,
    borderStyle: 'dashed',
  },
  questionText: { fontSize: 24, fontWeight: '800', color: '#9CA3AF' },
  chooseLabel: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '800',
    color: T.inkMuted,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  optionBtn: {
    width: 92,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 4,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.soft,
  },
  optionLabel: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});

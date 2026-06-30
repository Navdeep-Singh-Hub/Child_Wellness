/**
 * Builder Session 10 — Game 1: Master Quiz Arena
 * Choose the correct object. "Which one is a ball?"
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
import { BUILDER_SESSION, MASTER_QUIZ_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const OPTIONS = [
  { id: 'book', label: 'Book', emoji: '📚' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
  { id: 'cup', label: 'Cup', emoji: '🥤' },
];
const CORRECT_ID = 'ball';

function OptionTile({
  emoji,
  label,
  onPress,
  state,
  disabled,
}: {
  emoji: string;
  label: string;
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
      scale.value = withSequence(withSpring(1.12, { damping: 6 }), withSpring(1, { damping: 10 }));
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.optionBorder;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.optionTile,
          { borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.optionLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface MixedQuizGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function MixedQuizGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: MixedQuizGameProps) {
  const [tileStates, setTileStates] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({
    book: 'idle',
    ball: 'idle',
    cup: 'idle',
  });
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Which one is a ball? Look at each object and tap the ball.');
    return () => stopBuilderSpeech();
  }, []);

  const handleTap = useCallback(
    (id: string) => {
      if (locked) return;

      if (id === CORRECT_ID) {
        setTileStates((s) => ({ ...s, [id]: 'correct' }));
        setLocked(true);
        speakBuilderHint('Correct! You found the ball!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setTileStates((s) => ({ ...s, [id]: 'wrong' }));
        speakBuilderHint('Try again. Find the ball!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setTileStates((s) => ({ ...s, [id]: 'idle' })), 700);
      }
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Ball Found!"
          subtitle="You chose the correct object!"
          badgeEmoji="⚽"
          variant="sunset"
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
              <Pressable onPress={() => speakBuilderHint('Which one is a ball?')}>
                <Text style={styles.prompt}>Which one is a ball? 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>Find the</Text>
          <Text style={styles.targetEmoji}>⚽</Text>
          <Text style={styles.targetText}>BALL</Text>
        </View>

        <View style={styles.row}>
          {OPTIONS.map((opt) => (
            <OptionTile
              key={opt.id}
              emoji={opt.emoji}
              label={opt.label}
              onPress={() => handleTap(opt.id)}
              state={tileStates[opt.id]}
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
  targetCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: BUILDER_SESSION.radius.card,
    backgroundColor: T.targetGlow,
    borderWidth: 2,
    borderColor: T.accentSoft,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  targetEmoji: { fontSize: 52, marginVertical: 4 },
  targetText: { fontSize: 18, fontWeight: '900', color: T.accentDeep },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 20,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  optionTile: {
    width: 96,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: T.optionCard,
    borderWidth: 4,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.soft,
  },
  emoji: { fontSize: 44, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '800', color: T.ink },
});

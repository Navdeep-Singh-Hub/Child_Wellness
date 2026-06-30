/**
 * Grouper Session 4 — Game 2: Rhyme Pair Orchard
 * 3 rounds: cat→hat, pin→tin, sun→bun
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { MIXED_RHYME_PAIRS_THEME as T, GROUPER_SESSION } from '../grouperSessionTheme';
import { speakGrouperHint, speakGrouperWord, stopGrouperSpeech } from '../grouperSessionSpeech';
import { OasisOrchardBackground } from '../OasisOrchardBackground';

const ROUNDS = [
  {
    prompt: 'cat',
    promptEmoji: '🐱',
    correct: { id: 'hat', label: 'hat', emoji: '🎩' },
    wrong: [
      { id: 'dog', label: 'dog', emoji: '🐕' },
      { id: 'cup', label: 'cup', emoji: '🥤' },
    ],
    successHint: 'Correct! Hat rhymes with cat!',
  },
  {
    prompt: 'pin',
    promptEmoji: '📌',
    correct: { id: 'tin', label: 'tin', emoji: '🥫' },
    wrong: [
      { id: 'bat', label: 'bat', emoji: '🦇' },
      { id: 'run', label: 'run', emoji: '🏃' },
    ],
    successHint: 'Correct! Tin rhymes with pin!',
  },
  {
    prompt: 'sun',
    promptEmoji: '☀️',
    correct: { id: 'bun', label: 'bun', emoji: '🍞' },
    wrong: [
      { id: 'cat', label: 'cat', emoji: '🐱' },
      { id: 'pen', label: 'pen', emoji: '✏️' },
    ],
    successHint: 'Correct! Bun rhymes with sun!',
  },
] as const;

type ChoiceState = 'idle' | 'wrong' | 'correct';

function ChoiceTile({
  emoji,
  label,
  onPress,
  state,
  disabled,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
  state: ChoiceState;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
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
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.panelBorder;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.choice,
          { borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.choiceLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface RhymePairsGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function RhymePairsGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: RhymePairsGameProps) {
  const [round, setRound] = useState(0);
  const [tileState, setTileState] = useState<Record<string, ChoiceState>>({});
  const [locked, setLocked] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const currentRound = ROUNDS[round] ?? ROUNDS[0];
  const choices = useMemo(
    () =>
      [currentRound.correct, ...currentRound.wrong].sort(() => Math.random() - 0.5),
    [round]
  );

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakGrouperHint(`Find a word that rhymes with ${currentRound.prompt}.`);
    setTileState({});
    setLocked(false);
    return () => stopGrouperSpeech();
  }, [currentRound.prompt]);

  const handleTap = useCallback(
    (choice: { id: string; label: string; correct?: boolean }) => {
      if (locked) return;
      const isCorrect = choice.id === currentRound.correct.id;

      if (isCorrect) {
        setLocked(true);
        setTileState((s) => ({ ...s, [choice.id]: 'correct' }));
        speakGrouperHint(currentRound.successHint);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }

        if (round + 1 >= ROUNDS.length) {
          setCelebrating(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setTimeout(() => setRound((r) => r + 1), 900);
        }
      } else {
        setTileState((s) => ({ ...s, [choice.id]: 'wrong' }));
        speakGrouperHint('Try again. Listen for the same ending sound.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setTileState((s) => ({ ...s, [choice.id]: 'idle' })), 600);
      }
    },
    [currentRound, locked, onComplete, round]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Rhyme Pairs Complete!"
          subtitle="You matched every rhyme pair!"
          badgeEmoji="🎵"
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
      <OasisOrchardBackground />

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
          <View style={styles.roundPill}>
            <Text style={styles.roundPillText}>
              {round + 1}/{ROUNDS.length}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakGrouperHint(`What rhymes with ${currentRound.prompt}?`)}>
              <Text style={styles.prompt}>Find the rhyme 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <Pressable
          onPress={() => speakGrouperWord(currentRound.prompt)}
          style={({ pressed }) => [styles.promptCard, pressed && styles.pressed]}
        >
          <Text style={styles.promptEmoji}>{currentRound.promptEmoji}</Text>
          <Text style={styles.promptLabel}>Rhymes with</Text>
          <Text style={styles.promptWord}>{currentRound.prompt}</Text>
          <Text style={styles.replayHint}>🔊 Tap to hear</Text>
        </Pressable>

        <Text style={styles.chooseLabel}>Tap the word that rhymes:</Text>
        <View style={styles.choicesRow}>
          {choices.map((c) => (
            <ChoiceTile
              key={c.id}
              emoji={c.emoji}
              label={c.label}
              onPress={() => handleTap(c)}
              state={tileState[c.id] ?? 'idle'}
              disabled={locked}
            />
          ))}
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
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...GROUPER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5, alignItems: 'center' },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  roundPill: {
    backgroundColor: T.promptGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  roundPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    width: '100%',
    ...GROUPER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  playArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', gap: 16 },
  promptCard: {
    backgroundColor: T.promptGlow,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.accentSoft,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    ...GROUPER_SESSION.shadow.card,
  },
  promptEmoji: { fontSize: 44, marginBottom: 4 },
  promptLabel: { fontSize: 11, fontWeight: '800', color: T.inkMuted, textTransform: 'uppercase', letterSpacing: 1 },
  promptWord: { fontSize: 40, fontWeight: '900', color: T.accentDeep, marginVertical: 4 },
  replayHint: { fontSize: 12, fontWeight: '600', color: T.inkMuted },
  chooseLabel: { fontSize: 15, fontWeight: '700', color: T.inkMuted },
  choicesRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
  choice: {
    width: 96,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: T.panel,
    borderWidth: 4,
    alignItems: 'center',
    ...GROUPER_SESSION.shadow.soft,
  },
  emoji: { fontSize: 40, marginBottom: 6 },
  choiceLabel: { fontSize: 18, fontWeight: '900', color: T.ink },
});

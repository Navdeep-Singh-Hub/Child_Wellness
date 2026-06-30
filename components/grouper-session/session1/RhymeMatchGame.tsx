/**
 * Grouper Session 1 — Game 2: Rhyme Dune Echo
 * Find the word that rhymes with cat → bat
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
import { AT_RHYME_THEME as T, GROUPER_SESSION } from '../grouperSessionTheme';
import { speakGrouperHint, speakGrouperWord, stopGrouperSpeech } from '../grouperSessionSpeech';
import { DesertOasisBackground } from '../DesertOasisBackground';

const PROMPT = 'cat';
const CHOICES = [
  { id: 'bat', label: 'bat', emoji: '🦇', correct: true },
  { id: 'sun', label: 'sun', emoji: '☀️', correct: false },
  { id: 'pen', label: 'pen', emoji: '✏️', correct: false },
];

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

export interface RhymeMatchGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function RhymeMatchGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: RhymeMatchGameProps) {
  const choices = useMemo(() => [...CHOICES].sort(() => Math.random() - 0.5), []);
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({});
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakGrouperHint('Find a word that rhymes with cat.');
    return () => stopGrouperSpeech();
  }, []);

  const handleTap = useCallback(
    (choice: (typeof CHOICES)[number]) => {
      if (locked) return;
      if (choice.correct) {
        setLocked(true);
        setTileState((s) => ({ ...s, [choice.id]: 'correct' }));
        speakGrouperHint('Correct! Bat rhymes with cat!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setTileState((s) => ({ ...s, [choice.id]: 'wrong' }));
        speakGrouperHint('Try again. Listen for the same ending sound.');
        setTimeout(() => setTileState((s) => ({ ...s, [choice.id]: 'idle' })), 600);
      }
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Rhyme Found!"
          subtitle="Bat rhymes with cat!"
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
      <DesertOasisBackground />

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
            <Pressable onPress={() => speakGrouperHint('What rhymes with cat?')}>
              <Text style={styles.prompt}>Find the rhyme 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <Pressable
          onPress={() => speakGrouperWord(PROMPT)}
          style={({ pressed }) => [styles.promptCard, pressed && styles.pressed]}
        >
          <Text style={styles.promptLabel}>Rhymes with</Text>
          <Text style={styles.promptWord}>{PROMPT}</Text>
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
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
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

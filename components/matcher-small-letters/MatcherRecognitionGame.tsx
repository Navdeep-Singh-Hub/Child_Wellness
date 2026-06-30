/**
 * Game 2: Reef Letter Hunt — tap the correct lowercase letter among shell tiles.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { MATCHER_SESSION, REEF_HUNT_THEME as T } from './matcherSessionTheme';
import { speakMatcherHint, stopMatcherSpeech } from './matcherSessionSpeech';
import { OceanReefBackground } from './OceanReefBackground';

const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function ShellTile({
  letter,
  onPress,
  state,
  disabled,
}: {
  letter: string;
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
      scale.value = withSequence(
        withSpring(1.12, { damping: 6 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'correct' ? T.shellCorrect : state === 'wrong' ? T.shellWrong : T.shellBorder;
  const bg =
    state === 'correct'
      ? 'rgba(209, 250, 229, 0.95)'
      : state === 'wrong'
        ? 'rgba(254, 226, 226, 0.9)'
        : T.shell;

  return (
    <Animated.View style={[styles.shellWrap, animStyle]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.shell,
          { backgroundColor: bg, borderColor },
          pressed && !disabled && styles.pressed,
          disabled && styles.shellDisabled,
        ]}
        accessibilityLabel={`Letter ${letter}`}
      >
        <Text style={styles.shellEmoji}>🐚</Text>
        <Text style={styles.shellLetter}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function MatcherRecognitionGame({
  letters,
  sessionTitle,
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  letters: string[];
  sessionTitle?: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const rounds = Math.max(4, Math.min(6, letters.length + 2));
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct' | 'done'>('idle');
  const [picked, setPicked] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const target = letters[round % letters.length];
  const options = useMemo(() => {
    const pool = ALL_LETTERS.filter((x) => x !== target);
    return shuffle([target, ...shuffle(pool).slice(0, 3)]);
  }, [target, roundKey]);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const roundPct = Math.round(((round + (feedback === 'correct' || feedback === 'done' ? 1 : 0)) / rounds) * 100);

  const promptTarget = useCallback(() => {
    speakMatcherHint(`Find the letter ${target}. Tap the shell with ${target}.`);
  }, [target]);

  useEffect(() => {
    setFeedback('idle');
    setPicked(null);
    promptTarget();
    return () => stopMatcherSpeech();
  }, [round, roundKey, promptTarget]);

  const advanceRound = useCallback(() => {
    if (round >= rounds - 1) {
      setCelebrating(true);
      speakMatcherHint('Amazing! You found every letter!');
      setTimeout(() => onComplete(), 2200);
      return;
    }
    setRound((r) => r + 1);
    setRoundKey((k) => k + 1);
    setFeedback('idle');
    setPicked(null);
  }, [onComplete, round, rounds]);

  const handlePick = (choice: string) => {
    if (feedback === 'correct' || feedback === 'done') return;

    setPicked(choice);
    if (choice !== target) {
      setFeedback('wrong');
      speakMatcherHint('Not that shell. Try again!');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        setFeedback('idle');
        setPicked(null);
      }, 700);
      return;
    }

    setFeedback('correct');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      setFeedback('done');
      setTimeout(advanceRound, 400);
    }, 550);
  };

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Hunt Complete!"
          subtitle="Your eyes are sharp as a dolphin!"
          badgeEmoji="🦑"
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
      <OceanReefBackground />

      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <View style={styles.roundPill}>
            <Text style={styles.roundPillText}>
              Round {round + 1}/{rounds}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
      </View>

      <View style={styles.targetCard}>
        <View style={styles.targetLeft}>
          <Text style={styles.targetEmoji}>🗺️</Text>
          <View>
            <Text style={styles.targetLabel}>Find this letter</Text>
            <Text style={styles.targetLetter}>{target}</Text>
          </View>
        </View>
        <Pressable onPress={promptTarget} style={styles.replayBtn} accessibilityLabel="Hear letter again">
          <Ionicons name="volume-high" size={22} color={T.accentDeep} />
        </Pressable>
      </View>

      <View style={styles.mascotRow}>
        <Text style={styles.mascot}>{T.mascot}</Text>
        <Text style={styles.mascotHint}>
          {feedback === 'wrong'
            ? 'Oops! Peek at the map and try another shell.'
            : feedback === 'correct'
              ? 'Yes! That is the right letter!'
              : `${T.mascotName} says: Tap the shell hiding "${target}".`}
        </Text>
      </View>

      <View style={styles.shellGrid}>
        {options.map((letter) => (
          <ShellTile
            key={`${roundKey}-${letter}`}
            letter={letter}
            onPress={() => handlePick(letter)}
            state={
              picked === letter
                ? feedback === 'wrong'
                  ? 'wrong'
                  : feedback === 'correct' || feedback === 'done'
                    ? 'correct'
                    : 'idle'
                : 'idle'
            }
            disabled={feedback === 'correct' || feedback === 'done'}
          />
        ))}
      </View>

      <View style={styles.treasureMeter}>
        <View style={styles.treasureHeader}>
          <Text style={styles.treasureLabel}>Treasure Found</Text>
          <Text style={styles.treasurePct}>{roundPct}%</Text>
        </View>
        <View style={styles.treasureTrack}>
          <LinearGradient
            colors={[T.treasureSoft, T.treasure, '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.treasureFill, { width: `${roundPct}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

const SHELL = 132;

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'web' ? 12 : 48,
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.shellBorder,
    zIndex: 10,
    ...MATCHER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.shellBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.inkMuted },
  roundPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.accentSoft,
  },
  roundPillText: { fontSize: 13, fontWeight: '900', color: T.accent },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 2 },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: T.targetCard,
    borderWidth: 2,
    borderColor: T.treasureSoft,
    ...MATCHER_SESSION.shadow.soft,
  },
  targetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  targetEmoji: { fontSize: 32 },
  targetLabel: { fontSize: 11, fontWeight: '800', color: T.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  targetLetter: { fontSize: 48, fontWeight: '900', color: T.accent, lineHeight: 52 },
  replayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(204, 251, 241, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.shellBorder,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.shellBorder,
  },
  mascot: { fontSize: 28 },
  mascotHint: { flex: 1, fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  shellGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 5,
  },
  shellWrap: { width: SHELL, height: SHELL },
  shell: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...MATCHER_SESSION.shadow.card,
  },
  shellDisabled: { opacity: 0.85 },
  shellEmoji: { fontSize: 22, marginBottom: 2 },
  shellLetter: { fontSize: 46, fontWeight: '900', color: T.accentDeep },
  treasureMeter: {
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 28 : 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: T.treasureSoft,
    ...MATCHER_SESSION.shadow.soft,
  },
  treasureHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  treasureLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  treasurePct: { fontSize: 15, fontWeight: '900', color: T.treasure },
  treasureTrack: { height: 14, backgroundColor: '#CCFBF1', borderRadius: 7, overflow: 'hidden' },
  treasureFill: { height: '100%', borderRadius: 7 },
});

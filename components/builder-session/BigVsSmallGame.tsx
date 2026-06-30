/**
 * Builder Session 3 — Game 2: Summit Scale Cliff
 * Tap the bigger object each round.
 */
import React, { useCallback, useEffect, useState } from 'react';
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
import { BUILDER_SESSION, SCALE_CLIFF_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PAIRS = [
  { big: { emoji: '🔴', label: 'Big circle' }, small: { emoji: '🔵', label: 'Small circle' } },
  { big: { emoji: '🐘', label: 'Big elephant' }, small: { emoji: '🐜', label: 'Small ant' } },
  { big: { emoji: '🏠', label: 'Big house' }, small: { emoji: '🐦', label: 'Small bird' } },
];

function ScaleTile({
  emoji,
  size,
  onPress,
  state,
  disabled,
}: {
  emoji: string;
  size: 'big' | 'small';
  onPress: () => void;
  state: 'idle' | 'wrong' | 'correct';
  disabled: boolean;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

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
  }, [state, shake, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const borderColor =
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.panelBorder;
  const bg =
    state === 'correct'
      ? 'rgba(220, 252, 231, 0.95)'
      : state === 'wrong'
        ? 'rgba(254, 226, 226, 0.9)'
        : T.panel;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.tile,
          size === 'big' ? styles.tileBig : styles.tileSmall,
          { backgroundColor: bg, borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={size === 'big' ? 'Bigger object' : 'Smaller object'}
      >
        <Text style={size === 'big' ? styles.emojiBig : styles.emojiSmall}>{emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface BigVsSmallGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function BigVsSmallGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: BigVsSmallGameProps) {
  const [round, setRound] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [leftState, setLeftState] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [rightState, setRightState] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const pair = PAIRS[round];
  const swap = round % 2 === 1;
  const left = swap ? pair.small : pair.big;
  const right = swap ? pair.big : pair.small;
  const leftIsBig = left === pair.big;

  useEffect(() => {
    speakBuilderHint('Tap the bigger object on the scale cliff!');
    return () => stopBuilderSpeech();
  }, [round]);

  const handleTap = useCallback(
    (isRight: boolean) => {
      if (locked) return;
      const tappedBig = isRight ? !leftIsBig : leftIsBig;

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      if (tappedBig) {
        setLocked(true);
        if (isRight) setRightState('correct');
        else setLeftState('correct');
        speakBuilderHint('Correct! That one is bigger!');

        if (round + 1 >= PAIRS.length) {
          setCelebrating(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setTimeout(() => {
            setRound((r) => r + 1);
            setLeftState('idle');
            setRightState('idle');
            setLocked(false);
          }, 700);
        }
      } else {
        if (isRight) setRightState('wrong');
        else setLeftState('wrong');
        speakBuilderHint('Try again. Tap the bigger one!');
        setTimeout(() => {
          setLeftState('idle');
          setRightState('idle');
        }, 500);
      }
    },
    [leftIsBig, locked, onComplete, round]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Scale Master!"
          subtitle="You spotted the bigger object every time!"
          badgeEmoji="📏"
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

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.roundPill}>
            <Text style={styles.roundPillText}>
              Round {round + 1}/{PAIRS.length}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint('Tap the bigger object!')}>
              <Text style={styles.prompt}>Tap the BIGGER one 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.cliffArea}>
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Which is bigger?</Text>
          <View style={styles.row}>
            <ScaleTile
              emoji={left.emoji}
              size={left === pair.big ? 'big' : 'small'}
              onPress={() => handleTap(false)}
              state={leftState}
              disabled={locked}
            />
            <Text style={styles.vs}>VS</Text>
            <ScaleTile
              emoji={right.emoji}
              size={right === pair.big ? 'big' : 'small'}
              onPress={() => handleTap(true)}
              state={rightState}
              disabled={locked}
            />
          </View>
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
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  roundPill: {
    backgroundColor: 'rgba(254, 243, 199, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
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
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  cliffArea: { flex: 1, paddingHorizontal: 20, paddingTop: 12, justifyContent: 'center' },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 20,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  panelLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: T.ink,
    marginBottom: 20,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  vs: { fontSize: 16, fontWeight: '900', color: T.accentDeep, marginBottom: 40 },
  tile: {
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSmall: { width: 88, height: 88 },
  tileBig: { width: 128, height: 128 },
  emojiSmall: { fontSize: 42 },
  emojiBig: { fontSize: 62 },
});

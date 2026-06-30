/**
 * Builder Session 9 — Game 2: Star Tally Night
 * Count 4 stars and pick the correct number.
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
import { BUILDER_SESSION, STAR_TALLY_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const STAR_COUNT = 4;
const OPTIONS = [3, 4, 5];

function NumberTile({
  num,
  onPress,
  state,
  disabled,
}: {
  num: number;
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
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.panelBorder;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.numTile,
          { borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={`Number ${num}`}
      >
        <Text style={styles.numText}>{num}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface CountingGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function CountingGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: CountingGameProps) {
  const [tileStates, setTileStates] = useState<Record<number, 'idle' | 'wrong' | 'correct'>>({
    3: 'idle',
    4: 'idle',
    5: 'idle',
  });
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('How many stars? Count them carefully, then tap the number.');
    return () => stopBuilderSpeech();
  }, []);

  const handleTap = useCallback(
    (num: number) => {
      if (locked) return;

      if (num === STAR_COUNT) {
        setTileStates((s) => ({ ...s, [num]: 'correct' }));
        setLocked(true);
        speakBuilderHint('Correct! Four stars!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setTileStates((s) => ({ ...s, [num]: 'wrong' }));
        speakBuilderHint('Try again. Count the stars carefully.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setTileStates((s) => ({ ...s, [num]: 'idle' })), 700);
      }
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Stars Counted!"
          subtitle="You counted all four stars!"
          badgeEmoji="⭐"
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
              <Pressable onPress={() => speakBuilderHint('Count the stars and tap the number.')}>
                <Text style={styles.prompt}>How many stars? 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.skyCard}>
          <Text style={styles.skyLabel}>Night sky</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: STAR_COUNT }, (_, i) => (
              <Text key={i} style={styles.star}>
                ⭐
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.chooseLabel}>Tap the number</Text>
        <View style={styles.optionsRow}>
          {OPTIONS.map((num) => (
            <NumberTile
              key={num}
              num={num}
              onPress={() => handleTap(num)}
              state={tileStates[num]}
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.ink },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5, alignItems: 'center' },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
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
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  skyCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 20,
    borderRadius: BUILDER_SESSION.radius.card,
    backgroundColor: T.starGlow,
    borderWidth: 2,
    borderColor: T.accentSoft,
    alignItems: 'center',
  },
  skyLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  starsRow: { flexDirection: 'row', gap: 14 },
  star: { fontSize: 40 },
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
    gap: 16,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  numTile: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 36, fontWeight: '900', color: T.ink },
});

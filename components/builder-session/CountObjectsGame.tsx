/**
 * Builder Session 5 — Game 2: Orchard Tally Grove
 * Count apples and choose the correct number.
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
import { BUILDER_SESSION, ORCHARD_COUNT_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const OPTIONS = ['2', '3', '4'];
const CORRECT = '3';
const OBJECT_LABEL = 'apples';
const DISPLAY = '🍎🍎🍎';

function NumberTile({
  num,
  onPress,
  state,
  disabled,
}: {
  num: string;
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
          styles.numTile,
          { backgroundColor: bg, borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={`Number ${num}`}
      >
        <Text style={styles.numText}>{num}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface CountObjectsGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function CountObjectsGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: CountObjectsGameProps) {
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({});
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Count the apples in the grove and choose the right number!');
    return () => stopBuilderSpeech();
  }, []);

  const handleTap = useCallback(
    (num: string) => {
      if (locked) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      if (num === CORRECT) {
        setLocked(true);
        setTileState((s) => ({ ...s, [num]: 'correct' }));
        speakBuilderHint(`Correct! ${CORRECT} apples!`);
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
        return;
      }

      setTileState((s) => ({ ...s, [num]: 'wrong' }));
      speakBuilderHint('Try again. Count the apples carefully.');
      setTimeout(() => setTileState((s) => ({ ...s, [num]: 'idle' })), 500);
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Count Complete!"
          subtitle={`You counted ${CORRECT} ${OBJECT_LABEL}!`}
          badgeEmoji="🍎"
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

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint('How many apples do you see?')}>
              <Text style={styles.prompt}>How many apples? 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.panel}>
          <View style={styles.display}>
            <Text style={styles.displayEmoji}>{DISPLAY}</Text>
            <Text style={styles.question}>How many {OBJECT_LABEL}?</Text>
          </View>

          <View style={styles.optionsRow}>
            {OPTIONS.map((num) => (
              <NumberTile
                key={num}
                num={num}
                onPress={() => handleTap(num)}
                state={tileState[num] ?? 'idle'}
                disabled={locked}
              />
            ))}
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
  playArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 20,
    alignItems: 'center',
    gap: 20,
    ...BUILDER_SESSION.shadow.card,
  },
  display: {
    backgroundColor: T.display,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: T.displayBorder,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  displayEmoji: { fontSize: 36, letterSpacing: 8, marginBottom: 10 },
  question: { fontSize: 18, fontWeight: '800', color: T.ink },
  optionsRow: { flexDirection: 'row', gap: 16 },
  numTile: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 32, fontWeight: '900', color: T.accentDeep },
});

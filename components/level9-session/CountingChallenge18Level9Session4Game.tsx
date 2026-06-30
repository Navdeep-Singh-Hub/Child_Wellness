/**
 * Level 9 (Clockwise) — Session 4, Game 1: Counting Challenge
 * Count 18 stars. Tap the correct number.
 */
import { ClockwiseGameShell } from '@/components/level9-session/shared/ClockwiseGameShell';
import { CW } from '@/components/level9-session/shared/clockwiseTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const STAR_COUNT = 18;
const OPTIONS = [16, 17, 18, 19] as const;

const VOICE = 'How many stars? Count the stars, then tap the number.';
const PALETTE = { accent: '#F59E0B', glow: '#FCD34D', secondary: '#FBBF24' } as const;

function TwinkleStar({ index }: { index: number }) {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 + (index % 4) * 150 }),
        withTiming(0, { duration: 700 + (index % 4) * 150 }),
      ),
      -1,
      true,
    );
  }, [index, twinkle]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.55 + twinkle.value * 0.45,
    transform: [{ scale: 0.9 + twinkle.value * 0.12 }],
  }));

  return (
    <Animated.View style={anim}>
      <Text style={styles.star}>⭐</Text>
    </Animated.View>
  );
}

function CountOrb({
  num,
  selected,
  feedback,
  onPress,
}: {
  num: number;
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.08, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? CW.good
      : feedback === 'wrong' && selected
        ? CW.warn
        : selected
          ? PALETTE.glow
          : CW.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={`Number ${num}`}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}44`, 'rgba(8,12,40,0.55)']}
          style={styles.orbGrad}
        />
        <Text style={styles.orbNum}>{num}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface CountingChallenge18Level9Session4GameProps {
  onComplete: () => void;
}

export function CountingChallenge18Level9Session4Game({ onComplete }: CountingChallenge18Level9Session4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (num: number) => {
      if (feedback === 'correct') return;
      setSelected(num);
      setAttempts((a) => a + 1);

      if (num === STAR_COUNT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Eighteen stars!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          num < STAR_COUNT ? 'That is too few. Count every star!' : 'That is too many. Count again!',
          0.7,
        );
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  const coachLine =
    attempts === 0
      ? 'Point to each star as you count — one, two, three…'
      : 'Count slowly: there are exactly eighteen stars!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You counted 18 stars!"
        badgeEmoji="⭐"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="COUNTING CHALLENGE · GAME 1"
      title="How many stars?"
      instruction="Count the stars in the field, then tap the correct number."
      mascot="✨"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.fieldFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.fieldGlow}
        />
        <Text style={styles.fieldLabel}>STAR FORGE FIELD · 18 STARS</Text>
        <View style={styles.starsWrap}>
          {Array.from({ length: STAR_COUNT }, (_, i) => (
            <TwinkleStar key={i} index={i} />
          ))}
        </View>
        <Text style={styles.fieldHint}>Count each ⭐ one at a time</Text>
      </View>

      <Text style={styles.prompt}>Tap the total</Text>

      <View style={styles.choicesRow}>
        {OPTIONS.map((num) => (
          <CountOrb
            key={num}
            num={num}
            selected={selected === num}
            feedback={feedback}
            onPress={() => handleTap(num)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>
          {attempts === 0 ? 'Options: 16 · 17 · 18 · 19' : `Attempts: ${attempts}`}
        </Text>
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  fieldFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 18,
    overflow: 'hidden',
  },
  fieldGlow: { ...StyleSheet.absoluteFillObject },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  starsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'center',
    maxWidth: 300,
    alignSelf: 'center',
    marginBottom: 10,
  },
  star: { fontSize: 22 },
  fieldHint: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.glow,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  orb: {
    minWidth: 68,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2.5,
    backgroundColor: 'rgba(8,12,40,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbGrad: { ...StyleSheet.absoluteFillObject },
  orbNum: { fontSize: 28, fontWeight: '900', color: PALETTE.glow },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});

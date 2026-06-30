/**
 * Level 9 (Clockwise) — Session 6, Game 4: Counting Challenge
 * Count 20 objects. Tap the correct number.
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

const OBJECT_COUNT = 20;
const OPTIONS = [18, 19, 20, 21] as const;

const VOICE = 'How many objects? Count them, then tap the number.';
const PALETTE = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

function TwinkleDot({ index }: { index: number }) {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650 + (index % 5) * 120 }),
        withTiming(0, { duration: 650 + (index % 5) * 120 }),
      ),
      -1,
      true,
    );
  }, [index, twinkle]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.5 + twinkle.value * 0.5,
    transform: [{ scale: 0.85 + twinkle.value * 0.2 }],
  }));

  return (
    <Animated.View style={[styles.dot, anim]}>
      <View style={styles.dotCore} />
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

export interface CountingChallenge20Level9Session6GameProps {
  onComplete: () => void;
}

export function CountingChallenge20Level9Session6Game({
  onComplete,
}: CountingChallenge20Level9Session6GameProps) {
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

      if (num === OBJECT_COUNT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Twenty objects!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          num < OBJECT_COUNT
            ? 'Too few — count every dot one by one!'
            : 'Too many — slow down and count again!',
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
      ? 'Point to each glowing dot as you count — one, two, three…'
      : 'There are exactly twenty dots in the census field!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Star Census!"
        subtitle="You counted 20 objects!"
        badgeEmoji="🔵"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="STAR CENSUS · GAME 4"
      title="How many objects?"
      instruction="Count the dots in the field, then tap the correct number."
      mascot="🔵"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.fieldFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.mint}22`]}
          style={styles.fieldGlow}
        />
        <Text style={styles.fieldLabel}>CENSUS FIELD · COUNT THE DOTS</Text>
        <View style={styles.dotsWrap}>
          {Array.from({ length: OBJECT_COUNT }, (_, i) => (
            <TwinkleDot key={i} index={i} />
          ))}
        </View>
        <Text style={styles.fieldHint}>Count each dot one at a time</Text>
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
          {attempts === 0 ? 'Options: 18 · 19 · 20 · 21' : `Attempts: ${attempts}`}
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
  dotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    maxWidth: 300,
    alignSelf: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PALETTE.mint,
    borderWidth: 2,
    borderColor: PALETTE.glow,
  },
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
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});

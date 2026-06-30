/**
 * Level 7 Reader — Session 6, Game 4: Dot Census
 * Count 15 dots; user taps the correct number.
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
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

const DOT_COUNT = 15;
const OPTIONS = [13, 14, 15, 16] as const;

const VOICE = 'How many dots? Count the dots, then tap the number.';
const CENSUS = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

function PulseDot({ index }: { index: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650 + (index % 5) * 120 }),
        withTiming(0, { duration: 650 + (index % 5) * 120 }),
      ),
      -1,
      true,
    );
  }, [index, pulse]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
    transform: [{ scale: 0.85 + pulse.value * 0.2 }],
  }));

  return (
    <Animated.View style={[styles.dotWrap, anim]}>
      <View style={styles.dotCore} />
      <View style={styles.dotRing} />
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
      ? RD.good
      : feedback === 'wrong' && selected
        ? RD.warn
        : selected
          ? CENSUS.glow
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={`Number ${num}`}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${CENSUS.accent}22` }]} />
        <Text style={styles.orbNum}>{num}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface CountingChallenge15ReaderSession6GameProps {
  onComplete: () => void;
}

export function CountingChallenge15ReaderSession6Game({ onComplete }: CountingChallenge15ReaderSession6GameProps) {
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

      if (num === DOT_COUNT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Fifteen dots!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          num < DOT_COUNT ? 'That is too few. Count every dot!' : 'That is too many. Count again!',
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
      ? 'Point to each dot as you count — one, two, three…'
      : 'Count slowly: there are exactly fifteen dots!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Dot Census!"
        subtitle="You counted 15 dots!"
        badgeEmoji="🔵"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="DOT CENSUS · GAME 4"
      title="How many dots?"
      instruction="Count the dots in the field, then tap the correct number."
      mascot="🔵"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.fieldFrame}>
        <LinearGradient
          colors={[`${CENSUS.accent}33`, 'transparent', `${CENSUS.mint}22`]}
          style={styles.fieldGlow}
        />
        <Text style={styles.fieldLabel}>DOT FIELD</Text>
        <View style={styles.dotsWrap}>
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <PulseDot key={i} index={i} />
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
          {attempts === 0 ? 'Options: 13 · 14 · 15 · 16' : `Attempts: ${attempts}`}
        </Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  fieldFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${CENSUS.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
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
    color: CENSUS.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  dotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    maxWidth: 280,
    alignSelf: 'center',
    marginBottom: 10,
  },
  dotWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: CENSUS.glow,
  },
  dotRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: `${CENSUS.mint}66`,
  },
  fieldHint: {
    fontSize: 12,
    fontWeight: '700',
    color: CENSUS.glow,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: RD.textLight,
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
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbNum: { fontSize: 28, fontWeight: '900', color: CENSUS.glow },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: `${CENSUS.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: CENSUS.glow, textAlign: 'center' },
});

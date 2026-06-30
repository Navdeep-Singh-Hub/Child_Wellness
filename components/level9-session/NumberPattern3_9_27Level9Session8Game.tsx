/**
 * Level 9 (Clockwise) — Session 8, Game 2: Power Ladder
 * 3, 9, 27, ? → 81 (multiply by 3 each time).
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

const PATTERN = [3, 9, 27] as const;
const OPTIONS = [54, 81, 90, 108] as const;
const CORRECT = 81;

const VOICE = 'What number comes next? 3, 9, 27. Multiply by 3 each time.';
const POWER = { accent: '#0EA5E9', glow: '#38BDF8', spark: '#EF4444' } as const;

function RungCell({ value, index }: { value: number; index: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 + index * 120 }),
        withTiming(0, { duration: 900 + index * 120 }),
      ),
      -1,
      true,
    );
  }, [drift, index]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.2 + drift.value * 0.35,
    transform: [{ scale: 1 + drift.value * 0.06 }],
  }));

  return (
    <View style={styles.rungWrap}>
      <Animated.View style={[styles.rungGlow, glow, { backgroundColor: `${POWER.accent}44` }]} />
      <View style={[styles.rung, { borderColor: `${POWER.glow}88` }]}>
        <Text style={styles.rungNum}>{value}</Text>
        <Text style={styles.rungIdx}>P{index + 1}</Text>
      </View>
    </View>
  );
}

function VoidRung() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })),
      -1,
      true,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    borderColor: `rgba(14,165,233,${0.4 + pulse.value * 0.5})`,
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.voidRung, anim]}>
      <LinearGradient colors={[`${POWER.accent}55`, 'rgba(11,10,26,0.6)']} style={styles.voidGrad} />
      <Text style={styles.voidQ}>?</Text>
      <Text style={styles.voidLbl}>NEXT</Text>
    </Animated.View>
  );
}

function NumberOrb({
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
          ? POWER.glow
          : CW.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={`Number ${num}`}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${POWER.accent}22` }]} />
        <Text style={styles.orbNum}>{num}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface NumberPattern3_9_27Level9Session8GameProps {
  onComplete: () => void;
}

export function NumberPattern3_9_27Level9Session8Game({ onComplete }: NumberPattern3_9_27Level9Session8GameProps) {
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

      if (num === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! 81 comes next!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          num === 54
            ? 'Close! That is only double 27. Multiply by 3!'
            : num === 90
              ? 'That is plus 9. Each step multiplies by 3!'
              : num === 108
                ? 'That is 27 plus 81. Each step multiplies by 3!'
                : 'Try again. 3 times 3 is 9, 9 times 3 is 27. What is 27 times 3?',
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
      ? 'Each rung triples — what is 27 times 3?'
      : 'Say it aloud: 3 — 9 — 27 — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Power Ladder!"
        subtitle="You found the tripling pattern — 81!"
        badgeEmoji="🔢"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="POWER LADDER · GAME 2"
      title="What comes next?"
      instruction="3, 9, 27, ? — multiply by 3 each time. Tap the next number."
      mascot="🔢"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.ladderWrap}>
        <LinearGradient
          colors={[`${POWER.accent}44`, 'transparent', `${POWER.spark}33`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ladderGlow}
        />
        <Text style={styles.ladderLabel}>POWER LADDER</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((n, i) => (
            <RungCell key={i} value={n} index={i} />
          ))}
          <VoidRung />
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepArrow}>×3</Text>
          <Text style={styles.stepArrow}>×3</Text>
          <Text style={styles.stepArrow}>×3</Text>
        </View>
      </View>

      <Text style={styles.prompt}>Tap the next number</Text>

      <View style={styles.choicesRow}>
        {OPTIONS.map((num) => (
          <NumberOrb
            key={num}
            num={num}
            selected={selected === num}
            feedback={feedback}
            onPress={() => handleTap(num)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Rule: multiply by 3 each step · 3 → 9 → 27 → ?</Text>
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  ladderWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${POWER.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.55)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  ladderGlow: { ...StyleSheet.absoluteFillObject },
  ladderLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: POWER.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 42,
    marginTop: 10,
  },
  stepArrow: { fontSize: 11, fontWeight: '900', color: POWER.glow, opacity: 0.85 },
  rungWrap: { alignItems: 'center' },
  rungGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  rung: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rungNum: { fontSize: 26, fontWeight: '900', color: CW.textLight },
  rungIdx: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 8,
    fontWeight: '900',
    color: CW.textMuted,
  },
  voidRung: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  voidGrad: { ...StyleSheet.absoluteFillObject },
  voidQ: { fontSize: 26, fontWeight: '900', color: POWER.glow },
  voidLbl: { fontSize: 7, fontWeight: '900', color: CW.textMuted, letterSpacing: 0.8, marginTop: 2 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 18,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  orb: {
    minWidth: 72,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbNum: { fontSize: 28, fontWeight: '900', color: POWER.glow },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderWidth: 1,
    borderColor: `${POWER.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: POWER.glow, textAlign: 'center' },
});

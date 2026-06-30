/**
 * Level 9 (Clockwise) — Session 2, Game 1: Number Pattern
 * 2, 6, 10, 14, ? → 18 (+4 each time).
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

const PATTERN = [2, 6, 10, 14] as const;
const OPTIONS = [16, 17, 18, 19] as const;
const CORRECT = 18;

const VOICE = 'What number comes next? 2, 6, 10, 14. Add 4 each time.';
const PALETTE = { accent: '#0891B2', glow: '#67E8F9', secondary: '#22D3EE' } as const;

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
      <Animated.View style={[styles.rungGlow, glow]} />
      <View style={[styles.rung, { borderColor: `${PALETTE.glow}88` }]}>
        <Text style={styles.rungNum}>{value}</Text>
        {index < PATTERN.length - 1 ? (
          <Text style={styles.rungStep}>+4</Text>
        ) : null}
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
    borderColor: `rgba(103,232,249,${0.4 + pulse.value * 0.5})`,
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.voidRung, anim]}>
      <LinearGradient colors={[`${PALETTE.accent}55`, 'rgba(8,12,40,0.6)']} style={styles.voidGrad} />
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
          ? PALETTE.glow
          : CW.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={`Number ${num}`}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${PALETTE.accent}22` }]} />
        <Text style={styles.orbNum}>{num}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface NumberPatternLevel9Session2GameProps {
  onComplete: () => void;
}

export function NumberPatternLevel9Session2Game({ onComplete }: NumberPatternLevel9Session2GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

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

      if (num === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! 18 comes next!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. 2, 6, 10, 14 — add 4 each time.', 0.7);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You found the pattern!"
        badgeEmoji="🔢"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="NUMBER PATTERN · GAME 1"
      title="Find the next number"
      instruction="2, 6, 10, 14, ? — add 4 each time. Tap the next number."
      mascot="🔢"
      coachLine="Each step adds four — what comes after fourteen?"
      onReplayVoice={playVoice}
    >
      <View style={styles.ladderFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.ladderGlow}
        />
        <Text style={styles.frameLabel}>ORBIT NUMBER LADDER</Text>

        <View style={styles.ruleRow}>
          <Text style={styles.ruleText}>+4</Text>
          <Text style={styles.ruleArrow}>each step</Text>
        </View>

        <View style={styles.ladderRow}>
          {PATTERN.map((n, i) => (
            <React.Fragment key={i}>
              <RungCell value={n} index={i} />
              {i < PATTERN.length - 1 && <Text style={styles.connector}>→</Text>}
            </React.Fragment>
          ))}
          <Text style={styles.connector}>→</Text>
          <VoidRung />
        </View>

        <Text style={styles.prompt}>Tap the next number</Text>

        <View style={styles.optionsRow}>
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
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  ladderFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  ladderGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 12,
    textAlign: 'center',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
    backgroundColor: 'rgba(8,145,178,0.15)',
  },
  ruleText: { fontSize: 18, fontWeight: '900', color: PALETTE.glow },
  ruleArrow: { fontSize: 13, fontWeight: '700', color: CW.textLight },
  ladderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 18,
  },
  connector: { fontSize: 16, fontWeight: '900', color: PALETTE.glow },
  rungWrap: { alignItems: 'center' },
  rungGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${PALETTE.accent}44`,
  },
  rung: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(8,12,40,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rungNum: { fontSize: 22, fontWeight: '900', color: CW.textLight },
  rungStep: { fontSize: 9, fontWeight: '800', color: PALETTE.glow, marginTop: 2 },
  voidRung: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voidGrad: { ...StyleSheet.absoluteFillObject },
  voidQ: { fontSize: 24, fontWeight: '900', color: PALETTE.glow },
  voidLbl: { fontSize: 8, fontWeight: '900', color: CW.textMuted, letterSpacing: 1 },
  prompt: {
    fontSize: 16,
    fontWeight: '800',
    color: CW.textLight,
    marginBottom: 14,
    textAlign: 'center',
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  orb: {
    minWidth: 64,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(8,12,40,0.75)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orbHalo: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  orbNum: { fontSize: 24, fontWeight: '900', color: CW.textLight },
  pressed: { opacity: 0.88 },
});

/**
 * Level 9 (Clockwise) — Session 9, Game 3: Word Dock
 * Letters H, O, S, P, I, T, A, L — user builds "HOSPITAL".
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

const TARGET = ['H', 'O', 'S', 'P', 'I', 'T', 'A', 'L'] as const;
const LETTERS = ['L', 'A', 'H', 'O', 'S', 'P', 'I', 'T'] as const;
const WORD = 'HOSPITAL';

const VOICE = 'Build the word HOSPITAL. Tap the letters in order.';
const PALETTE = { accent: '#7C3AED', glow: '#C4B5FD', secondary: '#2DD4BF', medical: '#34D399' } as const;

function DockSlot({
  letter,
  index,
  filled,
  active,
}: {
  letter: string;
  index: number;
  filled: boolean;
  active: boolean;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active && !filled) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 650 }), withTiming(0, { duration: 650 })),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [active, filled, pulse]);

  const anim = useAnimatedStyle(() => ({
    borderColor:
      active && !filled
        ? `rgba(124,58,237,${0.5 + pulse.value * 0.45})`
        : filled
          ? `${CW.good}99`
          : CW.glassBorder,
    transform: [{ scale: active && !filled ? 1 + pulse.value * 0.06 : filled ? 1.02 : 1 }],
  }));

  return (
    <Animated.View style={[styles.slot, anim, filled && styles.slotFilled]}>
      {filled ? (
        <>
          <View style={styles.slotGlow} />
          <Text style={styles.slotLetter}>{letter}</Text>
        </>
      ) : (
        <>
          <Text style={styles.slotIdx}>{index + 1}</Text>
          <Text style={styles.slotQ}>?</Text>
        </>
      )}
    </Animated.View>
  );
}

function CargoLetter({
  letter,
  index,
  shake,
  onPress,
}: {
  letter: string;
  index: number;
  shake: boolean;
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      scale.value = withSequence(withTiming(0.94, { duration: 80 }), withSpring(1, { damping: 10 }));
    }
  }, [shake, shakeX, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.crate, pressed && styles.cratePressed]}
        accessibilityLabel={`Letter ${letter}`}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}88`, `${PALETTE.secondary}44`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.crateGrad}
        />
        <Text style={styles.crateLetter}>{letter}</Text>
        <Text style={styles.crateMark}>◆</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface WordBuilderHospitalLevel9Session9GameProps {
  onComplete: () => void;
}

export function WordBuilderHospitalLevel9Session9Game({
  onComplete,
}: WordBuilderHospitalLevel9Session9GameProps) {
  const [nextIndex, setNextIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongTapIndex, setWrongTapIndex] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleLetterTap = useCallback(
    (letter: string, tapIndex: number) => {
      const expected = TARGET[nextIndex];
      setAttempts((a) => a + 1);

      if (letter === expected) {
        setWrongTapIndex(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        speak(letter, 0.5);
        if (newIndex >= TARGET.length) {
          speak('Hospital! You built HOSPITAL!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        }
      } else {
        setWrongTapIndex(tapIndex);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap H, then O, S, P, I, T, A, L.', 0.7);
        setTimeout(() => setWrongTapIndex(null), 700);
      }
    },
    [nextIndex, onComplete],
  );

  const coachLine =
    nextIndex === 0
      ? 'Spell HOSPITAL: start with H, then O, S, P, I, T, A, L!'
      : nextIndex < TARGET.length
        ? `Next letter: ${TARGET[nextIndex]} — ${TARGET.length - nextIndex} to go!`
        : 'Word complete!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Word Dock!"
        subtitle="You built HOSPITAL! 🏥"
        badgeEmoji="🏥"
      />
    );
  }

  const progressPct = (nextIndex / TARGET.length) * 100;

  return (
    <ClockwiseGameShell
      studio="WORD DOCK · GAME 3"
      title="Build HOSPITAL"
      instruction="Tap the letter crates in order to spell HOSPITAL."
      mascot="🏥"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetEmoji}>🏥</Text>
        </View>
        <View>
          <Text style={styles.targetLabel}>TARGET WORD</Text>
          <Text style={styles.targetWord}>{WORD}</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>LETTERS PLACED</Text>
          <Text style={styles.progressCount}>
            {nextIndex} / {TARGET.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PALETTE.accent, PALETTE.medical]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.dockFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.dockGlow}
        />
        <Text style={styles.dockLabel}>CARGO DOCK</Text>
        <View style={styles.slotsRow}>
          {TARGET.map((letter, i) => (
            <DockSlot
              key={i}
              letter={letter}
              index={i}
              filled={i < nextIndex}
              active={i === nextIndex}
            />
          ))}
        </View>
      </View>

      <Text style={styles.prompt}>Tap the crates in order</Text>

      <View style={styles.cratesRow}>
        {LETTERS.map((letter, i) => (
          <CargoLetter
            key={`${letter}-${i}`}
            letter={letter}
            index={i}
            shake={wrongTapIndex === i}
            onPress={() => handleLetterTap(letter, i)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>
          Order: H → O → S → P → I → T → A → L{attempts > 0 ? ` · Taps: ${attempts}` : ''}
        </Text>
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(45,212,191,0.1)',
    borderWidth: 1.5,
    borderColor: `${PALETTE.secondary}55`,
  },
  targetBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(11,10,26,0.6)',
    borderWidth: 2,
    borderColor: `${PALETTE.medical}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 28 },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.secondary,
    marginBottom: 2,
  },
  targetWord: { fontSize: 20, fontWeight: '900', color: CW.textLight, letterSpacing: 1.5 },
  progressWrap: { marginBottom: 16 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: CW.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  dockFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(40,20,60,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 18,
    overflow: 'hidden',
  },
  dockGlow: { ...StyleSheet.absoluteFillObject },
  dockLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  slotsRow: { flexDirection: 'row', gap: 5, justifyContent: 'center', flexWrap: 'wrap' },
  slot: {
    width: 38,
    height: 44,
    borderRadius: 11,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: 'rgba(52,211,153,0.12)' },
  slotGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${CW.good}22`,
  },
  slotLetter: { fontSize: 20, fontWeight: '900', color: CW.textLight },
  slotIdx: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontSize: 7,
    fontWeight: '900',
    color: CW.textMuted,
  },
  slotQ: { fontSize: 16, fontWeight: '900', color: PALETTE.glow },
  prompt: {
    fontSize: 16,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 14,
  },
  cratesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  crate: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: CW.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cratePressed: { opacity: 0.88 },
  crateGrad: { ...StyleSheet.absoluteFillObject },
  crateLetter: { fontSize: 22, fontWeight: '900', color: CW.textLight },
  crateMark: {
    position: 'absolute',
    bottom: 3,
    right: 5,
    fontSize: 9,
    color: PALETTE.glow,
  },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 11, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});

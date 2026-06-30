/**
 * Level 7 Reader — Session 3, Game 3: Word Nova
 * Letters A, P, P, L, E — user taps letters in order to build "APPLE".
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

const TARGET = ['A', 'P', 'P', 'L', 'E'] as const;
const LETTERS = ['E', 'A', 'P', 'L', 'P'] as const;
const WORD = 'APPLE';

const VOICE = 'Build the word APPLE. Tap the letters in order: A, P, P, L, E.';
const NOVA = { accent: '#A855F7', accentBright: '#D8B4FE', rose: '#EC4899', apple: '#F87171' } as const;

function OrbitSlot({
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
        ? `rgba(168,85,247,${0.5 + pulse.value * 0.45})`
        : filled
          ? `${RD.good}99`
          : RD.glassBorder,
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

function CometLetter({
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
        style={({ pressed }) => [styles.comet, pressed && styles.cometPressed]}
        accessibilityLabel={`Letter ${letter}`}
      >
        <LinearGradient
          colors={[`${NOVA.accent}88`, `${NOVA.rose}44`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cometGrad}
        />
        <Text style={styles.cometLetter}>{letter}</Text>
        <Text style={styles.cometTail}>✦</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface WordBuilderAppleReaderSession3GameProps {
  onComplete: () => void;
}

export function WordBuilderAppleReaderSession3Game({ onComplete }: WordBuilderAppleReaderSession3GameProps) {
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
        speak(letter, 0.6);
        if (newIndex >= TARGET.length) {
          speak('Apple! You built APPLE!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        }
      } else {
        setWrongTapIndex(tapIndex);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap A, then P, then P, then L, then E.', 0.7);
        setTimeout(() => setWrongTapIndex(null), 700);
      }
    },
    [nextIndex, onComplete],
  );

  const coachLine =
    nextIndex === 0
      ? 'Spell APPLE: start with A, then two P\'s, then L and E!'
      : nextIndex < TARGET.length
        ? `Next letter: ${TARGET[nextIndex]} — ${TARGET.length - nextIndex} to go!`
        : 'Word complete!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Word Nova!"
        subtitle="You built APPLE! 🍎"
        badgeEmoji="🍎"
      />
    );
  }

  const progressPct = (nextIndex / TARGET.length) * 100;

  return (
    <ReaderGameShell
      studio="WORD NOVA · GAME 3"
      title="Build APPLE"
      instruction="Tap the letter comets in order to spell APPLE."
      mascot="🍎"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetEmoji}>🍎</Text>
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
            colors={[NOVA.accent, NOVA.rose]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.dockFrame}>
        <LinearGradient
          colors={[`${NOVA.accent}33`, 'transparent', `${NOVA.rose}22`]}
          style={styles.dockGlow}
        />
        <Text style={styles.dockLabel}>ORBIT DOCK</Text>
        <View style={styles.slotsRow}>
          {TARGET.map((letter, i) => (
            <OrbitSlot
              key={i}
              letter={letter}
              index={i}
              filled={i < nextIndex}
              active={i === nextIndex}
            />
          ))}
        </View>
      </View>

      <Text style={styles.prompt}>Tap the comets in order</Text>

      <View style={styles.cometsRow}>
        {LETTERS.map((letter, i) => (
          <CometLetter
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
          Order: A → P → P → L → E{attempts > 0 ? ` · Taps: ${attempts}` : ''}
        </Text>
      </View>
    </ReaderGameShell>
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
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1.5,
    borderColor: `${NOVA.apple}55`,
  },
  targetBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(11,10,26,0.6)',
    borderWidth: 2,
    borderColor: `${NOVA.apple}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 28 },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: NOVA.apple,
    marginBottom: 2,
  },
  targetWord: { fontSize: 26, fontWeight: '900', color: RD.textLight, letterSpacing: 3 },
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
    color: NOVA.accentBright,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: RD.textLight },
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
    borderColor: `${NOVA.accent}55`,
    backgroundColor: 'rgba(40,20,60,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 18,
    overflow: 'hidden',
  },
  dockGlow: { ...StyleSheet.absoluteFillObject },
  dockLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: NOVA.accentBright,
    textAlign: 'center',
    marginBottom: 12,
  },
  slotsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  slot: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: 'rgba(52,211,153,0.12)' },
  slotGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${RD.good}22`,
  },
  slotLetter: { fontSize: 26, fontWeight: '900', color: RD.textLight },
  slotIdx: {
    position: 'absolute',
    top: 3,
    left: 5,
    fontSize: 8,
    fontWeight: '900',
    color: RD.textMuted,
  },
  slotQ: { fontSize: 20, fontWeight: '900', color: NOVA.accentBright },
  prompt: {
    fontSize: 16,
    fontWeight: '800',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 14,
  },
  cometsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  comet: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: RD.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cometPressed: { opacity: 0.88 },
  cometGrad: { ...StyleSheet.absoluteFillObject },
  cometLetter: { fontSize: 28, fontWeight: '900', color: RD.textLight },
  cometTail: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    fontSize: 10,
    color: NOVA.accentBright,
  },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderWidth: 1,
    borderColor: `${NOVA.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: NOVA.accentBright, textAlign: 'center' },
});

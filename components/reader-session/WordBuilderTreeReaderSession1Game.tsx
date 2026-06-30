/**
 * Level 7 Reader — Session 1, Game 3: Word Nebula
 * Letters T, R, E, E — user taps letters in order to build "TREE".
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

const TARGET = ['T', 'R', 'E', 'E'] as const;
const LETTERS = ['E', 'T', 'E', 'R'] as const;
const WORD = 'TREE';

const VOICE = 'Build the word TREE. Tap the letters in order: T, R, E, E.';
const NEBULA = { accent: '#8B5CF6', accentBright: '#C4B5FD', mint: '#34D399', cyan: '#22D3EE' } as const;

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
    borderColor: active && !filled
      ? `rgba(139,92,246,${0.5 + pulse.value * 0.45})`
      : filled
        ? `${NEBULA.mint}99`
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
          colors={[`${NEBULA.accent}88`, `${NEBULA.cyan}44`]}
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

export interface WordBuilderTreeReaderSession1GameProps {
  onComplete: () => void;
}

export function WordBuilderTreeReaderSession1Game({ onComplete }: WordBuilderTreeReaderSession1GameProps) {
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
          speak('Tree! You built TREE!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        }
      } else {
        setWrongTapIndex(tapIndex);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap T, then R, then E, then E.', 0.7);
        setTimeout(() => setWrongTapIndex(null), 700);
      }
    },
    [nextIndex, onComplete],
  );

  const coachLine =
    nextIndex === 0
      ? 'Spell TREE: start with T, then R, then two E\'s!'
      : nextIndex < TARGET.length
        ? `Next letter: ${TARGET[nextIndex]} — ${TARGET.length - nextIndex} to go!`
        : 'Word complete!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Word Nebula!"
        subtitle="You built TREE! 🌳"
        badgeEmoji="🌳"
      />
    );
  }

  const progressPct = (nextIndex / TARGET.length) * 100;

  return (
    <ReaderGameShell
      studio="WORD NEBULA · GAME 3"
      title="Build TREE"
      instruction="Tap the letter comets in order to spell TREE."
      mascot="🌳"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetEmoji}>🌳</Text>
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
            colors={[NEBULA.accent, NEBULA.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.dockFrame}>
        <LinearGradient
          colors={[`${NEBULA.accent}33`, 'transparent', `${NEBULA.cyan}22`]}
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
          Order: T → R → E → E{attempts > 0 ? ` · Taps: ${attempts}` : ''}
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
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1.5,
    borderColor: `${NEBULA.mint}55`,
  },
  targetBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(11,10,26,0.6)',
    borderWidth: 2,
    borderColor: `${NEBULA.mint}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 28 },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: NEBULA.mint,
    marginBottom: 2,
  },
  targetWord: { fontSize: 26, fontWeight: '900', color: RD.textLight, letterSpacing: 4 },
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
    color: NEBULA.accentBright,
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
    borderColor: `${NEBULA.accent}55`,
    backgroundColor: 'rgba(30,20,60,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 18,
    overflow: 'hidden',
  },
  dockGlow: { ...StyleSheet.absoluteFillObject },
  dockLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: NEBULA.accentBright,
    textAlign: 'center',
    marginBottom: 12,
  },
  slotsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  slot: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: 'rgba(52,211,153,0.12)' },
  slotGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${NEBULA.mint}22`,
  },
  slotLetter: { fontSize: 30, fontWeight: '900', color: RD.textLight },
  slotIdx: {
    position: 'absolute',
    top: 4,
    left: 6,
    fontSize: 8,
    fontWeight: '900',
    color: RD.textMuted,
  },
  slotQ: { fontSize: 22, fontWeight: '900', color: NEBULA.accentBright },
  prompt: {
    fontSize: 16,
    fontWeight: '800',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 14,
  },
  cometsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  comet: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: RD.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cometPressed: { opacity: 0.88 },
  cometGrad: { ...StyleSheet.absoluteFillObject },
  cometLetter: { fontSize: 32, fontWeight: '900', color: RD.textLight },
  cometTail: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    fontSize: 10,
    color: RD.star,
  },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: `${NEBULA.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: NEBULA.accentBright, textAlign: 'center' },
});

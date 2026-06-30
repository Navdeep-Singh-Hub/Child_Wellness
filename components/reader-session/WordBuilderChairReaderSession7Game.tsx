/**
 * Level 7 Reader — Session 7, Game 3: Word Dock
 * Letters C, H, A, I, R — user taps letters in order to build "CHAIR".
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

const TARGET = ['C', 'H', 'A', 'I', 'R'] as const;
const LETTERS = ['R', 'C', 'A', 'I', 'H'] as const;
const WORD = 'CHAIR';

const VOICE = 'Build the word CHAIR. Tap the letters in order: C, H, A, I, R.';
const DOCK = { accent: '#F43F5E', glow: '#FDA4AF', rose: '#FB7185', wood: '#D4A574' } as const;

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
        ? `rgba(244,63,94,${0.5 + pulse.value * 0.45})`
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
          colors={[`${DOCK.accent}88`, `${DOCK.rose}44`]}
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

export interface WordBuilderChairReaderSession7GameProps {
  onComplete: () => void;
}

export function WordBuilderChairReaderSession7Game({ onComplete }: WordBuilderChairReaderSession7GameProps) {
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
          speak('Chair! You built CHAIR!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        }
      } else {
        setWrongTapIndex(tapIndex);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap C, then H, then A, then I, then R.', 0.7);
        setTimeout(() => setWrongTapIndex(null), 700);
      }
    },
    [nextIndex, onComplete],
  );

  const coachLine =
    nextIndex === 0
      ? 'Spell CHAIR: start with C, then H, A, I, and R!'
      : nextIndex < TARGET.length
        ? `Next letter: ${TARGET[nextIndex]} — ${TARGET.length - nextIndex} to go!`
        : 'Word complete!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Word Dock!"
        subtitle="You built CHAIR! 🪑"
        badgeEmoji="🪑"
      />
    );
  }

  const progressPct = (nextIndex / TARGET.length) * 100;

  return (
    <ReaderGameShell
      studio="WORD DOCK · GAME 3"
      title="Build CHAIR"
      instruction="Tap the letter crates in order to spell CHAIR."
      mascot="🪑"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetEmoji}>🪑</Text>
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
            colors={[DOCK.accent, DOCK.rose]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.dockFrame}>
        <LinearGradient
          colors={[`${DOCK.accent}33`, 'transparent', `${DOCK.rose}22`]}
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
          Order: C → H → A → I → R{attempts > 0 ? ` · Taps: ${attempts}` : ''}
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
    backgroundColor: 'rgba(212,165,116,0.1)',
    borderWidth: 1.5,
    borderColor: `${DOCK.wood}55`,
  },
  targetBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(11,10,26,0.6)',
    borderWidth: 2,
    borderColor: `${DOCK.wood}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 28 },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: DOCK.wood,
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
    color: DOCK.glow,
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
    borderColor: `${DOCK.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
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
    color: DOCK.glow,
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
  slotQ: { fontSize: 20, fontWeight: '900', color: DOCK.glow },
  prompt: {
    fontSize: 16,
    fontWeight: '800',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 14,
  },
  cratesRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  crate: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: RD.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cratePressed: { opacity: 0.88 },
  crateGrad: { ...StyleSheet.absoluteFillObject },
  crateLetter: { fontSize: 28, fontWeight: '900', color: RD.textLight },
  crateMark: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    fontSize: 10,
    color: DOCK.glow,
  },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderWidth: 1,
    borderColor: `${DOCK.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: DOCK.glow, textAlign: 'center' },
});

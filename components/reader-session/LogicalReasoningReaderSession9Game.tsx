/**
 * Level 7 Reader — Session 9, Game 1: Oddity Scan
 * Which item doesn't belong: car, bus, apple, train. Answer: apple (not a vehicle).
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

const ITEMS = [
  { id: 'car', label: 'Car', emoji: '🚗', group: 'vehicle' },
  { id: 'bus', label: 'Bus', emoji: '🚌', group: 'vehicle' },
  { id: 'apple', label: 'Apple', emoji: '🍎', group: 'food' },
  { id: 'train', label: 'Train', emoji: '🚂', group: 'vehicle' },
] as const;

type ItemId = (typeof ITEMS)[number]['id'];
const CORRECT_ID: ItemId = 'apple';

const VOICE =
  'Which one does NOT belong? Car, bus, apple, train. Tap the one that is different.';
const ODD = { accent: '#7C3AED', accentBright: '#C4B5FD', teal: '#2DD4BF' } as const;

function ClusterCell({ item, index }: { item: (typeof ITEMS)[number]; index: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 + index * 80 }),
        withTiming(0, { duration: 1000 + index * 80 }),
      ),
      -1,
      true,
    );
  }, [drift, index]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.15 + drift.value * 0.25,
  }));

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, glow, { backgroundColor: `${ODD.accent}33` }]} />
      <View style={styles.cell}>
        <Text style={styles.cellEmoji}>{item.emoji}</Text>
      </View>
    </View>
  );
}

function AnomalyOrb({
  item,
  selected,
  feedback,
  onPress,
}: {
  item: (typeof ITEMS)[number];
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
          ? ODD.accentBright
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={item.label}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${ODD.teal}22` }]} />
        <Text style={styles.orbEmoji}>{item.emoji}</Text>
        <Text style={styles.orbLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface LogicalReasoningReaderSession9GameProps {
  onComplete: () => void;
}

export function LogicalReasoningReaderSession9Game({ onComplete }: LogicalReasoningReaderSession9GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ItemId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: ItemId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! The apple does not belong — the others are vehicles!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('That is a vehicle. Which one is NOT a vehicle?', 0.7);
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
      ? 'Three are vehicles — one is different. Find the odd signal!'
      : 'Think: car, bus, and train are alike. What is NOT?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Oddity Scan!"
        subtitle="You found the one that doesn't belong!"
        badgeEmoji="🧠"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="ODDITY SCAN · GAME 1"
      title="Odd one out"
      instruction="Which one does NOT belong? Car, bus, apple, train."
      mascot="🧠"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.clusterFrame}>
        <LinearGradient
          colors={[`${ODD.accent}33`, 'transparent', `${ODD.teal}22`]}
          style={styles.clusterGlow}
        />
        <Text style={styles.clusterLabel}>SIGNAL CLUSTER</Text>
        <View style={styles.clusterRow}>
          {ITEMS.map((item, i) => (
            <ClusterCell key={item.id} item={item} index={i} />
          ))}
        </View>
        <Text style={styles.clusterHint}>🚗 🚌 🚂 are vehicles · one is not</Text>
      </View>

      <Text style={styles.prompt}>Tap the odd signal</Text>

      <View style={styles.choicesRow}>
        {ITEMS.map((item) => (
          <AnomalyOrb
            key={item.id}
            item={item}
            selected={selected === item.id}
            feedback={feedback}
            onPress={() => handleTap(item.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Find the item that does not fit the group</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  clusterFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${ODD.accent}55`,
    backgroundColor: 'rgba(40,20,60,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 18,
    overflow: 'hidden',
  },
  clusterGlow: { ...StyleSheet.absoluteFillObject },
  clusterLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: ODD.accentBright,
    textAlign: 'center',
    marginBottom: 12,
  },
  clusterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  clusterHint: {
    fontSize: 12,
    fontWeight: '700',
    color: ODD.teal,
    textAlign: 'center',
  },
  cellWrap: { alignItems: 'center' },
  cellGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  cell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: `${ODD.accentBright}66`,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 26 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  orb: {
    width: 96,
    height: 112,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 38 },
  orbLabel: { fontSize: 12, fontWeight: '800', color: RD.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: `${ODD.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: ODD.accentBright, textAlign: 'center' },
});

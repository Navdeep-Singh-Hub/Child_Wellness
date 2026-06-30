/**
 * Level 9 (Clockwise) — Session 3, Game 1: Logical Selection
 * Find the item that does not belong: car, bus, train, banana. Answer: banana.
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

const ITEMS = [
  { id: 'car', label: 'Car', emoji: '🚗', group: 'vehicle' },
  { id: 'bus', label: 'Bus', emoji: '🚌', group: 'vehicle' },
  { id: 'train', label: 'Train', emoji: '🚂', group: 'vehicle' },
  { id: 'banana', label: 'Banana', emoji: '🍌', group: 'food' },
] as const;

type ItemId = (typeof ITEMS)[number]['id'];
const CORRECT_ID: ItemId = 'banana';

const VOICE =
  'Which one does NOT belong? Car, bus, train, banana. Tap the one that is different.';
const PALETTE = { accent: '#7C3AED', glow: '#C4B5FD', secondary: '#A78BFA', rose: '#EC4899' } as const;

function ClusterCell({ item, index }: { item: (typeof ITEMS)[number]; index: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 + index * 100 }),
        withTiming(0, { duration: 1000 + index * 100 }),
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
      <Animated.View style={[styles.cellGlow, glow, { backgroundColor: `${PALETTE.accent}33` }]} />
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
        accessibilityLabel={item.label}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'rgba(8,12,40,0.55)']}
          style={styles.orbGrad}
        />
        <Text style={styles.orbEmoji}>{item.emoji}</Text>
        <Text style={styles.orbLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface LogicalSelectionLevel9Session3GameProps {
  onComplete: () => void;
}

export function LogicalSelectionLevel9Session3Game({ onComplete }: LogicalSelectionLevel9Session3GameProps) {
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
        speak('Correct! The banana does not belong — the others are vehicles!', 0.75);
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
      : 'Think: car, bus, and train go on roads or tracks. What is NOT?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You found the one that doesn't belong!"
        badgeEmoji="🧠"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="LOGICAL SELECTION · GAME 1"
      title="Odd one out"
      instruction="Which one does NOT belong? Tap the one that is different."
      mascot="🧠"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.clusterFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.rose}22`]}
          style={styles.clusterGlow}
        />
        <Text style={styles.clusterLabel}>ORBIT SIGNAL CLUSTER</Text>
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
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  clusterFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
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
    color: PALETTE.glow,
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
    color: PALETTE.rose,
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
    borderColor: `${PALETTE.glow}66`,
    backgroundColor: 'rgba(8,12,40,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 26 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: CW.textLight,
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
    backgroundColor: 'rgba(8,12,40,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbGrad: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 38 },
  orbLabel: { fontSize: 12, fontWeight: '800', color: CW.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});

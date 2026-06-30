/**
 * Level 7 Reader — Session 6, Game 2: Creature Filter
 * Select all animals. Tap each animal (dog, cat, bird); avoid non-animals.
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const ITEMS = [
  { id: 'dog', label: 'Dog', emoji: '🐕', isAnimal: true },
  { id: 'car', label: 'Car', emoji: '🚗', isAnimal: false },
  { id: 'cat', label: 'Cat', emoji: '🐱', isAnimal: true },
  { id: 'apple', label: 'Apple', emoji: '🍎', isAnimal: false },
  { id: 'bird', label: 'Bird', emoji: '🐦', isAnimal: true },
  { id: 'sun', label: 'Sun', emoji: '☀️', isAnimal: false },
] as const;

type ItemId = (typeof ITEMS)[number]['id'];
const TOTAL_ANIMALS = ITEMS.filter((i) => i.isAnimal).length;

const VOICE = 'Tap all the animals. Find the dog, the cat, and the bird.';
const FILTER = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

function ScanCell({
  item,
  selected,
  shake,
  onPress,
}: {
  item: (typeof ITEMS)[number];
  selected: boolean;
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
    }
  }, [shake, shakeX]);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.04, { damping: 10 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [selected, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        disabled={selected}
        style={({ pressed }) => [
          styles.cell,
          selected && styles.cellSelected,
          pressed && !selected && styles.cellPressed,
        ]}
        accessibilityLabel={item.label}
      >
        {selected ? <View style={styles.cellGlow} /> : null}
        <Text style={styles.cellEmoji}>{item.emoji}</Text>
        <Text style={styles.cellLabel}>{item.label}</Text>
        {selected ? <Text style={styles.cellCheck}>✓</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export interface CategoryRecognitionReaderSession6GameProps {
  onComplete: () => void;
}

export function CategoryRecognitionReaderSession6Game({ onComplete }: CategoryRecognitionReaderSession6GameProps) {
  const [selected, setSelected] = useState<Set<ItemId>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongId, setWrongId] = useState<ItemId | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const foundCount = selected.size;
  const progressPct = (foundCount / TOTAL_ANIMALS) * 100;

  const handleTap = useCallback(
    (id: ItemId) => {
      if (selected.has(id)) return;
      const item = ITEMS.find((i) => i.id === id);
      if (!item) return;

      if (item.isAnimal) {
        setWrongId(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const next = new Set(selected).add(id);
        setSelected(next);
        speak(item.label, 0.5);
        if (next.size >= TOTAL_ANIMALS) {
          speak('You found all the animals!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        }
      } else {
        setWrongId(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'car'
            ? 'A car is a vehicle, not an animal!'
            : id === 'apple'
              ? 'An apple is food, not an animal!'
              : 'The sun is not an animal — tap living creatures!',
          0.7,
        );
        setTimeout(() => setWrongId(null), 700);
      }
    },
    [onComplete, selected],
  );

  const coachLine =
    foundCount === 0
      ? 'Scan the grid — tap every living animal you see!'
      : `${foundCount} of ${TOTAL_ANIMALS} animals tagged — keep filtering!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Creature Filter!"
        subtitle="You selected all the animals!"
        badgeEmoji="🐾"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="CREATURE FILTER · GAME 2"
      title="Select all animals"
      instruction="Tap every animal. Skip things that are not animals."
      mascot="🐾"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>ANIMALS TAGGED</Text>
          <Text style={styles.progressCount}>
            {foundCount} / {TOTAL_ANIMALS}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[FILTER.accent, FILTER.mint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.gridFrame}>
        <LinearGradient
          colors={[`${FILTER.accent}33`, 'transparent', `${FILTER.mint}22`]}
          style={styles.gridGlow}
        />
        <Text style={styles.gridLabel}>SCAN GRID</Text>
        <View style={styles.grid}>
          {ITEMS.map((item) => (
            <ScanCell
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              shake={wrongId === item.id}
              onPress={() => handleTap(item.id)}
            />
          ))}
        </View>
        <Text style={styles.gridHint}>🐕 🐱 🐦 are animals · skip the rest</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
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
    color: FILTER.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: RD.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  gridFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${FILTER.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  gridGlow: { ...StyleSheet.absoluteFillObject },
  gridLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: FILTER.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: RD.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    minWidth: 88,
    overflow: 'hidden',
  },
  cellSelected: {
    borderColor: RD.good,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  cellPressed: { opacity: 0.88 },
  cellGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${RD.good}22`,
  },
  cellEmoji: { fontSize: 34, marginBottom: 4 },
  cellLabel: { fontSize: 12, fontWeight: '800', color: RD.textMuted },
  cellCheck: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 14,
    fontWeight: '900',
    color: RD.good,
  },
  gridHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: FILTER.glow,
    textAlign: 'center',
  },
});

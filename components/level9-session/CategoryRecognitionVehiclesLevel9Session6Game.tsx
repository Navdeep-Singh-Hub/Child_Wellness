/**
 * Level 9 (Clockwise) — Session 6, Game 2: Category Recognition
 * Select all vehicles. Tap car, bus, train; avoid non-vehicles.
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const ITEMS = [
  { id: 'car', label: 'Car', emoji: '🚗', isVehicle: true },
  { id: 'apple', label: 'Apple', emoji: '🍎', isVehicle: false },
  { id: 'bus', label: 'Bus', emoji: '🚌', isVehicle: true },
  { id: 'dog', label: 'Dog', emoji: '🐕', isVehicle: false },
  { id: 'train', label: 'Train', emoji: '🚂', isVehicle: true },
  { id: 'book', label: 'Book', emoji: '📚', isVehicle: false },
] as const;

type ItemId = (typeof ITEMS)[number]['id'];
const TOTAL_VEHICLES = ITEMS.filter((i) => i.isVehicle).length;

const VOICE = 'Tap all the vehicles. Find the car, the bus, and the train.';
const PALETTE = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

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

export interface CategoryRecognitionVehiclesLevel9Session6GameProps {
  onComplete: () => void;
}

export function CategoryRecognitionVehiclesLevel9Session6Game({
  onComplete,
}: CategoryRecognitionVehiclesLevel9Session6GameProps) {
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
  const progressPct = (foundCount / TOTAL_VEHICLES) * 100;

  const handleTap = useCallback(
    (id: ItemId) => {
      if (selected.has(id)) return;
      const item = ITEMS.find((i) => i.id === id);
      if (!item) return;

      if (item.isVehicle) {
        setWrongId(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const next = new Set(selected).add(id);
        setSelected(next);
        speak(item.label, 0.5);
        if (next.size >= TOTAL_VEHICLES) {
          speak('You found all the vehicles!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        }
      } else {
        setWrongId(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'apple'
            ? 'An apple is food, not a vehicle!'
            : id === 'dog'
              ? 'A dog is an animal, not a vehicle!'
              : 'A book is for reading, not for driving!',
          0.7,
        );
        setTimeout(() => setWrongId(null), 700);
      }
    },
    [onComplete, selected],
  );

  const coachLine =
    foundCount === 0
      ? 'Scan the grid — tap every vehicle that moves on roads or tracks!'
      : `${foundCount} of ${TOTAL_VEHICLES} vehicles tagged — keep filtering!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Vehicle Filter!"
        subtitle="You selected all the vehicles!"
        badgeEmoji="🚗"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="VEHICLE FILTER · GAME 2"
      title="Select all vehicles"
      instruction="Tap every vehicle. Skip things that are not vehicles."
      mascot="🚗"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>VEHICLES TAGGED</Text>
          <Text style={styles.progressCount}>
            {foundCount} / {TOTAL_VEHICLES}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PALETTE.accent, PALETTE.mint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.gridFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.mint}22`]}
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
        <Text style={styles.gridHint}>🚗 🚌 🚂 are vehicles · skip the rest</Text>
      </View>
    </ClockwiseGameShell>
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
  gridFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  gridGlow: { ...StyleSheet.absoluteFillObject },
  gridLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
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
    borderColor: CW.glassBorder,
    backgroundColor: 'rgba(8,12,40,0.75)',
    alignItems: 'center',
    minWidth: 88,
    overflow: 'hidden',
  },
  cellSelected: {
    borderColor: CW.good,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  cellPressed: { opacity: 0.88 },
  cellGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${CW.good}22`,
  },
  cellEmoji: { fontSize: 34, marginBottom: 4 },
  cellLabel: { fontSize: 12, fontWeight: '800', color: CW.textMuted },
  cellCheck: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 14,
    fontWeight: '900',
    color: CW.good,
  },
  gridHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.glow,
    textAlign: 'center',
  },
});

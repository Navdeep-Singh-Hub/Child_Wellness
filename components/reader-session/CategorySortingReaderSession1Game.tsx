/**
 * Level 7 Reader — Session 1, Game 4: Galaxy Sort
 * Sort objects into Food / Animals / Vehicles. Tap item then category.
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const ITEMS = [
  { id: 'apple', category: 'food' as const, label: 'Apple', emoji: '🍎' },
  { id: 'pizza', category: 'food' as const, label: 'Pizza', emoji: '🍕' },
  { id: 'dog', category: 'animals' as const, label: 'Dog', emoji: '🐶' },
  { id: 'cat', category: 'animals' as const, label: 'Cat', emoji: '🐱' },
  { id: 'car', category: 'vehicles' as const, label: 'Car', emoji: '🚗' },
  { id: 'bus', category: 'vehicles' as const, label: 'Bus', emoji: '🚌' },
];

type Category = 'food' | 'animals' | 'vehicles';

const CATEGORIES: {
  id: Category;
  label: string;
  short: string;
  emoji: string;
  accent: string;
  glow: string;
  bg: string;
}[] = [
  {
    id: 'food',
    label: 'Food Nebula',
    short: 'Food',
    emoji: '🍽️',
    accent: '#F59E0B',
    glow: '#FCD34D',
    bg: 'rgba(245,158,11,0.14)',
  },
  {
    id: 'animals',
    label: 'Creature Sector',
    short: 'Animals',
    emoji: '🐾',
    accent: '#22C55E',
    glow: '#86EFAC',
    bg: 'rgba(34,197,94,0.14)',
  },
  {
    id: 'vehicles',
    label: 'Vehicle Orbit',
    short: 'Vehicles',
    emoji: '🚀',
    accent: '#38BDF8',
    glow: '#7DD3FC',
    bg: 'rgba(56,189,248,0.14)',
  },
];

const VOICE = 'Sort into Food, Animals, or Vehicles. Tap an item, then tap the galaxy zone.';
const GALAXY = { accent: '#8B5CF6', accentBright: '#C4B5FD' } as const;

function CargoItem({
  item,
  selected,
  sorted,
  shake,
  onPress,
}: {
  item: (typeof ITEMS)[number];
  selected: boolean;
  sorted: boolean;
  shake: boolean;
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake, shakeX]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
    opacity: sorted ? 0.45 : 1,
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        disabled={sorted}
        style={({ pressed }) => [
          styles.cargo,
          selected && styles.cargoSelected,
          sorted && styles.cargoSorted,
          pressed && !sorted && styles.cargoPressed,
        ]}
        accessibilityLabel={item.label}
      >
        {selected ? <View style={styles.cargoRing} /> : null}
        <Text style={styles.cargoEmoji}>{item.emoji}</Text>
        <Text style={styles.cargoLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function GalaxyZone({
  zone,
  sortedItems,
  active,
  shake,
  onPress,
}: {
  zone: (typeof CATEGORIES)[number];
  sortedItems: string[];
  active: boolean;
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
    scale.value = active ? withSpring(1.03, { damping: 10 }) : withTiming(1, { duration: 150 });
  }, [active, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.zoneWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.zone,
          { borderColor: active ? zone.glow : `${zone.accent}88`, backgroundColor: zone.bg },
          pressed && styles.zonePressed,
        ]}
        accessibilityLabel={zone.short}
      >
        <LinearGradient
          colors={[`${zone.accent}33`, 'transparent']}
          style={styles.zoneGrad}
        />
        <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
        <Text style={[styles.zoneLabel, { color: zone.glow }]}>{zone.label}</Text>
        {sortedItems.length > 0 ? (
          <View style={styles.zoneChips}>
            {sortedItems.map((emoji, i) => (
              <Text key={i} style={styles.zoneChip}>
                {emoji}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.zoneHint}>Drop here</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export interface CategorySortingReaderSession1GameProps {
  onComplete: () => void;
}

export function CategorySortingReaderSession1Game({ onComplete }: CategorySortingReaderSession1GameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [placedIn, setPlacedIn] = useState<Partial<Record<string, Category>>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongCategory, setWrongCategory] = useState<Category | null>(null);
  const [wrongItemId, setWrongItemId] = useState<string | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const sortedCount = sorted.size;
  const progressPct = (sortedCount / ITEMS.length) * 100;

  const itemsByZone = useMemo(() => {
    const map: Record<Category, string[]> = { food: [], animals: [], vehicles: [] };
    for (const item of ITEMS) {
      const zone = placedIn[item.id];
      if (zone) map[zone].push(item.emoji);
    }
    return map;
  }, [placedIn]);

  const handleItemTap = useCallback(
    (id: string) => {
      if (sorted.has(id)) return;
      setSelectedId(id);
      setWrongCategory(null);
      setWrongItemId(null);
      const item = ITEMS.find((i) => i.id === id);
      speak(item?.label ?? id, 0.6);
    },
    [sorted],
  );

  const handleCategoryTap = useCallback(
    (category: Category) => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.category !== category) {
        setWrongCategory(category);
        setWrongItemId(selectedId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Is it food, an animal, or a vehicle?', 0.7);
        setSelectedId(null);
        setTimeout(() => {
          setWrongCategory(null);
          setWrongItemId(null);
        }, 750);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak('Correct!', 0.6);
      setSorted((s) => new Set(s).add(selectedId));
      setPlacedIn((p) => ({ ...p, [selectedId]: category }));
      setSelectedId(null);
      if (sorted.size + 1 >= ITEMS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [onComplete, selectedId, sorted],
  );

  const coachLine = selectedId
    ? `Tap a galaxy zone for ${ITEMS.find((i) => i.id === selectedId)?.label ?? 'this item'}`
    : sortedCount === 0
      ? 'Pick a cargo item, then sort it into the right galaxy zone!'
      : `${sortedCount} of ${ITEMS.length} sorted — keep going!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Galaxy Sort!"
        subtitle="You sorted all the categories!"
        badgeEmoji="🪐"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="GALAXY SORT · GAME 4"
      title="Sort the cargo"
      instruction="Tap an item, then tap Food, Animals, or Vehicles."
      mascot="🪐"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.phaseStrip}>
        <View style={[styles.phasePill, selectedId ? styles.phaseDone : styles.phaseActive]}>
          <Text style={styles.phaseTxt}>1 · Pick</Text>
        </View>
        <Text style={styles.phaseArrow}>→</Text>
        <View style={[styles.phasePill, selectedId ? styles.phaseActive : styles.phaseIdle]}>
          <Text style={styles.phaseTxt}>2 · Sort</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>CARGO SORTED</Text>
          <Text style={styles.progressCount}>
            {sortedCount} / {ITEMS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[GALAXY.accent, RD.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.beltFrame}>
        <Text style={styles.beltLabel}>ASTEROID BELT</Text>
        <View style={styles.cargoRow}>
          {ITEMS.map((item) => (
            <CargoItem
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              sorted={sorted.has(item.id)}
              shake={wrongItemId === item.id}
              onPress={() => handleItemTap(item.id)}
            />
          ))}
        </View>
      </View>

      <Text style={styles.zoneTitle}>GALAXY ZONES</Text>
      <View style={styles.zonesRow}>
        {CATEGORIES.map((zone) => (
          <GalaxyZone
            key={zone.id}
            zone={zone}
            sortedItems={itemsByZone[zone.id]}
            active={!!selectedId}
            shake={wrongCategory === zone.id}
            onPress={() => handleCategoryTap(zone.id)}
          />
        ))}
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  phaseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  phasePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  phaseActive: {
    backgroundColor: 'rgba(139,92,246,0.22)',
    borderColor: GALAXY.accentBright,
  },
  phaseDone: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: RD.good,
  },
  phaseIdle: {
    backgroundColor: 'rgba(11,10,26,0.5)',
    borderColor: RD.glassBorder,
  },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: RD.textLight },
  phaseArrow: { fontSize: 14, fontWeight: '900', color: RD.textMuted },
  progressWrap: { marginBottom: 14 },
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
    color: GALAXY.accentBright,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: RD.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  beltFrame: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${GALAXY.accent}55`,
    backgroundColor: 'rgba(30,20,60,0.45)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  beltLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: GALAXY.accentBright,
    textAlign: 'center',
    marginBottom: 10,
  },
  cargoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cargo: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: RD.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    minWidth: 84,
    overflow: 'hidden',
  },
  cargoSelected: {
    borderColor: GALAXY.accentBright,
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  cargoSorted: { borderColor: `${RD.good}66` },
  cargoPressed: { opacity: 0.9 },
  cargoRing: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RD.cyanGlow,
  },
  cargoEmoji: { fontSize: 30, marginBottom: 2 },
  cargoLabel: { fontSize: 11, fontWeight: '800', color: RD.textMuted },
  zoneTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: GALAXY.accentBright,
    textAlign: 'center',
    marginBottom: 10,
  },
  zonesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  zoneWrap: { flex: 1, minWidth: 100 },
  zone: {
    borderRadius: 16,
    borderWidth: 2.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 108,
    overflow: 'hidden',
  },
  zonePressed: { opacity: 0.9 },
  zoneGrad: { ...StyleSheet.absoluteFillObject },
  zoneEmoji: { fontSize: 28, marginBottom: 4 },
  zoneLabel: { fontSize: 11, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  zoneHint: { fontSize: 10, fontWeight: '700', color: RD.textMuted },
  zoneChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  zoneChip: { fontSize: 18 },
});

/**
 * Level 9 (Clockwise) — Session 1, Game 4: Category Logic
 * Sort objects into Living / Non-living.
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
  { id: 'dog', category: 'living' as const, label: 'Dog', emoji: '🐕' },
  { id: 'car', category: 'nonliving' as const, label: 'Car', emoji: '🚗' },
  { id: 'flower', category: 'living' as const, label: 'Flower', emoji: '🌸' },
  { id: 'book', category: 'nonliving' as const, label: 'Book', emoji: '📚' },
  { id: 'bird', category: 'living' as const, label: 'Bird', emoji: '🐦' },
  { id: 'chair', category: 'nonliving' as const, label: 'Chair', emoji: '🪑' },
];

type Category = 'living' | 'nonliving';

const CATEGORIES: { id: Category; label: string; emoji: string; accent: string; glow: string }[] = [
  { id: 'living', label: 'Living', emoji: '🌱', accent: '#22C55E', glow: '#86EFAC' },
  { id: 'nonliving', label: 'Non-living', emoji: '📦', accent: '#818CF8', glow: '#A5B4FC' },
];

const VOICE = 'Sort into Living or Non-living. Tap an item, then tap the category.';
const PALETTE = { accent: '#6366F1', glow: '#A5B4FC', secondary: '#818CF8' } as const;

const COACH: Record<string, string> = {
  dog: 'Dogs breathe and grow — are they living?',
  car: 'Cars do not grow or breathe on their own.',
  flower: 'Flowers are plants — they are living!',
  book: 'Books are made by people — not alive.',
  bird: 'Birds fly and eat — living things!',
  chair: 'Chairs are objects — not alive.',
};

function ItemChip({
  item,
  selected,
  placed,
  onPress,
}: {
  item: (typeof ITEMS)[number];
  selected: boolean;
  placed: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.05, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [selected, scale]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        disabled={placed}
        style={({ pressed }) => [
          styles.itemChip,
          selected && styles.itemSelected,
          placed && styles.itemPlaced,
          pressed && !placed && styles.pressed,
        ]}
        accessibilityLabel={item.label}
      >
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <Text style={styles.itemLabel}>{item.label}</Text>
        {placed ? <Text style={styles.placedMark}>✓</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

function CategoryBin({
  cat,
  active,
  shake,
  count,
  onPress,
}: {
  cat: (typeof CATEGORIES)[number];
  active: boolean;
  shake: boolean;
  count: number;
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

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.binWrap, anim]}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.96, { damping: 10 });
          setTimeout(() => {
            scale.value = withSpring(1, { damping: 10 });
          }, 120);
          onPress();
        }}
        style={({ pressed }) => [
          styles.bin,
          { borderColor: active ? cat.glow : `${cat.accent}66` },
          active && { backgroundColor: `${cat.accent}28` },
          pressed && styles.pressed,
        ]}
        accessibilityLabel={cat.label}
      >
        <LinearGradient colors={[`${cat.accent}33`, 'rgba(8,12,40,0.55)']} style={styles.binGrad} />
        <Text style={styles.binEmoji}>{cat.emoji}</Text>
        <Text style={[styles.binLabel, { color: cat.glow }]}>{cat.label}</Text>
        {count > 0 ? <Text style={styles.binCount}>{count} sorted</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export interface CategoryLogicLivingNonLivingLevel9Session1GameProps {
  onComplete: () => void;
}

export function CategoryLogicLivingNonLivingLevel9Session1Game({
  onComplete,
}: CategoryLogicLivingNonLivingLevel9Session1GameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongBin, setWrongBin] = useState<Category | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const sortedCount = sorted.size;
  const progressPct = (sortedCount / ITEMS.length) * 100;
  const selectedItem = ITEMS.find((i) => i.id === selectedId);

  const livingCount = ITEMS.filter((i) => sorted.has(i.id) && i.category === 'living').length;
  const nonlivingCount = ITEMS.filter((i) => sorted.has(i.id) && i.category === 'nonliving').length;

  const handleItemTap = useCallback(
    (id: string) => {
      if (sorted.has(id)) return;
      setSelectedId(id);
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
        setWrongBin(category);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Is it alive or not alive?', 0.7);
        setSelectedId(null);
        setTimeout(() => setWrongBin(null), 700);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak('Correct!', 0.6);
      const nextSorted = new Set(sorted).add(selectedId);
      setSorted(nextSorted);
      setSelectedId(null);

      if (nextSorted.size >= ITEMS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [onComplete, selectedId, sorted],
  );

  const coachLine = selectedItem
    ? COACH[selectedItem.id] ?? `Is ${selectedItem.label} living or non-living?`
    : sortedCount === 0
      ? 'Tap an item from the tray, then pick Living or Non-living!'
      : `${sortedCount} of ${ITEMS.length} sorted — keep going!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You sorted Living and Non-living!"
        badgeEmoji="🌱"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="CATEGORY LOGIC · GAME 4"
      title="Living or Non-living?"
      instruction="Tap an item, then tap the category it belongs to."
      mascot="🌱"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>ITEMS SORTED</Text>
          <Text style={styles.progressCount}>
            {sortedCount} / {ITEMS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PALETTE.accent, PALETTE.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.trayFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.trayGlow}
        />
        <Text style={styles.frameLabel}>GALAXY TRAY · PICK AN ITEM</Text>
        <View style={styles.itemsRow}>
          {ITEMS.map((item) => (
            <ItemChip
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              placed={sorted.has(item.id)}
              onPress={() => handleItemTap(item.id)}
            />
          ))}
        </View>
      </View>

      <Text style={styles.prompt}>
        {selectedId ? 'Now tap a category bin' : 'Select an item first'}
      </Text>

      <View style={styles.categoriesRow}>
        {CATEGORIES.map((cat) => (
          <CategoryBin
            key={cat.id}
            cat={cat}
            active={!!selectedId}
            shake={wrongBin === cat.id}
            count={cat.id === 'living' ? livingCount : nonlivingCount}
            onPress={() => handleCategoryTap(cat.id)}
          />
        ))}
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: PALETTE.glow },
  progressCount: { fontSize: 14, fontWeight: '900', color: CW.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  trayFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  trayGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  itemChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: CW.glassBorder,
    backgroundColor: 'rgba(8,12,40,0.75)',
    alignItems: 'center',
    minWidth: 72,
  },
  itemSelected: {
    borderColor: PALETTE.glow,
    backgroundColor: 'rgba(99,102,241,0.22)',
  },
  itemPlaced: { opacity: 0.45 },
  itemEmoji: { fontSize: 28 },
  itemLabel: { fontSize: 11, fontWeight: '800', color: CW.textLight, marginTop: 2 },
  placedMark: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 10,
    fontWeight: '900',
    color: CW.goodGlow,
  },
  prompt: {
    fontSize: 15,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 14,
  },
  categoriesRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  binWrap: { flex: 1, minWidth: 130, maxWidth: 160 },
  bin: {
    borderRadius: 18,
    borderWidth: 2.5,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  binGrad: { ...StyleSheet.absoluteFillObject },
  binEmoji: { fontSize: 34 },
  binLabel: { fontSize: 15, fontWeight: '900', marginTop: 6 },
  binCount: { fontSize: 10, fontWeight: '700', color: CW.textMuted, marginTop: 4 },
  pressed: { opacity: 0.88 },
});

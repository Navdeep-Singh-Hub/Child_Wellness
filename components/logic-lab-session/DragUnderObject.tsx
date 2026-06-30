/**
 * Game 2 — Shadow Hollow: place objects UNDER furniture (chair & table).
 * Logic Lab · Section 6 · Session 3 (Preposition UNDER)
 */
import { LogicLabGameShell } from '@/components/logic-lab-session/shared/LogicLabGameShell';
import { LL } from '@/components/logic-lab-session/shared/logicLabTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const FURNITURE = [
  { id: 'chair', label: 'Chair', emoji: '🪑', accent: '#A78BFA' },
  { id: 'table', label: 'Table', emoji: '🪵', accent: '#D97706' },
] as const;

const ITEMS = [
  { id: 'ball', label: 'Ball', emoji: '⚽' },
  { id: 'toy', label: 'Toy', emoji: '🧸' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
] as const;

type FurnitureId = (typeof FURNITURE)[number]['id'];
type ItemId = (typeof ITEMS)[number]['id'];

const VOICE = 'Place the objects UNDER the furniture. Tap an object, then tap the chair or table.';

const HOLLOW = { violet: '#7C3AED', glow: '#A78BFA', shadow: '#4C1D95' } as const;

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={bar.label}>{done}/{total} tucked UNDER</Text>
    </View>
  );
}

function ObjectChip({
  item,
  selected,
  onPress,
}: {
  item: (typeof ITEMS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSpring(selected ? 1.06 : 1, { damping: 10 });
  }, [selected, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={[styles.chip, selected && styles.chipSelected]}
        accessibilityLabel={`${item.label}${selected ? ', selected' : ''}`}
        accessibilityState={{ selected }}
      >
        <Text style={styles.chipEmoji}>{item.emoji}</Text>
        <Text style={styles.chipLabel}>{item.label}</Text>
        {selected && <Text style={styles.chipBadge}>PICKED</Text>}
      </Pressable>
    </Animated.View>
  );
}

function FurnitureHollow({
  piece,
  itemsUnder,
  ready,
  snapKey,
  onPress,
}: {
  piece: (typeof FURNITURE)[number];
  itemsUnder: ItemId[];
  ready: boolean;
  snapKey: number;
  onPress: () => void;
}) {
  const pulse = useSharedValue(0);
  const snap = useSharedValue(1);

  useEffect(() => {
    if (!ready) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 550 }), withTiming(0, { duration: 550 })),
      -1,
      false,
    );
  }, [ready, pulse]);

  useEffect(() => {
    if (snapKey === 0) return;
    snap.value = withSequence(withSpring(1.07, { damping: 7 }), withSpring(1));
  }, [snapKey, snap]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: snap.value }],
    borderColor: ready ? `rgba(167,139,250,${0.4 + pulse.value * 0.45})` : LL.glassBorder,
  }));

  return (
    <Animated.View style={[styles.hollowOuter, anim]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.hollow, pressed && styles.pressed]}>
        <LinearGradient colors={[`${piece.accent}33`, 'rgba(15,23,42,0.6)']} style={styles.hollowGrad} />
        <Text style={styles.hollowTag}>UNDER ZONE</Text>
        <Text style={styles.furnitureEmoji}>{piece.emoji}</Text>
        <Text style={styles.furnitureLabel}>{piece.label}</Text>
        <View style={styles.shadowPit}>
          {itemsUnder.length === 0 ? (
            <Text style={styles.pitEmpty}>Hide UNDER here</Text>
          ) : (
            <View style={styles.underRow}>
              {itemsUnder.map((id) => {
                const item = ITEMS.find((i) => i.id === id)!;
                return (
                  <View key={id} style={styles.underChip}>
                    <Text style={styles.underEmoji}>{item.emoji}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function DragUnderObject({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
  const [placedUnder, setPlacedUnder] = useState<Partial<Record<ItemId, FurnitureId>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapKey, setSnapKey] = useState(0);

  const placedCount = Object.keys(placedUnder).length;
  const phase = selectedItem ? 'drop' : 'pick';

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const itemsByFurniture = useMemo(() => {
    const map: Record<FurnitureId, ItemId[]> = { chair: [], table: [] };
    for (const [itemId, fId] of Object.entries(placedUnder) as [ItemId, FurnitureId][]) {
      map[fId].push(itemId);
    }
    return map;
  }, [placedUnder]);

  const handleFurnitureTap = useCallback(
    (furnitureId: FurnitureId) => {
      if (!selectedItem) {
        speak('Pick an object from the loft first.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      const item = ITEMS.find((i) => i.id === selectedItem)!;
      speak(`${item.label} is UNDER the ${furnitureId}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSnapKey((k) => k + 1);

      const next = { ...placedUnder, [selectedItem]: furnitureId };
      setPlacedUnder(next);
      setSelectedItem(null);

      if (Object.keys(next).length === ITEMS.length) {
        speak('All objects are UNDER! Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [selectedItem, placedUnder, onComplete],
  );

  const coachLine =
    phase === 'pick'
      ? placedCount === 0
        ? 'Pick an object — then tuck it UNDER the furniture.'
        : `${ITEMS.length - placedCount} more to hide UNDER.`
      : 'Tap chair or table to place your object UNDER it.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Shadow Hollow!"
        subtitle="Every object is UNDER the furniture!"
        badgeEmoji="🌑"
      />
    );
  }

  const remaining = ITEMS.filter((i) => !placedUnder[i.id]);

  return (
    <LogicLabGameShell
      studio="SHADOW HOLLOW · GAME 2"
      title="Place objects UNDER"
      instruction="Tap an object, then tap furniture to tuck it UNDER."
      mascot="🌑"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 3 · UNDER</Text>
      </View>

      <ProgressBar done={placedCount} total={ITEMS.length} />

      <View style={styles.phaseRow}>
        <View style={[styles.phase, phase === 'pick' && styles.phaseOn]}>
          <Text style={styles.phaseNum}>1</Text>
          <Text style={styles.phaseTxt}>Pick</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={[styles.phase, phase === 'drop' && styles.phaseOn]}>
          <Text style={styles.phaseNum}>2</Text>
          <Text style={styles.phaseTxt}>Tuck UNDER</Text>
        </View>
      </View>

      <View style={styles.loft}>
        <Text style={styles.loftLabel}>LOFT SHELF — objects waiting</Text>
        <View style={styles.chipRow}>
          {remaining.length === 0 ? (
            <Text style={styles.loftDone}>All hidden ✓</Text>
          ) : (
            remaining.map((item) => (
              <ObjectChip
                key={item.id}
                item={item}
                selected={selectedItem === item.id}
                onPress={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              />
            ))
          )}
        </View>
      </View>

      <View style={styles.furnitureRow}>
        {FURNITURE.map((f) => (
          <FurnitureHollow
            key={f.id}
            piece={f}
            itemsUnder={itemsByFurniture[f.id]}
            ready={!!selectedItem}
            snapKey={snapKey}
            onPress={() => handleFurnitureTap(f.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 12, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: HOLLOW.violet, borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: HOLLOW.glow, textAlign: 'center' },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1,
    borderColor: `${HOLLOW.violet}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: HOLLOW.glow },
  phaseRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 14 },
  phase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  phaseOn: { borderColor: HOLLOW.glow, backgroundColor: 'rgba(124,58,237,0.14)' },
  phaseNum: { fontSize: 12, fontWeight: '900', color: HOLLOW.glow },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: LL.textLight },
  arrow: { color: LL.textMuted, fontWeight: '700' },
  loft: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(30,27,75,0.45)',
    padding: 14,
    marginBottom: 16,
  },
  loftLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: HOLLOW.glow,
    textAlign: 'center',
    marginBottom: 10,
  },
  loftDone: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: LL.good, paddingVertical: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  chip: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.6)',
    minWidth: 86,
  },
  chipSelected: { borderColor: HOLLOW.glow, backgroundColor: 'rgba(124,58,237,0.14)' },
  chipEmoji: { fontSize: 34 },
  chipLabel: { fontSize: 13, fontWeight: '800', color: LL.textLight, marginTop: 4 },
  chipBadge: { marginTop: 4, fontSize: 8, fontWeight: '900', color: HOLLOW.glow, letterSpacing: 0.8 },
  furnitureRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  hollowOuter: { borderRadius: 22 },
  hollow: {
    width: 150,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: LL.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 12,
  },
  hollowGrad: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.9 },
  hollowTag: { marginTop: 10, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, color: HOLLOW.glow },
  furnitureEmoji: { fontSize: 38, marginTop: 2 },
  furnitureLabel: { fontSize: 15, fontWeight: '900', color: LL.textLight },
  shadowPit: {
    marginTop: 10,
    width: '88%',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${HOLLOW.shadow}88`,
    backgroundColor: 'rgba(76,29,149,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  pitEmpty: { fontSize: 11, fontWeight: '600', color: LL.textMuted },
  underRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  underChip: {
    backgroundColor: 'rgba(124,58,237,0.35)',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: HOLLOW.glow,
  },
  underEmoji: { fontSize: 22 },
});

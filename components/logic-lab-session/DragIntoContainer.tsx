/**
 * Game 2 — Containment Bay: put objects IN containers (tap object → tap bay).
 * Logic Lab · Section 6 · Session 1 (Preposition IN)
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

const CONTAINERS = [
  { id: 'box', label: 'Steel Box', emoji: '📦', accent: '#818CF8' },
  { id: 'basket', label: 'Woven Basket', emoji: '🧺', accent: '#FBBF24' },
] as const;

const ITEMS = [
  { id: 'apple', label: 'Apple', emoji: '🍎' },
  { id: 'toy', label: 'Toy', emoji: '🧸' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
] as const;

type ContainerId = (typeof CONTAINERS)[number]['id'];
type ItemId = (typeof ITEMS)[number]['id'];

const VOICE = 'Put the objects IN the containers. Tap an object, then tap a container.';

function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={ring.wrap}>
      <View style={ring.track}>
        <View style={[ring.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={ring.label}>
        {done}/{total} inside
      </Text>
    </View>
  );
}

function ItemChip({
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
        style={[
          styles.itemChip,
          selected && styles.itemChipSelected,
        ]}
        accessibilityLabel={`${item.label}${selected ? ', selected' : ''}`}
        accessibilityState={{ selected }}
      >
        {selected && <View style={styles.itemGlow} />}
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <Text style={styles.itemLabel}>{item.label}</Text>
        {selected && <Text style={styles.pickBadge}>PICKED</Text>}
      </Pressable>
    </Animated.View>
  );
}

function ContainmentBay({
  container,
  itemsInside,
  ready,
  snapKey,
  onPress,
}: {
  container: (typeof CONTAINERS)[number];
  itemsInside: ItemId[];
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
    snap.value = withSequence(withSpring(1.1, { damping: 6 }), withSpring(1));
  }, [snapKey, snap]);

  const bayAnim = useAnimatedStyle(() => ({
    transform: [{ scale: snap.value }],
    borderColor: ready
      ? `rgba(103,232,249,${0.5 + pulse.value * 0.45})`
      : LL.glassBorder,
  }));

  return (
    <Animated.View style={[styles.bayOuter, bayAnim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.bay, pressed && styles.pressed]}
        accessibilityLabel={`Drop into ${container.label}`}
      >
        <LinearGradient
          colors={[`${container.accent}44`, 'rgba(15,23,42,0.6)']}
          style={styles.bayGrad}
        />
        <Text style={styles.bayTag}>IN ZONE</Text>
        <Text style={styles.bayEmoji}>{container.emoji}</Text>
        <Text style={styles.bayLabel}>{container.label}</Text>
        <View style={styles.bayInterior}>
          {itemsInside.length === 0 ? (
            <Text style={styles.bayEmpty}>Drop here</Text>
          ) : (
            <View style={styles.insideRow}>
              {itemsInside.map((id) => {
                const item = ITEMS.find((i) => i.id === id)!;
                return (
                  <View key={id} style={styles.insideChip}>
                    <Text style={styles.insideEmoji}>{item.emoji}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        {ready && <View style={styles.readyRing} pointerEvents="none" />}
      </Pressable>
    </Animated.View>
  );
}

export function DragIntoContainer({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
  const [placedIn, setPlacedIn] = useState<Partial<Record<ItemId, ContainerId>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapKey, setSnapKey] = useState(0);

  const placedCount = Object.keys(placedIn).length;
  const phase: 'pick' | 'drop' = selectedItem ? 'drop' : 'pick';

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const itemsByContainer = useMemo(() => {
    const map: Record<ContainerId, ItemId[]> = { box: [], basket: [] };
    for (const [itemId, cId] of Object.entries(placedIn) as [ItemId, ContainerId][]) {
      map[cId].push(itemId);
    }
    return map;
  }, [placedIn]);

  const handleContainerTap = useCallback(
    (containerId: ContainerId) => {
      if (!selectedItem) {
        speak('Tap an object on the conveyor first.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      speak(`${selectedItem === 'apple' ? 'Apple' : selectedItem === 'toy' ? 'Toy' : 'Ball'} is IN!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSnapKey((k) => k + 1);

      const nextPlaced = { ...placedIn, [selectedItem]: containerId };
      setPlacedIn(nextPlaced);
      setSelectedItem(null);

      if (Object.keys(nextPlaced).length === ITEMS.length) {
        speak('All objects are IN! Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [selectedItem, placedIn, onComplete],
  );

  const coachLine =
    phase === 'pick'
      ? placedCount === 0
        ? 'Step 1: Pick an object from the conveyor belt.'
        : `${ITEMS.length - placedCount} left — pick the next object.`
      : 'Step 2: Tap a bay to drop your object IN.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Containment Bay!"
        subtitle="Every object is IN a container!"
        badgeEmoji="📥"
      />
    );
  }

  const remaining = ITEMS.filter((i) => !placedIn[i.id]);

  return (
    <LogicLabGameShell
      studio="CONTAINMENT BAY · GAME 2"
      title="Put objects IN"
      instruction="Tap an object, then tap a container bay to drop it IN."
      mascot="📥"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <ProgressRing done={placedCount} total={ITEMS.length} />

      <View style={styles.phaseStrip}>
        <View style={[styles.phasePill, phase === 'pick' && styles.phaseActive]}>
          <Text style={styles.phaseNum}>1</Text>
          <Text style={styles.phaseTxt}>Pick</Text>
        </View>
        <View style={styles.phaseArrow}>→</View>
        <View style={[styles.phasePill, phase === 'drop' && styles.phaseActive]}>
          <Text style={styles.phaseNum}>2</Text>
          <Text style={styles.phaseTxt}>Drop IN</Text>
        </View>
      </View>

      <View style={styles.conveyor}>
        <LinearGradient colors={['rgba(34,211,238,0.15)', 'transparent']} style={styles.conveyorGlow} />
        <Text style={styles.conveyorLabel}>CONVEYOR</Text>
        <View style={styles.itemsRow}>
          {remaining.length === 0 ? (
            <Text style={styles.conveyorDone}>All loaded ✓</Text>
          ) : (
            remaining.map((item) => (
              <ItemChip
                key={item.id}
                item={item}
                selected={selectedItem === item.id}
                onPress={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              />
            ))
          )}
        </View>
      </View>

      <View style={styles.baysRow}>
        {CONTAINERS.map((c) => (
          <ContainmentBay
            key={c.id}
            container={c}
            itemsInside={itemsByContainer[c.id]}
            ready={!!selectedItem}
            snapKey={snapKey}
            onPress={() => handleContainerTap(c.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const ring = StyleSheet.create({
  wrap: { marginBottom: 14, gap: 6 },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: LL.cyan,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: LL.cyanGlow,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  phaseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  phasePill: {
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
  phaseActive: {
    borderColor: LL.cyanGlow,
    backgroundColor: 'rgba(34,211,238,0.15)',
  },
  phaseNum: { fontSize: 12, fontWeight: '900', color: LL.cyanGlow },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: LL.textLight },
  phaseArrow: { fontSize: 16, color: LL.textMuted, fontWeight: '700' },
  conveyor: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(30,27,75,0.5)',
    padding: 14,
    marginBottom: 18,
    overflow: 'hidden',
  },
  conveyorGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  conveyorLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: LL.cyanGlow,
    marginBottom: 10,
    textAlign: 'center',
  },
  conveyorDone: {
    fontSize: 15,
    fontWeight: '700',
    color: LL.good,
    textAlign: 'center',
    paddingVertical: 12,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  itemChip: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.65)',
    minWidth: 88,
    overflow: 'hidden',
  },
  itemChipSelected: {
    borderColor: LL.cyanGlow,
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
  itemGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  itemEmoji: { fontSize: 36 },
  itemLabel: { fontSize: 13, fontWeight: '800', color: LL.textLight, marginTop: 4 },
  pickBadge: {
    marginTop: 6,
    fontSize: 8,
    fontWeight: '900',
    color: LL.cyanGlow,
    letterSpacing: 0.8,
  },
  baysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  bayOuter: { borderRadius: 22 },
  bay: {
    width: 148,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: LL.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 12,
  },
  bayGrad: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.9 },
  bayTag: {
    marginTop: 10,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: LL.cyanGlow,
  },
  bayEmoji: { fontSize: 40, marginTop: 4 },
  bayLabel: { fontSize: 14, fontWeight: '800', color: LL.textLight, marginTop: 2 },
  bayInterior: {
    marginTop: 10,
    width: '86%',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(165,180,252,0.35)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  bayEmpty: { fontSize: 11, fontWeight: '600', color: LL.textMuted },
  insideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  insideChip: {
    backgroundColor: 'rgba(99,102,241,0.35)',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: LL.glassBorder,
  },
  insideEmoji: { fontSize: 22 },
  readyRing: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: LL.cyan,
  },
});

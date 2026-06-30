/**
 * Game 2 — Pair Lane: place objects NEXT TO anchors (plate & house).
 * Logic Lab · Section 6 · Session 4 (Preposition NEXT TO)
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

const ANCHORS = [
  { id: 'plate', label: 'Plate', emoji: '🍽️', accent: '#F97316', tag: 'Dining anchor' },
  { id: 'house', label: 'House', emoji: '🏠', accent: '#34D399', tag: 'Home anchor' },
] as const;

const ITEMS = [
  { id: 'cup', label: 'Cup', emoji: '🥤' },
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'dog', label: 'Dog', emoji: '🐕' },
] as const;

type AnchorId = (typeof ANCHORS)[number]['id'];
type ItemId = (typeof ITEMS)[number]['id'];

const VOICE = 'Place the objects NEXT TO the other object. Tap an object, then tap plate or house.';

const LANE = { coral: '#F97316', glow: '#FDBA74', mint: '#34D399', path: '#FEF3C7' } as const;

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={bar.label}>{done}/{total} paired NEXT TO</Text>
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
        {selected && <Text style={styles.chipBadge}>READY</Text>}
      </Pressable>
    </Animated.View>
  );
}

function AnchorPad({
  anchor,
  itemsBeside,
  ready,
  snapKey,
  onPress,
}: {
  anchor: (typeof ANCHORS)[number];
  itemsBeside: ItemId[];
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
    snap.value = withSequence(withSpring(1.08, { damping: 7 }), withSpring(1));
  }, [snapKey, snap]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: snap.value }],
    borderColor: ready ? `rgba(253,186,116,${0.45 + pulse.value * 0.4})` : LL.glassBorder,
  }));

  return (
    <Animated.View style={[styles.padOuter, anim]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pad, pressed && styles.pressed]}>
        <LinearGradient colors={[`${anchor.accent}44`, 'rgba(15,23,42,0.55)']} style={styles.padGrad} />
        <Text style={styles.padTag}>NEXT TO ZONE</Text>
        <View style={styles.anchorRow}>
          <View style={styles.besideSlot}>
            {itemsBeside.length === 0 ? (
              <Text style={styles.besideEmpty}>↔</Text>
            ) : (
              <View style={styles.besideRow}>
                {itemsBeside.map((id) => {
                  const item = ITEMS.find((i) => i.id === id)!;
                  return (
                    <View key={id} style={styles.besideChip}>
                      <Text style={styles.besideEmoji}>{item.emoji}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          <View style={styles.anchorCore}>
            <Text style={styles.padEmoji}>{anchor.emoji}</Text>
            <Text style={styles.padLabel}>{anchor.label}</Text>
          </View>
        </View>
        <Text style={styles.padHint}>{anchor.tag}</Text>
        <Text style={styles.padCue}>{ready ? 'Tap to place beside' : 'Place object beside here'}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function DragNextTo({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
  const [placedNextTo, setPlacedNextTo] = useState<Partial<Record<ItemId, AnchorId>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapKey, setSnapKey] = useState(0);

  const placedCount = Object.keys(placedNextTo).length;
  const phase = selectedItem ? 'drop' : 'pick';

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const itemsByAnchor = useMemo(() => {
    const map: Record<AnchorId, ItemId[]> = { plate: [], house: [] };
    for (const [itemId, aId] of Object.entries(placedNextTo) as [ItemId, AnchorId][]) {
      map[aId].push(itemId);
    }
    return map;
  }, [placedNextTo]);

  const handleAnchorTap = useCallback(
    (anchorId: AnchorId) => {
      if (!selectedItem) {
        speak('Pick an object from the lane first.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      const item = ITEMS.find((i) => i.id === selectedItem)!;
      const anchor = ANCHORS.find((a) => a.id === anchorId)!;
      speak(`${item.label} is NEXT TO the ${anchor.label}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSnapKey((k) => k + 1);

      const next = { ...placedNextTo, [selectedItem]: anchorId };
      setPlacedNextTo(next);
      setSelectedItem(null);

      if (Object.keys(next).length === ITEMS.length) {
        speak('All objects are NEXT TO! Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [selectedItem, placedNextTo, onComplete],
  );

  const coachLine =
    phase === 'pick'
      ? placedCount === 0
        ? 'Pick an object — then place it NEXT TO the plate or house.'
        : `${ITEMS.length - placedCount} more to pair beside an anchor.`
      : 'Tap plate or house to set your object beside it.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Pair Lane!"
        subtitle="Every object is NEXT TO an anchor!"
        badgeEmoji="🍽️"
      />
    );
  }

  const remaining = ITEMS.filter((i) => !placedNextTo[i.id]);

  return (
    <LogicLabGameShell
      studio="PAIR LANE · GAME 2"
      title="Place objects NEXT TO"
      instruction="Tap an object, then tap plate or house to put it beside."
      mascot="🍽️"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.sessionBadge}>
        <Text style={styles.sessionBadgeTxt}>SESSION 4 · NEXT TO</Text>
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
          <Text style={styles.phaseTxt}>Place NEXT TO</Text>
        </View>
      </View>

      <View style={styles.depot}>
        <Text style={styles.depotLabel}>LANE DEPOT — objects waiting</Text>
        <View style={styles.chipRow}>
          {remaining.length === 0 ? (
            <Text style={styles.depotDone}>All paired ✓</Text>
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

      <View style={styles.padsRow}>
        {ANCHORS.map((a) => (
          <AnchorPad
            key={a.id}
            anchor={a}
            itemsBeside={itemsByAnchor[a.id]}
            ready={!!selectedItem}
            snapKey={snapKey}
            onPress={() => handleAnchorTap(a.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 12, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: LANE.coral, borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: LANE.glow, textAlign: 'center' },
});

const styles = StyleSheet.create({
  sessionBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderWidth: 1,
    borderColor: `${LANE.coral}55`,
    marginBottom: 10,
  },
  sessionBadgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: LANE.glow },
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
  phaseOn: { borderColor: LANE.glow, backgroundColor: 'rgba(249,115,22,0.14)' },
  phaseNum: { fontSize: 12, fontWeight: '900', color: LANE.glow },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: LL.textLight },
  arrow: { color: LL.textMuted, fontWeight: '700' },
  depot: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(30,27,75,0.45)',
    padding: 14,
    marginBottom: 16,
  },
  depotLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: LANE.glow,
    textAlign: 'center',
    marginBottom: 10,
  },
  depotDone: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: LL.good, paddingVertical: 10 },
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
  chipSelected: { borderColor: LANE.glow, backgroundColor: 'rgba(249,115,22,0.12)' },
  chipEmoji: { fontSize: 34 },
  chipLabel: { fontSize: 13, fontWeight: '800', color: LL.textLight, marginTop: 4 },
  chipBadge: { marginTop: 4, fontSize: 8, fontWeight: '900', color: LANE.glow, letterSpacing: 0.8 },
  padsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  padOuter: { borderRadius: 22 },
  pad: {
    width: 158,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: LL.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  padGrad: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.9 },
  padTag: { marginTop: 10, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, color: LANE.glow },
  anchorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    width: '100%',
  },
  besideSlot: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(253,186,116,0.35)',
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  besideEmpty: { fontSize: 18, fontWeight: '900', color: LANE.mint },
  besideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  besideChip: {
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: LANE.glow,
  },
  besideEmoji: { fontSize: 22 },
  anchorCore: { alignItems: 'center', minWidth: 56 },
  padEmoji: { fontSize: 36 },
  padLabel: { fontSize: 14, fontWeight: '900', color: LL.textLight },
  padHint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 6 },
  padCue: { fontSize: 10, fontWeight: '700', color: LANE.glow, marginTop: 4, textAlign: 'center' },
});

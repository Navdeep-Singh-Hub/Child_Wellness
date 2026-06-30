/**
 * Game 2 — Bridge Plaza: place objects BETWEEN pairs (trees & chairs).
 * Logic Lab · Section 6 · Session 6 (Preposition BETWEEN)
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

const ZONES = [
  { id: 'trees', label: 'Two Trees', emoji: '🌳', accent: '#22C55E', tag: 'Forest pair' },
  { id: 'chairs', label: 'Two Chairs', emoji: '🪑', accent: '#8B5CF6', tag: 'Seat pair' },
] as const;

const ITEMS = [
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
] as const;

type ZoneId = (typeof ZONES)[number]['id'];
type ItemId = (typeof ITEMS)[number]['id'];

const VOICE = 'Place the object BETWEEN the two items. Tap cat or ball, then tap a zone.';

const MID = { rose: '#F472B6', glow: '#FBCFE8', violet: '#8B5CF6', bridge: '#6366F1' } as const;

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={bar.label}>{done}/{total} placed BETWEEN</Text>
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

function BridgePad({
  zone,
  itemsInMiddle,
  ready,
  snapKey,
  onPress,
}: {
  zone: (typeof ZONES)[number];
  itemsInMiddle: ItemId[];
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
    borderColor: ready ? `rgba(251,207,232,${0.45 + pulse.value * 0.4})` : LL.glassBorder,
  }));

  return (
    <Animated.View style={[styles.padOuter, anim]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pad, pressed && styles.pressed]}>
        <LinearGradient colors={[`${zone.accent}44`, 'rgba(15,23,42,0.55)']} style={styles.padGrad} />
        <Text style={styles.padTag}>BETWEEN ZONE</Text>
        <View style={styles.bridgeRow}>
          <Text style={styles.anchorEmoji}>{zone.emoji}</Text>
          <View style={styles.midSlot}>
            {itemsInMiddle.length === 0 ? (
              <Text style={styles.midEmpty}>↔</Text>
            ) : (
              <View style={styles.midRow}>
                {itemsInMiddle.map((id) => {
                  const item = ITEMS.find((i) => i.id === id)!;
                  return (
                    <View key={id} style={styles.midChip}>
                      <Text style={styles.midEmoji}>{item.emoji}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          <Text style={styles.anchorEmoji}>{zone.emoji}</Text>
        </View>
        <Text style={styles.padLabel}>{zone.label}</Text>
        <Text style={styles.padHint}>{zone.tag}</Text>
        <Text style={styles.padCue}>{ready ? 'Tap to place in middle' : 'Object goes BETWEEN'}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function DragBetweenObjects({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
  const [placedBetween, setPlacedBetween] = useState<Partial<Record<ItemId, ZoneId>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapKey, setSnapKey] = useState(0);

  const placedCount = Object.keys(placedBetween).length;
  const phase = selectedItem ? 'drop' : 'pick';

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const itemsByZone = useMemo(() => {
    const map: Record<ZoneId, ItemId[]> = { trees: [], chairs: [] };
    for (const [itemId, zId] of Object.entries(placedBetween) as [ItemId, ZoneId][]) {
      map[zId].push(itemId);
    }
    return map;
  }, [placedBetween]);

  const handleZoneTap = useCallback(
    (zoneId: ZoneId) => {
      if (!selectedItem) {
        speak('Pick an object from the plaza first.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      const item = ITEMS.find((i) => i.id === selectedItem)!;
      const zone = ZONES.find((z) => z.id === zoneId)!;
      speak(`${item.label} is BETWEEN the ${zone.label}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSnapKey((k) => k + 1);

      const next = { ...placedBetween, [selectedItem]: zoneId };
      setPlacedBetween(next);
      setSelectedItem(null);

      if (Object.keys(next).length === ITEMS.length) {
        speak('All objects are BETWEEN! Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [selectedItem, placedBetween, onComplete],
  );

  const coachLine =
    phase === 'pick'
      ? placedCount === 0
        ? 'Pick cat or ball — then place it BETWEEN two items.'
        : `${ITEMS.length - placedCount} more to set in the middle.`
      : 'Tap a zone to put your object BETWEEN the pair.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Bridge Plaza!"
        subtitle="Every object is BETWEEN a pair!"
        badgeEmoji="🐱"
      />
    );
  }

  const remaining = ITEMS.filter((i) => !placedBetween[i.id]);

  return (
    <LogicLabGameShell
      studio="BRIDGE PLAZA · GAME 2"
      title="Place objects BETWEEN"
      instruction="Tap an object, then tap a zone to put it in the middle."
      mascot="🐱"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.sessionBadge}>
        <Text style={styles.sessionBadgeTxt}>SESSION 6 · BETWEEN</Text>
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
          <Text style={styles.phaseTxt}>Place BETWEEN</Text>
        </View>
      </View>

      <View style={styles.depot}>
        <Text style={styles.depotLabel}>PLAZA DEPOT — objects waiting</Text>
        <View style={styles.chipRow}>
          {remaining.length === 0 ? (
            <Text style={styles.depotDone}>All bridged ✓</Text>
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
        {ZONES.map((z) => (
          <BridgePad
            key={z.id}
            zone={z}
            itemsInMiddle={itemsByZone[z.id]}
            ready={!!selectedItem}
            snapKey={snapKey}
            onPress={() => handleZoneTap(z.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 12, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: MID.violet, borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: MID.glow, textAlign: 'center' },
});

const styles = StyleSheet.create({
  sessionBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: `${MID.violet}55`,
    marginBottom: 10,
  },
  sessionBadgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: MID.glow },
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
  phaseOn: { borderColor: MID.glow, backgroundColor: 'rgba(139,92,246,0.14)' },
  phaseNum: { fontSize: 12, fontWeight: '900', color: MID.glow },
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
    color: MID.glow,
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
  chipSelected: { borderColor: MID.glow, backgroundColor: 'rgba(139,92,246,0.12)' },
  chipEmoji: { fontSize: 34 },
  chipLabel: { fontSize: 13, fontWeight: '800', color: LL.textLight, marginTop: 4 },
  chipBadge: { marginTop: 4, fontSize: 8, fontWeight: '900', color: MID.glow, letterSpacing: 0.8 },
  padsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  padOuter: { borderRadius: 22, borderWidth: 2.5 },
  pad: {
    width: 168,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  padGrad: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.9 },
  padTag: { marginTop: 10, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, color: MID.glow },
  bridgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    width: '100%',
  },
  anchorEmoji: { fontSize: 32 },
  midSlot: {
    flex: 1,
    minHeight: 52,
    maxWidth: 72,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(244,114,182,0.4)',
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  midEmpty: { fontSize: 18, fontWeight: '900', color: MID.rose },
  midRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  midChip: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: MID.glow,
  },
  midEmoji: { fontSize: 22 },
  padLabel: { fontSize: 13, fontWeight: '900', color: LL.textLight, marginTop: 8 },
  padHint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 4 },
  padCue: { fontSize: 10, fontWeight: '700', color: MID.glow, marginTop: 4, textAlign: 'center' },
});

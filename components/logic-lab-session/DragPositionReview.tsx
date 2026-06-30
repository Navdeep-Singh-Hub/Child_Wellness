/**
 * Game 2 — Zone Yard: place ball IN, cup ON, cat UNDER (mixed review).
 * Logic Lab · Section 6 · Session 7 (Mixed Prepositions Review)
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

const ITEMS = [
  { id: 'ball', label: 'Ball', emoji: '⚽', correctZone: 'inBox', hint: 'Goes IN' },
  { id: 'cup', label: 'Cup', emoji: '☕', correctZone: 'onTable', hint: 'Goes ON' },
  { id: 'cat', label: 'Cat', emoji: '🐱', correctZone: 'underTable', hint: 'Goes UNDER' },
] as const;

const ZONES = [
  { id: 'inBox', label: 'IN the box', prep: 'IN', emoji: '📦', accent: '#818CF8', tag: 'Inside' },
  { id: 'onTable', label: 'ON the table', prep: 'ON', emoji: '🪵', accent: '#38BDF8', tag: 'On top' },
  { id: 'underTable', label: 'UNDER the table', prep: 'UNDER', emoji: '🪵', accent: '#A78BFA', tag: 'Below' },
] as const;

type ItemId = (typeof ITEMS)[number]['id'];
type ZoneId = (typeof ZONES)[number]['id'];

const VOICE = 'Place each object in the correct position. Ball in box, cup on table, cat under table.';

const REVIEW = { gold: '#FBBF24', glow: '#FDE68A', prism: '#6366F1', deep: '#312E81' } as const;

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <LinearGradient
          colors={[REVIEW.gold, REVIEW.prism]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[bar.fill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={bar.label}>{done}/{total} placed correctly</Text>
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
        <Text style={styles.chipHint}>{item.hint}</Text>
        {selected && <Text style={styles.chipBadge}>READY</Text>}
      </Pressable>
    </Animated.View>
  );
}

function ZonePad({
  zone,
  placedItem,
  ready,
  shake,
  snapKey,
  onPress,
}: {
  zone: (typeof ZONES)[number];
  placedItem?: (typeof ITEMS)[number];
  ready: boolean;
  shake: boolean;
  snapKey: number;
  onPress: () => void;
}) {
  const pulse = useSharedValue(0);
  const snap = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!ready || placedItem) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 550 }), withTiming(0, { duration: 550 })),
      -1,
      false,
    );
  }, [ready, placedItem, pulse]);

  useEffect(() => {
    if (snapKey === 0) return;
    snap.value = withSequence(withSpring(1.08, { damping: 7 }), withSpring(1));
  }, [snapKey, snap]);

  useEffect(() => {
    if (!shake) return;
    shakeX.value = withSequence(
      withTiming(10, { duration: 45 }),
      withTiming(-10, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [shake, shakeX]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: snap.value }, { translateX: shakeX.value }],
    borderColor: ready && !placedItem ? `rgba(253,230,138,${0.45 + pulse.value * 0.4})` : LL.glassBorder,
  }));

  return (
    <Animated.View style={[styles.padOuter, anim]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pad, pressed && styles.pressed]}>
        <LinearGradient colors={[`${zone.accent}44`, 'rgba(15,23,42,0.55)']} style={styles.padGrad} />
        <Text style={[styles.padTag, { color: zone.accent }]}>{zone.prep} ZONE</Text>
        <View style={styles.padVisual}>
          {zone.id === 'inBox' && (
            <View style={[styles.box, placedItem && styles.boxFilled]}>
              {placedItem ? (
                <Text style={styles.placedEmoji}>{placedItem.emoji}</Text>
              ) : (
                <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
              )}
            </View>
          )}
          {zone.id === 'onTable' && (
            <View style={styles.onStage}>
              {placedItem && <Text style={[styles.placedEmoji, styles.onItem]}>{placedItem.emoji}</Text>}
              <Text style={styles.tableEmoji}>🪵</Text>
            </View>
          )}
          {zone.id === 'underTable' && (
            <View style={styles.underStage}>
              <Text style={styles.tableEmoji}>🪵</Text>
              <View style={styles.underSlot}>
                {placedItem ? (
                  <Text style={styles.placedEmoji}>{placedItem.emoji}</Text>
                ) : (
                  <Text style={styles.underHint}>↓</Text>
                )}
              </View>
            </View>
          )}
        </View>
        <Text style={styles.padLabel}>{zone.label}</Text>
        <Text style={styles.padCue}>{zone.tag}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function DragPositionReview({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
  const [placements, setPlacements] = useState<Partial<Record<ItemId, ZoneId>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongZone, setWrongZone] = useState<ZoneId | null>(null);
  const [snapKey, setSnapKey] = useState(0);

  const placedCount = Object.keys(placements).length;
  const phase = selectedItem ? 'drop' : 'pick';

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const itemByZone = useMemo(() => {
    const map: Partial<Record<ZoneId, (typeof ITEMS)[number]>> = {};
    for (const [itemId, zoneId] of Object.entries(placements) as [ItemId, ZoneId][]) {
      const item = ITEMS.find((i) => i.id === itemId);
      if (item) map[zoneId] = item;
    }
    return map;
  }, [placements]);

  const handleZoneTap = useCallback(
    (zoneId: ZoneId) => {
      if (!selectedItem) {
        speak('Pick an object from the yard first.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      const item = ITEMS.find((i) => i.id === selectedItem)!;
      const zone = ZONES.find((z) => z.id === zoneId)!;

      if (item.correctZone !== zoneId) {
        setWrongZone(zoneId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        const need =
          item.correctZone === 'inBox' ? 'IN the box' : item.correctZone === 'onTable' ? 'ON the table' : 'UNDER the table';
        speak(`Not ${zone.prep}. The ${item.label} goes ${need}!`);
        setTimeout(() => setWrongZone(null), 700);
        return;
      }

      const prep = zone.prep.toLowerCase();
      speak(`${item.label} is ${prep}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSnapKey((k) => k + 1);

      const next = { ...placements, [selectedItem]: zoneId };
      setPlacements(next);
      setSelectedItem(null);

      if (Object.keys(next).length === ITEMS.length) {
        speak('All objects in the right place! Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [selectedItem, placements, onComplete],
  );

  const coachLine =
    phase === 'pick'
      ? placedCount === 0
        ? 'Ball → IN box. Cup → ON table. Cat → UNDER table.'
        : `${ITEMS.length - placedCount} more to place in the right zone.`
      : 'Tap the zone that matches your object\'s position word.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Zone Yard!"
        subtitle="IN, ON, UNDER — all correct!"
        badgeEmoji="📦"
      />
    );
  }

  const remaining = ITEMS.filter((i) => !placements[i.id]);

  return (
    <LogicLabGameShell
      studio="ZONE YARD · GAME 2"
      title="Place the objects correctly"
      instruction="Each object has one right zone — ball IN, cup ON, cat UNDER."
      mascot="📦"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 7 · MIXED REVIEW</Text>
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
          <Text style={styles.phaseTxt}>Place</Text>
        </View>
      </View>

      <View style={styles.depot}>
        <Text style={styles.depotLabel}>OBJECT DEPOT</Text>
        <View style={styles.chipRow}>
          {remaining.length === 0 ? (
            <Text style={styles.depotDone}>All placed ✓</Text>
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

      <View style={styles.zonesCol}>
        {ZONES.map((z) => (
          <ZonePad
            key={z.id}
            zone={z}
            placedItem={itemByZone[z.id]}
            ready={!!selectedItem}
            shake={wrongZone === z.id}
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
  fill: { height: '100%', borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: REVIEW.glow, textAlign: 'center' },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: `${REVIEW.gold}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: REVIEW.glow },
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
  phaseOn: { borderColor: REVIEW.glow, backgroundColor: 'rgba(251,191,36,0.12)' },
  phaseNum: { fontSize: 12, fontWeight: '900', color: REVIEW.glow },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: LL.textLight },
  arrow: { color: LL.textMuted, fontWeight: '700' },
  depot: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(30,27,75,0.45)',
    padding: 14,
    marginBottom: 14,
  },
  depotLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: REVIEW.glow,
    textAlign: 'center',
    marginBottom: 10,
  },
  depotDone: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: LL.good, paddingVertical: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  chip: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.6)',
    minWidth: 96,
  },
  chipSelected: { borderColor: REVIEW.glow, backgroundColor: 'rgba(251,191,36,0.1)' },
  chipEmoji: { fontSize: 34 },
  chipLabel: { fontSize: 13, fontWeight: '800', color: LL.textLight, marginTop: 4 },
  chipHint: { fontSize: 9, fontWeight: '700', color: REVIEW.gold, marginTop: 2 },
  chipBadge: { marginTop: 4, fontSize: 8, fontWeight: '900', color: REVIEW.glow, letterSpacing: 0.8 },
  zonesCol: { gap: 12 },
  padOuter: { borderRadius: 20, borderWidth: 2.5 },
  pad: {
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  padGrad: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.9 },
  padTag: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8 },
  padVisual: { minHeight: 64, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  box: {
    width: 64,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#818CF8',
    backgroundColor: 'rgba(129,140,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { backgroundColor: 'rgba(129,140,248,0.22)' },
  zoneEmoji: { fontSize: 30 },
  onStage: { alignItems: 'center', justifyContent: 'flex-end', height: 56 },
  onItem: { marginBottom: 4 },
  underStage: { alignItems: 'center' },
  underSlot: {
    width: 56,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1,
    borderColor: '#A78BFA55',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  underHint: { fontSize: 16, fontWeight: '900', color: '#A78BFA' },
  tableEmoji: { fontSize: 32 },
  placedEmoji: { fontSize: 28 },
  padLabel: { fontSize: 14, fontWeight: '900', color: LL.textLight },
  padCue: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 4 },
});

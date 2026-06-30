/**
 * Game 2 — Perch Plaza: place objects ON surfaces (chair & table).
 * Logic Lab · Section 6 · Session 2 (Preposition ON)
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

const SURFACES = [
  { id: 'chair', label: 'Chair', emoji: '🪑', accent: '#A78BFA', tag: 'Seat surface' },
  { id: 'table', label: 'Table', emoji: '🪵', accent: '#F59E0B', tag: 'Flat surface' },
] as const;

const ITEMS = [
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'book', label: 'Book', emoji: '📖' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
] as const;

type SurfaceId = (typeof SURFACES)[number]['id'];
type ItemId = (typeof ITEMS)[number]['id'];

const VOICE = 'Place the objects ON the surfaces. Tap an object, then tap a surface.';

const PLAZA = { teal: '#2DD4BF', tealGlow: '#5EEAD4', deck: '#0D9488' } as const;

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={bar.label}>{done}/{total} perched ON</Text>
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

function SurfacePad({
  surface,
  itemsOn,
  ready,
  snapKey,
  onPress,
}: {
  surface: (typeof SURFACES)[number];
  itemsOn: ItemId[];
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
    borderColor: ready ? `rgba(45,212,191,${0.45 + pulse.value * 0.4})` : LL.glassBorder,
  }));

  return (
    <Animated.View style={[styles.padOuter, anim]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pad, pressed && styles.pressed]}>
        <LinearGradient colors={[`${surface.accent}44`, 'rgba(15,23,42,0.55)']} style={styles.padGrad} />
        <Text style={styles.padTag}>ON ZONE</Text>
        <Text style={styles.padEmoji}>{surface.emoji}</Text>
        <Text style={styles.padLabel}>{surface.label}</Text>
        <Text style={styles.padHint}>{surface.tag}</Text>
        <View style={styles.padTop}>
          {itemsOn.length === 0 ? (
            <Text style={styles.padEmpty}>Place ON here</Text>
          ) : (
            <View style={styles.onRow}>
              {itemsOn.map((id) => {
                const item = ITEMS.find((i) => i.id === id)!;
                return (
                  <View key={id} style={styles.onChip}>
                    <Text style={styles.onEmoji}>{item.emoji}</Text>
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

export function DragOnSurface({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
  const [placedOn, setPlacedOn] = useState<Partial<Record<ItemId, SurfaceId>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapKey, setSnapKey] = useState(0);

  const placedCount = Object.keys(placedOn).length;
  const phase = selectedItem ? 'drop' : 'pick';

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const itemsBySurface = useMemo(() => {
    const map: Record<SurfaceId, ItemId[]> = { chair: [], table: [] };
    for (const [itemId, sId] of Object.entries(placedOn) as [ItemId, SurfaceId][]) {
      map[sId].push(itemId);
    }
    return map;
  }, [placedOn]);

  const handleSurfaceTap = useCallback(
    (surfaceId: SurfaceId) => {
      if (!selectedItem) {
        speak('Pick an object from the plaza first.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      const item = ITEMS.find((i) => i.id === selectedItem)!;
      speak(`${item.label} is ON the ${surfaceId}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSnapKey((k) => k + 1);

      const next = { ...placedOn, [selectedItem]: surfaceId };
      setPlacedOn(next);
      setSelectedItem(null);

      if (Object.keys(next).length === ITEMS.length) {
        speak('All objects are ON! Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [selectedItem, placedOn, onComplete],
  );

  const coachLine =
    phase === 'pick'
      ? placedCount === 0
        ? 'Pick an object — then place it ON a chair or table.'
        : `${ITEMS.length - placedCount} more to perch ON a surface.`
      : 'Tap a surface pad to set your object ON top.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Perch Plaza!"
        subtitle="Every object is ON a surface!"
        badgeEmoji="🪑"
      />
    );
  }

  const remaining = ITEMS.filter((i) => !placedOn[i.id]);

  return (
    <LogicLabGameShell
      studio="PERCH PLAZA · GAME 2"
      title="Place objects ON"
      instruction="Tap an object, then tap a surface to set it ON top."
      mascot="🪑"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.sessionBadge}>
        <Text style={styles.sessionBadgeTxt}>SESSION 2 · ON</Text>
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
          <Text style={styles.phaseTxt}>Place ON</Text>
        </View>
      </View>

      <View style={styles.loft}>
        <Text style={styles.loftLabel}>PLAZA LOFT — objects waiting</Text>
        <View style={styles.chipRow}>
          {remaining.length === 0 ? (
            <Text style={styles.loftDone}>All perched ✓</Text>
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
        {SURFACES.map((s) => (
          <SurfacePad
            key={s.id}
            surface={s}
            itemsOn={itemsBySurface[s.id]}
            ready={!!selectedItem}
            snapKey={snapKey}
            onPress={() => handleSurfaceTap(s.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 12, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: PLAZA.teal, borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: PLAZA.tealGlow, textAlign: 'center' },
});

const styles = StyleSheet.create({
  sessionBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(45,212,191,0.12)',
    borderWidth: 1,
    borderColor: `${PLAZA.teal}55`,
    marginBottom: 10,
  },
  sessionBadgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: PLAZA.tealGlow },
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
  phaseOn: { borderColor: PLAZA.tealGlow, backgroundColor: 'rgba(45,212,191,0.14)' },
  phaseNum: { fontSize: 12, fontWeight: '900', color: PLAZA.tealGlow },
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
    color: PLAZA.tealGlow,
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
  chipSelected: { borderColor: PLAZA.tealGlow, backgroundColor: 'rgba(45,212,191,0.12)' },
  chipEmoji: { fontSize: 34 },
  chipLabel: { fontSize: 13, fontWeight: '800', color: LL.textLight, marginTop: 4 },
  chipBadge: { marginTop: 4, fontSize: 8, fontWeight: '900', color: PLAZA.tealGlow, letterSpacing: 0.8 },
  padsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  padOuter: { borderRadius: 22 },
  pad: {
    width: 150,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: LL.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 12,
  },
  padGrad: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.9 },
  padTag: { marginTop: 10, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, color: PLAZA.tealGlow },
  padEmoji: { fontSize: 38, marginTop: 2 },
  padLabel: { fontSize: 15, fontWeight: '900', color: LL.textLight },
  padHint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 2 },
  padTop: {
    marginTop: 10,
    width: '88%',
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(94,234,212,0.35)',
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  padEmpty: { fontSize: 11, fontWeight: '600', color: LL.textMuted },
  onRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  onChip: {
    backgroundColor: 'rgba(45,212,191,0.2)',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: PLAZA.tealGlow,
  },
  onEmoji: { fontSize: 22 },
});

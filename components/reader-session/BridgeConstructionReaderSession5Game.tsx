/**
 * Level 7 Reader — Session 5, Game 4: Span Forge
 * Build a simple bridge — tap block, then tap slot (left pillar, right pillar, top deck).
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
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PARTS = [
  { id: 'left', label: 'Left pillar', emoji: '🟫' },
  { id: 'right', label: 'Right pillar', emoji: '🟫' },
  { id: 'top', label: 'Top deck', emoji: '🟧' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

const SLOT_META: Record<PartId, { label: string; emoji: string; hint: string }> = {
  left: { label: 'Left pillar', emoji: '🟫', hint: 'left' },
  right: { label: 'Right pillar', emoji: '🟫', hint: 'right' },
  top: { label: 'Top deck', emoji: '🟧', hint: 'span' },
};

const VOICE =
  'Build the bridge. Tap a block, then tap where it goes: two pillars and the top.';
const FORGE = { accent: '#6366F1', glow: '#A5B4FC', cyan: '#38BDF8', deck: '#FBBF24' } as const;

function BlockChip({
  part,
  selected,
  dimmed,
  onPress,
}: {
  part: (typeof PARTS)[number];
  selected: boolean;
  dimmed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        dimmed && styles.chipDimmed,
        pressed && styles.chipPressed,
      ]}
      accessibilityLabel={part.label}
    >
      <Text style={styles.chipEmoji}>{part.emoji}</Text>
      <Text style={styles.chipLabel}>{part.label}</Text>
    </Pressable>
  );
}

function SpanSlot({
  slotId,
  filled,
  active,
  shake,
  onPress,
}: {
  slotId: PartId;
  filled: boolean;
  active: boolean;
  shake: boolean;
  onPress: () => void;
}) {
  const meta = SLOT_META[slotId];
  const pulse = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (active && !filled) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 650 }), withTiming(0, { duration: 650 })),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [active, filled, pulse]);

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
    borderColor:
      active && !filled
        ? `rgba(99,102,241,${0.5 + pulse.value * 0.45})`
        : filled
          ? `${RD.good}99`
          : RD.glassBorder,
    transform: [
      { translateX: shakeX.value },
      { scale: active && !filled ? 1 + pulse.value * 0.04 : filled ? 1.02 : 1 },
    ],
  }));

  const isTop = slotId === 'top';
  const isPillar = slotId === 'left' || slotId === 'right';

  return (
    <Animated.View
      style={[
        styles.slot,
        isTop && styles.slotTop,
        isPillar && styles.slotPillar,
        filled && styles.slotFilled,
        anim,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={filled}
        style={styles.slotPress}
        accessibilityLabel={`${meta.label} slot`}
      >
        <Text style={styles.slotEmoji}>{filled ? meta.emoji : '?'}</Text>
        <Text style={styles.slotHint}>{filled ? meta.label : meta.hint}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface BridgeConstructionReaderSession5GameProps {
  onComplete: () => void;
}

export function BridgeConstructionReaderSession5Game({ onComplete }: BridgeConstructionReaderSession5GameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({
    left: false,
    right: false,
    top: false,
  });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeSlot, setShakeSlot] = useState<PartId | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const placedCount = Object.values(slots).filter(Boolean).length;
  const progressPct = (placedCount / PARTS.length) * 100;
  const allFilled = placedCount >= PARTS.length;

  const handlePartTap = useCallback(
    (id: PartId) => {
      if (allFilled) return;
      setSelectedPart(id);
      setShakeSlot(null);
      const part = PARTS.find((p) => p.id === id);
      speak(part?.label ?? id, 0.6);
    },
    [allFilled],
  );

  const handleSlotTap = useCallback(
    (slotId: PartId) => {
      if (slots[slotId]) return;
      if (!selectedPart) {
        setShakeSlot(slotId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Pick a block first, then tap a span slot.', 0.65);
        setTimeout(() => setShakeSlot(null), 700);
        return;
      }
      const next = { ...slots, [slotId]: true };
      setSlots(next);
      setSelectedPart(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const filled = (PARTS as readonly { id: PartId }[]).every((p) => next[p.id]);
      if (filled) {
        speak('You built a bridge!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        speak('Placed! Pick the next block.', 0.65);
      }
    },
    [selectedPart, slots, onComplete],
  );

  const coachLine = selectedPart
    ? `Tap a span slot to place the ${PARTS.find((p) => p.id === selectedPart)?.label ?? 'block'}`
    : placedCount === 0
      ? 'Pick a block, then forge it onto the bridge frame!'
      : `${placedCount} of ${PARTS.length} placed — keep spanning!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Span Forge!"
        subtitle="You built the bridge!"
        badgeEmoji="🌉"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="SPAN FORGE · GAME 4"
      title="Build the bridge"
      instruction="Tap a block, then tap a span slot: two pillars and the top deck."
      mascot="🌉"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.phaseStrip}>
        <View style={[styles.phasePill, selectedPart ? styles.phaseDone : styles.phaseActive]}>
          <Text style={styles.phaseTxt}>1 · Pick</Text>
        </View>
        <Text style={styles.phaseArrow}>→</Text>
        <View style={[styles.phasePill, selectedPart ? styles.phaseActive : styles.phaseIdle]}>
          <Text style={styles.phaseTxt}>2 · Forge</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>BLOCKS PLACED</Text>
          <Text style={styles.progressCount}>
            {placedCount} / {PARTS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[FORGE.accent, FORGE.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.trayFrame}>
        <Text style={styles.trayLabel}>BLOCK TRAY</Text>
        <View style={styles.chipsRow}>
          {PARTS.map((p) => (
            <BlockChip
              key={p.id}
              part={p}
              selected={selectedPart === p.id}
              dimmed={allFilled}
              onPress={() => handlePartTap(p.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.spanFrame}>
        <LinearGradient
          colors={[`${FORGE.accent}33`, 'transparent', `${FORGE.cyan}22`]}
          style={styles.spanGlow}
        />
        <Text style={styles.spanLabel}>SPAN ASSEMBLY</Text>

        <View style={styles.gapVisual}>
          <Text style={styles.gapLine}>— — — chasm — — —</Text>
        </View>

        <View style={styles.bridgeSchematic}>
          <View style={styles.deckRow}>
            <SpanSlot
              slotId="top"
              filled={slots.top}
              active={!!selectedPart}
              shake={shakeSlot === 'top'}
              onPress={() => handleSlotTap('top')}
            />
          </View>
          <View style={styles.pillarsRow}>
            <SpanSlot
              slotId="left"
              filled={slots.left}
              active={!!selectedPart}
              shake={shakeSlot === 'left'}
              onPress={() => handleSlotTap('left')}
            />
            <SpanSlot
              slotId="right"
              filled={slots.right}
              active={!!selectedPart}
              shake={shakeSlot === 'right'}
              onPress={() => handleSlotTap('right')}
            />
          </View>
        </View>

        <Text style={styles.spanHint}>🌉 Top deck · Left pillar · Right pillar</Text>
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
    backgroundColor: 'rgba(99,102,241,0.22)',
    borderColor: FORGE.glow,
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
    color: FORGE.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: RD.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  trayFrame: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${FORGE.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.45)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  trayLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: FORGE.glow,
    textAlign: 'center',
    marginBottom: 10,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: RD.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    minWidth: 88,
  },
  chipSelected: {
    borderColor: FORGE.glow,
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  chipDimmed: { opacity: 0.55 },
  chipPressed: { opacity: 0.9 },
  chipEmoji: { fontSize: 28, marginBottom: 2 },
  chipLabel: { fontSize: 11, fontWeight: '800', color: RD.textMuted },
  spanFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${FORGE.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  spanGlow: { ...StyleSheet.absoluteFillObject },
  spanLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: FORGE.glow,
    textAlign: 'center',
    marginBottom: 8,
  },
  gapVisual: { alignItems: 'center', marginBottom: 10 },
  gapLine: { fontSize: 11, fontWeight: '700', color: RD.textMuted, letterSpacing: 1 },
  bridgeSchematic: { alignItems: 'center', gap: 12 },
  deckRow: { flexDirection: 'row', justifyContent: 'center' },
  pillarsRow: { flexDirection: 'row', gap: 48 },
  slot: {
    borderRadius: 14,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTop: { width: 130, height: 44 },
  slotPillar: { width: 58, height: 68 },
  slotFilled: { backgroundColor: 'rgba(52,211,153,0.12)' },
  slotPress: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  slotEmoji: { fontSize: 24 },
  slotHint: { fontSize: 9, fontWeight: '800', color: RD.textMuted, marginTop: 2 },
  spanHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: FORGE.glow,
    textAlign: 'center',
  },
});

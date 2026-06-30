/**
 * Level 7 Reader — Session 2, Game 4: Rover Build
 * Assemble a bicycle — tap part then slot. Parts: frame, wheel, wheel, handlebars.
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
  { id: 'frame', label: 'Frame', emoji: '🔲' },
  { id: 'wheel1', label: 'Wheel', emoji: '⚙️' },
  { id: 'wheel2', label: 'Wheel', emoji: '⚙️' },
  { id: 'handlebars', label: 'Handlebars', emoji: '〰️' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

const SLOT_META: Record<
  PartId,
  { label: string; emoji: string; hint: string }
> = {
  frame: { label: 'Frame', emoji: '🔲', hint: 'body' },
  handlebars: { label: 'Handlebars', emoji: '〰️', hint: 'steer' },
  wheel1: { label: 'Wheel', emoji: '⚙️', hint: 'front' },
  wheel2: { label: 'Wheel', emoji: '⚙️', hint: 'rear' },
};

const VOICE =
  'Build the bicycle. Tap a part, then tap where it goes: frame, two wheels, and handlebars.';
const ROVER = { accent: '#06B6D4', accentBright: '#67E8F9', mint: '#34D399' } as const;

function ComponentChip({
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

function DockSlot({
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
        ? `rgba(6,182,212,${0.5 + pulse.value * 0.45})`
        : filled
          ? `${ROVER.mint}99`
          : RD.glassBorder,
    transform: [
      { translateX: shakeX.value },
      { scale: active && !filled ? 1 + pulse.value * 0.04 : filled ? 1.02 : 1 },
    ],
  }));

  const isWheel = slotId === 'wheel1' || slotId === 'wheel2';
  const isFrame = slotId === 'frame';
  const isBars = slotId === 'handlebars';

  return (
    <Animated.View
      style={[
        styles.slot,
        isFrame && styles.slotFrame,
        isBars && styles.slotBars,
        isWheel && styles.slotWheel,
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

export interface BicyclePuzzleReaderSession2GameProps {
  onComplete: () => void;
}

export function BicyclePuzzleReaderSession2Game({ onComplete }: BicyclePuzzleReaderSession2GameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({
    frame: false,
    wheel1: false,
    wheel2: false,
    handlebars: false,
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
        speak('Pick a part first, then tap a dock slot.', 0.65);
        setTimeout(() => setShakeSlot(null), 700);
        return;
      }
      const next = { ...slots, [slotId]: true };
      setSlots(next);
      setSelectedPart(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const filled = (PARTS as readonly { id: PartId }[]).every((p) => next[p.id]);
      if (filled) {
        speak('You built a bicycle!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        speak('Docked! Pick the next part.', 0.65);
      }
    },
    [selectedPart, slots, onComplete],
  );

  const coachLine = selectedPart
    ? `Tap a dock slot to place the ${PARTS.find((p) => p.id === selectedPart)?.label ?? 'part'}`
    : placedCount === 0
      ? 'Pick a component, then dock it on the rover frame!'
      : `${placedCount} of ${PARTS.length} docked — keep building!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Rover Build!"
        subtitle="You built the bicycle!"
        badgeEmoji="🛸"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="ROVER BUILD · GAME 4"
      title="Assemble the rover"
      instruction="Tap a part, then tap a dock slot to build the bicycle."
      mascot="🛸"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.phaseStrip}>
        <View style={[styles.phasePill, selectedPart ? styles.phaseDone : styles.phaseActive]}>
          <Text style={styles.phaseTxt}>1 · Pick</Text>
        </View>
        <Text style={styles.phaseArrow}>→</Text>
        <View style={[styles.phasePill, selectedPart ? styles.phaseActive : styles.phaseIdle]}>
          <Text style={styles.phaseTxt}>2 · Dock</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>PARTS DOCKED</Text>
          <Text style={styles.progressCount}>
            {placedCount} / {PARTS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[ROVER.accent, ROVER.mint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.trayFrame}>
        <Text style={styles.trayLabel}>COMPONENT TRAY</Text>
        <View style={styles.chipsRow}>
          {PARTS.map((p) => (
            <ComponentChip
              key={p.id}
              part={p}
              selected={selectedPart === p.id}
              dimmed={allFilled}
              onPress={() => handlePartTap(p.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bayFrame}>
        <LinearGradient
          colors={[`${ROVER.accent}33`, 'transparent', `${ROVER.mint}22`]}
          style={styles.bayGlow}
        />
        <Text style={styles.bayLabel}>ASSEMBLY BAY</Text>
        <View style={styles.bikeSchematic}>
          <View style={styles.topRow}>
            <DockSlot
              slotId="frame"
              filled={slots.frame}
              active={!!selectedPart}
              shake={shakeSlot === 'frame'}
              onPress={() => handleSlotTap('frame')}
            />
            <DockSlot
              slotId="handlebars"
              filled={slots.handlebars}
              active={!!selectedPart}
              shake={shakeSlot === 'handlebars'}
              onPress={() => handleSlotTap('handlebars')}
            />
          </View>
          <View style={styles.wheelsRow}>
            <DockSlot
              slotId="wheel1"
              filled={slots.wheel1}
              active={!!selectedPart}
              shake={shakeSlot === 'wheel1'}
              onPress={() => handleSlotTap('wheel1')}
            />
            <DockSlot
              slotId="wheel2"
              filled={slots.wheel2}
              active={!!selectedPart}
              shake={shakeSlot === 'wheel2'}
              onPress={() => handleSlotTap('wheel2')}
            />
          </View>
        </View>
        <Text style={styles.bayHint}>🚲 Frame · Handlebars · 2 Wheels</Text>
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
    backgroundColor: 'rgba(6,182,212,0.22)',
    borderColor: ROVER.accentBright,
  },
  phaseDone: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: ROVER.mint,
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
    color: ROVER.accentBright,
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
    borderColor: `${ROVER.accent}55`,
    backgroundColor: 'rgba(8,40,60,0.45)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  trayLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: ROVER.accentBright,
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
    minWidth: 76,
  },
  chipSelected: {
    borderColor: ROVER.accentBright,
    backgroundColor: 'rgba(6,182,212,0.18)',
  },
  chipDimmed: { opacity: 0.55 },
  chipPressed: { opacity: 0.9 },
  chipEmoji: { fontSize: 28, marginBottom: 2 },
  chipLabel: { fontSize: 11, fontWeight: '800', color: RD.textMuted },
  bayFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${ROVER.accent}55`,
    backgroundColor: 'rgba(8,40,60,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  bayGlow: { ...StyleSheet.absoluteFillObject },
  bayLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: ROVER.accentBright,
    textAlign: 'center',
    marginBottom: 12,
  },
  bikeSchematic: { alignItems: 'center', gap: 14 },
  topRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  wheelsRow: { flexDirection: 'row', gap: 28 },
  slot: {
    borderRadius: 14,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFrame: { width: 84, height: 50 },
  slotBars: { width: 58, height: 50 },
  slotWheel: { width: 54, height: 54, borderRadius: 27 },
  slotFilled: { backgroundColor: 'rgba(52,211,153,0.12)' },
  slotPress: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  slotEmoji: { fontSize: 24 },
  slotHint: { fontSize: 9, fontWeight: '800', color: RD.textMuted, marginTop: 2 },
  bayHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: ROVER.accentBright,
    textAlign: 'center',
  },
});

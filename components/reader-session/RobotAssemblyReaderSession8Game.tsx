/**
 * Level 7 Reader — Session 8, Game 4: Bot Assembly
 * Build a robot — tap piece, then tap slot (head, body, left arm, right arm).
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
  { id: 'head', label: 'Head', emoji: '🤖' },
  { id: 'body', label: 'Body', emoji: '🟦' },
  { id: 'armL', label: 'Left arm', emoji: '🦾' },
  { id: 'armR', label: 'Right arm', emoji: '🦾' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

const SLOT_META: Record<PartId, { label: string; emoji: string; hint: string }> = {
  head: { label: 'Head', emoji: '🤖', hint: 'top' },
  body: { label: 'Body', emoji: '🟦', hint: 'center' },
  armL: { label: 'Left arm', emoji: '🦾', hint: 'left' },
  armR: { label: 'Right arm', emoji: '🦾', hint: 'right' },
};

const VOICE =
  'Build the robot. Tap a piece, then tap where it goes: head on top, body in the middle, arms on the sides.';
const BOT = { accent: '#0EA5E9', glow: '#38BDF8', spark: '#EF4444' } as const;

function PartChip({
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

function BotSlot({
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
        ? `rgba(14,165,233,${0.5 + pulse.value * 0.45})`
        : filled
          ? `${RD.good}99`
          : RD.glassBorder,
    transform: [
      { translateX: shakeX.value },
      { scale: active && !filled ? 1 + pulse.value * 0.04 : filled ? 1.02 : 1 },
    ],
  }));

  const isHead = slotId === 'head';
  const isBody = slotId === 'body';
  const isArm = slotId === 'armL' || slotId === 'armR';

  return (
    <Animated.View
      style={[
        styles.slot,
        isHead && styles.slotHead,
        isBody && styles.slotBody,
        isArm && styles.slotArm,
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

export interface RobotAssemblyReaderSession8GameProps {
  onComplete: () => void;
}

export function RobotAssemblyReaderSession8Game({ onComplete }: RobotAssemblyReaderSession8GameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({
    head: false,
    body: false,
    armL: false,
    armR: false,
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
        speak('Pick a piece first, then tap a bot slot.', 0.65);
        setTimeout(() => setShakeSlot(null), 700);
        return;
      }
      const next = { ...slots, [slotId]: true };
      setSlots(next);
      setSelectedPart(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const filled = (PARTS as readonly { id: PartId }[]).every((p) => next[p.id]);
      if (filled) {
        speak('You built a robot!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        speak('Locked in! Pick the next piece.', 0.65);
      }
    },
    [selectedPart, slots, onComplete],
  );

  const coachLine = selectedPart
    ? `Tap a slot to place the ${PARTS.find((p) => p.id === selectedPart)?.label ?? 'piece'}`
    : placedCount === 0
      ? 'Pick a piece, then dock it on the bot frame!'
      : `${placedCount} of ${PARTS.length} locked — keep assembling!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Bot Assembly!"
        subtitle="You built the robot!"
        badgeEmoji="🤖"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="BOT ASSEMBLY · GAME 4"
      title="Build the robot"
      instruction="Tap a piece, then tap a slot: head, body, and both arms."
      mascot="🤖"
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
          <Text style={styles.progressLabel}>PARTS LOCKED</Text>
          <Text style={styles.progressCount}>
            {placedCount} / {PARTS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[BOT.accent, BOT.spark]}
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
            <PartChip
              key={p.id}
              part={p}
              selected={selectedPart === p.id}
              dimmed={allFilled}
              onPress={() => handlePartTap(p.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.botFrame}>
        <LinearGradient
          colors={[`${BOT.accent}33`, 'transparent', `${BOT.spark}22`]}
          style={styles.botGlow}
        />
        <Text style={styles.botLabel}>BOT FRAME</Text>
        <View style={styles.botSchematic}>
          <BotSlot
            slotId="head"
            filled={slots.head}
            active={!!selectedPart}
            shake={shakeSlot === 'head'}
            onPress={() => handleSlotTap('head')}
          />
          <View style={styles.torsoRow}>
            <BotSlot
              slotId="armL"
              filled={slots.armL}
              active={!!selectedPart}
              shake={shakeSlot === 'armL'}
              onPress={() => handleSlotTap('armL')}
            />
            <BotSlot
              slotId="body"
              filled={slots.body}
              active={!!selectedPart}
              shake={shakeSlot === 'body'}
              onPress={() => handleSlotTap('body')}
            />
            <BotSlot
              slotId="armR"
              filled={slots.armR}
              active={!!selectedPart}
              shake={shakeSlot === 'armR'}
              onPress={() => handleSlotTap('armR')}
            />
          </View>
        </View>
        <Text style={styles.botHint}>🤖 head · 🟦 body · 🦾 arms</Text>
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
    backgroundColor: 'rgba(14,165,233,0.22)',
    borderColor: BOT.glow,
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
    color: BOT.glow,
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
    borderColor: `${BOT.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.45)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  trayLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: BOT.glow,
    textAlign: 'center',
    marginBottom: 10,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: RD.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    minWidth: 72,
  },
  chipSelected: {
    borderColor: BOT.glow,
    backgroundColor: 'rgba(14,165,233,0.18)',
  },
  chipDimmed: { opacity: 0.55 },
  chipPressed: { opacity: 0.9 },
  chipEmoji: { fontSize: 28, marginBottom: 2 },
  chipLabel: { fontSize: 10, fontWeight: '800', color: RD.textMuted },
  botFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${BOT.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  botGlow: { ...StyleSheet.absoluteFillObject },
  botLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: BOT.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  botSchematic: { alignItems: 'center', gap: 10 },
  torsoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slot: {
    borderRadius: 14,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotHead: { width: 68, height: 56 },
  slotBody: { width: 76, height: 56 },
  slotArm: { width: 52, height: 52 },
  slotFilled: { backgroundColor: 'rgba(52,211,153,0.12)' },
  slotPress: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  slotEmoji: { fontSize: 26 },
  slotHint: { fontSize: 9, fontWeight: '800', color: RD.textMuted, marginTop: 2 },
  botHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: BOT.glow,
    textAlign: 'center',
  },
});

/**
 * Level 9 (Clockwise) — Session 8, Game 3: Shape Forge
 * Fit multiple shapes into a board. Circle, square, triangle, star → matching holes.
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
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const SHAPES = [
  { id: 'circle', label: 'Circle', symbol: '⭕', glyph: '●' },
  { id: 'square', label: 'Square', symbol: '⬜', glyph: '◆' },
  { id: 'triangle', label: 'Triangle', symbol: '🔺', glyph: '▲' },
  { id: 'star', label: 'Star', symbol: '⭐', glyph: '★' },
] as const;

type ShapeId = (typeof SHAPES)[number]['id'];

const HOLE_META: Record<ShapeId, { label: string; symbol: string; hint: string }> = {
  circle: { label: 'Circle', symbol: '⭕', hint: 'round' },
  square: { label: 'Square', symbol: '⬜', hint: 'square' },
  triangle: { label: 'Triangle', symbol: '🔺', hint: 'triangle' },
  star: { label: 'Star', symbol: '⭐', hint: 'star' },
};

const VOICE =
  'Fit each shape into its matching hole on the board. Tap a shape, then tap the correct hole.';
const FORGE = { accent: '#0EA5E9', glow: '#38BDF8', spark: '#EF4444' } as const;

function ShapeChip({
  shape,
  selected,
  dimmed,
  onPress,
}: {
  shape: (typeof SHAPES)[number];
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
      accessibilityLabel={shape.label}
    >
      <Text style={styles.chipSymbol}>{shape.symbol}</Text>
      <Text style={styles.chipGlyph}>{shape.glyph}</Text>
      <Text style={styles.chipLabel}>{shape.label}</Text>
    </Pressable>
  );
}

function ForgeHole({
  holeId,
  filled,
  active,
  shake,
  onPress,
}: {
  holeId: ShapeId;
  filled: boolean;
  active: boolean;
  shake: boolean;
  onPress: () => void;
}) {
  const meta = HOLE_META[holeId];
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
          ? `${CW.good}99`
          : CW.glassBorder,
    transform: [
      { translateX: shakeX.value },
      { scale: active && !filled ? 1 + pulse.value * 0.04 : filled ? 1.02 : 1 },
    ],
  }));

  const isCircle = holeId === 'circle';
  const isSquare = holeId === 'square';

  return (
    <Animated.View
      style={[
        styles.hole,
        isCircle && styles.holeCircle,
        isSquare && styles.holeSquare,
        filled && styles.holeFilled,
        anim,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={filled}
        style={styles.holePress}
        accessibilityLabel={`${meta.label} hole`}
      >
        <Text style={styles.holeSymbol}>{filled ? meta.symbol : '?'}</Text>
        <Text style={styles.holeHint}>{filled ? meta.label : meta.hint}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ShapePuzzleBoardLevel9Session8GameProps {
  onComplete: () => void;
}

export function ShapePuzzleBoardLevel9Session8Game({ onComplete }: ShapePuzzleBoardLevel9Session8GameProps) {
  const [slots, setSlots] = useState<Record<ShapeId, boolean>>({
    circle: false,
    square: false,
    triangle: false,
    star: false,
  });
  const [selectedShape, setSelectedShape] = useState<ShapeId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeHole, setShakeHole] = useState<ShapeId | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const placedCount = Object.values(slots).filter(Boolean).length;
  const progressPct = (placedCount / SHAPES.length) * 100;
  const allFilled = placedCount >= SHAPES.length;

  const handleShapeTap = useCallback(
    (id: ShapeId) => {
      if (allFilled) return;
      setSelectedShape(id);
      setShakeHole(null);
      const shape = SHAPES.find((s) => s.id === id);
      speak(shape?.label ?? id, 0.6);
    },
    [allFilled],
  );

  const handleHoleTap = useCallback(
    (holeId: ShapeId) => {
      if (slots[holeId]) return;
      if (!selectedShape) {
        setShakeHole(holeId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Pick a shape first, then tap a matching hole.', 0.65);
        setTimeout(() => setShakeHole(null), 700);
        return;
      }
      if (selectedShape !== holeId) {
        setShakeHole(holeId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('That shape does not fit there. Match each shape to its own hole!', 0.7);
        setSelectedShape(null);
        setTimeout(() => setShakeHole(null), 700);
        return;
      }
      const next = { ...slots, [holeId]: true };
      setSlots(next);
      setSelectedShape(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      speak('Correct fit!', 0.6);
      const filled = (SHAPES as readonly { id: ShapeId }[]).every((s) => next[s.id]);
      if (filled) {
        speak('You fitted all the shapes!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [selectedShape, slots, onComplete],
  );

  const coachLine = selectedShape
    ? `Tap the ${selectedShape} hole for the ${SHAPES.find((s) => s.id === selectedShape)?.label ?? 'shape'}`
    : placedCount === 0
      ? 'Pick a shape, then forge it into its matching hole!'
      : `${placedCount} of ${SHAPES.length} fitted — keep forging!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Shape Forge!"
        subtitle="You fitted all the shapes!"
        badgeEmoji="🧩"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="SHAPE FORGE · GAME 3"
      title="Fit the shapes"
      instruction="Tap a shape, then tap its matching hole on the forge board."
      mascot="🧩"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.phaseStrip}>
        <View style={[styles.phasePill, selectedShape ? styles.phaseDone : styles.phaseActive]}>
          <Text style={styles.phaseTxt}>1 · Pick</Text>
        </View>
        <Text style={styles.phaseArrow}>→</Text>
        <View style={[styles.phasePill, selectedShape ? styles.phaseActive : styles.phaseIdle]}>
          <Text style={styles.phaseTxt}>2 · Fit</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>SHAPES FITTED</Text>
          <Text style={styles.progressCount}>
            {placedCount} / {SHAPES.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[FORGE.accent, FORGE.spark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.trayFrame}>
        <Text style={styles.trayLabel}>SHAPE TRAY</Text>
        <View style={styles.chipsRow}>
          {SHAPES.map((s) => (
            <ShapeChip
              key={s.id}
              shape={s}
              selected={selectedShape === s.id}
              dimmed={allFilled}
              onPress={() => handleShapeTap(s.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.boardFrame}>
        <LinearGradient
          colors={[`${FORGE.accent}33`, 'transparent', `${FORGE.spark}22`]}
          style={styles.boardGlow}
        />
        <Text style={styles.boardLabel}>FORGE BOARD</Text>
        <View style={styles.holesRow}>
          {SHAPES.map((s) => (
            <ForgeHole
              key={s.id}
              holeId={s.id}
              filled={slots[s.id]}
              active={!!selectedShape}
              shake={shakeHole === s.id}
              onPress={() => handleHoleTap(s.id)}
            />
          ))}
        </View>
        <Text style={styles.boardHint}>⭕ round · ⬜ square · 🔺 triangle · ⭐ star</Text>
      </View>
    </ClockwiseGameShell>
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
    borderColor: FORGE.glow,
  },
  phaseDone: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: CW.good,
  },
  phaseIdle: {
    backgroundColor: 'rgba(11,10,26,0.5)',
    borderColor: CW.glassBorder,
  },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: CW.textLight },
  phaseArrow: { fontSize: 14, fontWeight: '900', color: CW.textMuted },
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
  progressCount: { fontSize: 14, fontWeight: '900', color: CW.textLight },
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
    borderColor: CW.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    minWidth: 78,
  },
  chipSelected: {
    borderColor: FORGE.glow,
    backgroundColor: 'rgba(14,165,233,0.18)',
  },
  chipDimmed: { opacity: 0.55 },
  chipPressed: { opacity: 0.9 },
  chipSymbol: { fontSize: 28, marginBottom: 2 },
  chipGlyph: { fontSize: 11, fontWeight: '900', color: FORGE.glow, marginBottom: 2 },
  chipLabel: { fontSize: 11, fontWeight: '800', color: CW.textMuted },
  boardFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${FORGE.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  boardGlow: { ...StyleSheet.absoluteFillObject },
  boardLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: FORGE.glow,
    textAlign: 'center',
    marginBottom: 14,
  },
  holesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  hole: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeCircle: { borderRadius: 34 },
  holeSquare: { borderRadius: 12 },
  holeFilled: { borderStyle: 'solid', backgroundColor: 'rgba(52,211,153,0.12)' },
  holePress: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  holeSymbol: { fontSize: 28 },
  holeHint: { fontSize: 9, fontWeight: '800', color: CW.textMuted, marginTop: 2 },
  boardHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: FORGE.glow,
    textAlign: 'center',
  },
});

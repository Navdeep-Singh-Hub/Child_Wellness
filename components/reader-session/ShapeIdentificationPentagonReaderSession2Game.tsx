/**
 * Level 7 Reader — Session 2, Game 3: Shape Sector
 * Tap the pentagon. Shapes: circle, square, triangle, pentagon.
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
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SHAPES = [
  { id: 'circle', label: 'Circle', glyph: '●', glow: '#67E8F9', sides: 0 },
  { id: 'square', label: 'Square', glyph: '◆', glow: '#A78BFA', sides: 4 },
  { id: 'triangle', label: 'Triangle', glyph: '▲', glow: '#FDE68A', sides: 3 },
  { id: 'pentagon', label: 'Pentagon', glyph: '⬠', glow: '#34D399', sides: 5 },
] as const;

type ShapeId = (typeof SHAPES)[number]['id'];
const CORRECT_ID: ShapeId = 'pentagon';

const VOICE = 'Tap the pentagon. Find the shape with five sides.';
const SECTOR = { accent: '#06B6D4', accentBright: '#67E8F9', mint: '#34D399' } as const;

function SectorBeacon({
  shape,
  selected,
  feedback,
  onPress,
}: {
  shape: (typeof SHAPES)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 1100 }), withTiming(0, { duration: 1100 })),
      -1,
      true,
    );
  }, [pulse]);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.1, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const halo = useAnimatedStyle(() => ({
    opacity: selected ? 0.35 + pulse.value * 0.2 : 0.12 + pulse.value * 0.1,
  }));

  const border =
    feedback === 'correct' && selected
      ? RD.good
      : feedback === 'wrong' && selected
        ? RD.warn
        : selected
          ? SECTOR.accentBright
          : RD.glassBorder;

  return (
    <Animated.View style={[styles.beaconWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.beacon, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={shape.label}
      >
        <Animated.View style={[styles.beaconHalo, halo, { backgroundColor: `${shape.glow}33` }]} />
        <Text style={[styles.beaconGlyph, { color: shape.glow }]}>{shape.glyph}</Text>
        <Text style={styles.beaconLabel}>{shape.label}</Text>
        {shape.sides > 0 ? (
          <Text style={styles.beaconSides}>{shape.sides} sides</Text>
        ) : (
          <Text style={styles.beaconSides}>round</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export interface ShapeIdentificationPentagonReaderSession2GameProps {
  onComplete: () => void;
}

export function ShapeIdentificationPentagonReaderSession2Game({
  onComplete,
}: ShapeIdentificationPentagonReaderSession2GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ShapeId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: ShapeId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! That is the pentagon!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        const shape = SHAPES.find((s) => s.id === id);
        speak(
          shape?.sides === 3
            ? 'A triangle has three sides. Look for five!'
            : shape?.sides === 4
              ? 'A square has four sides. Find five sides!'
              : 'A circle is round. Find the shape with five sides!',
          0.7,
        );
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  const coachLine =
    attempts === 0
      ? 'A pentagon has 5 straight sides — scan the beacons!'
      : 'Count the sides: 3, 4, or 5?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Shape Sector!"
        subtitle="You found the pentagon!"
        badgeEmoji="⬠"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="SHAPE SECTOR · GAME 3"
      title="Find the pentagon"
      instruction="Tap the shape with five sides."
      mascot="⬠"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetGlyph}>⬠</Text>
        </View>
        <View>
          <Text style={styles.targetLabel}>TARGET SHAPE</Text>
          <Text style={styles.targetName}>Pentagon</Text>
          <Text style={styles.targetHint}>5 straight sides</Text>
        </View>
      </View>

      <View style={styles.radarFrame}>
        <LinearGradient
          colors={[`${SECTOR.accent}33`, 'transparent', `${SECTOR.mint}22`]}
          style={styles.radarGlow}
        />
        <Text style={styles.radarLabel}>SECTOR BEACONS</Text>
        <View style={styles.beaconsRow}>
          {SHAPES.map((shape) => (
            <SectorBeacon
              key={shape.id}
              shape={shape}
              selected={selected === shape.id}
              feedback={feedback}
              onPress={() => handleTap(shape.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Only one beacon has exactly 5 sides</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1.5,
    borderColor: `${SECTOR.mint}55`,
  },
  targetBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(11,10,26,0.6)',
    borderWidth: 2,
    borderColor: `${SECTOR.mint}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetGlyph: { fontSize: 28, color: SECTOR.mint },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: SECTOR.mint,
    marginBottom: 2,
  },
  targetName: { fontSize: 22, fontWeight: '900', color: RD.textLight },
  targetHint: { fontSize: 13, fontWeight: '700', color: RD.textMuted, marginTop: 2 },
  radarFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${SECTOR.accent}55`,
    backgroundColor: 'rgba(8,40,60,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  radarGlow: { ...StyleSheet.absoluteFillObject },
  radarLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: SECTOR.accentBright,
    textAlign: 'center',
    marginBottom: 14,
  },
  beaconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  beaconWrap: { alignItems: 'center' },
  beacon: {
    width: 100,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  beaconHalo: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  beaconGlyph: { fontSize: 38, fontWeight: '900' },
  beaconLabel: { fontSize: 12, fontWeight: '800', color: RD.textLight, marginTop: 6 },
  beaconSides: { fontSize: 10, fontWeight: '700', color: RD.textMuted, marginTop: 2 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1,
    borderColor: `${SECTOR.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: SECTOR.accentBright, textAlign: 'center' },
});

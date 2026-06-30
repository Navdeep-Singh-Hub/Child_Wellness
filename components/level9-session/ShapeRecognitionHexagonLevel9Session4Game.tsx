/**
 * Level 9 (Clockwise) — Session 4, Game 2: Shape Recognition
 * Select the hexagon. Options: circle, square, triangle, pentagon, hexagon.
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
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SHAPES = [
  { id: 'circle', label: 'Circle', symbol: '⭕', sides: 0 },
  { id: 'square', label: 'Square', symbol: '⬜', sides: 4 },
  { id: 'triangle', label: 'Triangle', symbol: '🔺', sides: 3 },
  { id: 'pentagon', label: 'Pentagon', symbol: '⬠', sides: 5 },
  { id: 'hexagon', label: 'Hexagon', symbol: '⬡', sides: 6 },
] as const;

type ShapeId = (typeof SHAPES)[number]['id'];
const CORRECT_ID: ShapeId = 'hexagon';

const VOICE = 'Tap the hexagon. A hexagon has six sides.';
const PALETTE = { accent: '#F59E0B', glow: '#FCD34D', secondary: '#FBBF24' } as const;

function TargetPulse() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.08 }],
    opacity: 0.85 + pulse.value * 0.15,
  }));

  return (
    <Animated.View style={anim}>
      <Text style={styles.targetGlyph}>⬡</Text>
    </Animated.View>
  );
}

function ShapeBeacon({
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

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.08, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? CW.good
      : feedback === 'wrong' && selected
        ? CW.warn
        : selected
          ? PALETTE.glow
          : CW.glassBorder;

  return (
    <Animated.View style={[styles.beaconWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.beacon, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={shape.label}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'rgba(8,12,40,0.55)']}
          style={styles.beaconGrad}
        />
        <Text style={styles.symbol}>{shape.symbol}</Text>
        <Text style={styles.beaconLabel}>{shape.label}</Text>
        {shape.sides > 0 ? (
          <Text style={styles.sideHint}>{shape.sides} sides</Text>
        ) : (
          <Text style={styles.sideHint}>round</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export interface ShapeRecognitionHexagonLevel9Session4GameProps {
  onComplete: () => void;
}

export function ShapeRecognitionHexagonLevel9Session4Game({
  onComplete,
}: ShapeRecognitionHexagonLevel9Session4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ShapeId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const wrongMessage = (id: ShapeId): string => {
    const shape = SHAPES.find((s) => s.id === id);
    if (!shape) return 'Try again. A hexagon has six sides.';
    if (shape.id === 'circle') return 'A circle is round — look for a shape with six sides!';
    if (shape.sides < 6) return `That shape has ${shape.sides} sides. Find the one with six!`;
    return 'Try again. A hexagon has six sides.';
  };

  const handleTap = useCallback(
    (id: ShapeId) => {
      if (feedback === 'correct') return;
      setSelected(id);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! That is the hexagon!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(wrongMessage(id), 0.7);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You found the hexagon!"
        badgeEmoji="⬡"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="SHAPE RECOGNITION · GAME 2"
      title="Find the hexagon"
      instruction="Tap the hexagon. It has six sides."
      mascot="⬡"
      coachLine="A hexagon has six equal sides — count them if you need to!"
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <TargetPulse />
        </View>
        <View>
          <Text style={styles.targetLabel}>TARGET SHAPE</Text>
          <Text style={styles.targetName}>Hexagon</Text>
          <Text style={styles.targetHint}>6 sides · ⬡</Text>
        </View>
      </View>

      <View style={styles.radarFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.radarGlow}
        />
        <Text style={styles.radarLabel}>SHAPE FORGE BEACONS</Text>
        <View style={styles.beaconsRow}>
          {SHAPES.map((shape) => (
            <ShapeBeacon
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
        <Text style={styles.legendTxt}>Only the hexagon has six sides</Text>
      </View>
    </ClockwiseGameShell>
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
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1.5,
    borderColor: `${PALETTE.accent}55`,
  },
  targetBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(8,12,40,0.6)',
    borderWidth: 2,
    borderColor: `${PALETTE.glow}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetGlyph: { fontSize: 32, color: PALETTE.glow },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    marginBottom: 2,
  },
  targetName: { fontSize: 18, fontWeight: '900', color: CW.textLight },
  targetHint: { fontSize: 13, fontWeight: '700', color: CW.textMuted, marginTop: 2 },
  radarFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  radarGlow: { ...StyleSheet.absoluteFillObject },
  radarLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    textAlign: 'center',
    marginBottom: 14,
  },
  beaconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  beaconWrap: { alignItems: 'center' },
  beacon: {
    width: 96,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 18,
    borderWidth: 2.5,
    backgroundColor: 'rgba(8,12,40,0.7)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  beaconGrad: { ...StyleSheet.absoluteFillObject },
  symbol: { fontSize: 32, marginBottom: 4 },
  beaconLabel: { fontSize: 11, fontWeight: '800', color: CW.textMuted, textAlign: 'center' },
  sideHint: { fontSize: 9, fontWeight: '700', color: PALETTE.glow, marginTop: 2 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});

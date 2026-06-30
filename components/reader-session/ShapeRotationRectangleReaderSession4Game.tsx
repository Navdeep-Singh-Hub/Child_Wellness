/**
 * Level 7 Reader — Session 4, Game 2: Spin Sector
 * Identify the rotated rectangle among circle, square, and rectangles.
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

const OPTIONS = [
  { id: 'circle', label: 'Circle', shape: 'circle' as const },
  { id: 'square', label: 'Square', shape: 'square' as const },
  { id: 'rect', label: 'Rectangle', shape: 'rect' as const, rotated: false },
  { id: 'rectRotated', label: 'Rotated', shape: 'rect' as const, rotated: true },
] as const;

type OptionId = (typeof OPTIONS)[number]['id'];
const CORRECT_ID: OptionId = 'rectRotated';

const VOICE = 'Find the rotated rectangle. One rectangle is turned on its side.';
const SPIN = { accent: '#F59E0B', glow: '#FCD34D', amber: '#FBBF24' } as const;

function ShapeGlyph({
  shape,
  rotated,
}: {
  shape: 'circle' | 'square' | 'rect';
  rotated?: boolean;
}) {
  if (shape === 'circle') {
    return <View style={styles.circle} />;
  }
  if (shape === 'square') {
    return <View style={styles.square} />;
  }
  return <View style={[styles.rectangle, rotated && styles.rectangleRotated]} />;
}

function TargetSpin() {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withSequence(withTiming(12, { duration: 1200 }), withTiming(-12, { duration: 1200 })),
      -1,
      true,
    );
  }, [spin]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.targetShapeWrap, anim]}>
      <View style={styles.rectangleRotated} />
    </Animated.View>
  );
}

function SpinBeacon({
  option,
  selected,
  feedback,
  onPress,
}: {
  option: (typeof OPTIONS)[number];
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
      ? RD.good
      : feedback === 'wrong' && selected
        ? RD.warn
        : selected
          ? SPIN.glow
          : RD.glassBorder;

  return (
    <Animated.View style={[styles.beaconWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.beacon, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <View style={[styles.beaconHalo, { backgroundColor: `${SPIN.amber}22` }]} />
        <View style={styles.shapeWrap}>
          <ShapeGlyph shape={option.shape} rotated={'rotated' in option ? option.rotated : false} />
        </View>
        <Text style={styles.beaconLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ShapeRotationRectangleReaderSession4GameProps {
  onComplete: () => void;
}

export function ShapeRotationRectangleReaderSession4Game({
  onComplete,
}: ShapeRotationRectangleReaderSession4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<OptionId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: OptionId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! That is the rotated rectangle!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'rect'
            ? 'That rectangle is upright. Find the one turned on its side!'
            : id === 'circle'
              ? 'A circle is round, not a rectangle!'
              : 'A square has equal sides. Look for a rotated rectangle!',
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
      ? 'Two rectangles look similar — one is spun on its side!'
      : 'Wide and tall swapped? That is the rotated one!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Spin Sector!"
        subtitle="You found the rotated rectangle!"
        badgeEmoji="▭"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="SPIN SECTOR · GAME 2"
      title="Find the rotation"
      instruction="Tap the rectangle that is turned on its side."
      mascot="▭"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <TargetSpin />
        </View>
        <View>
          <Text style={styles.targetLabel}>TARGET SHAPE</Text>
          <Text style={styles.targetName}>Rotated rectangle</Text>
          <Text style={styles.targetHint}>turned on its side</Text>
        </View>
      </View>

      <View style={styles.radarFrame}>
        <LinearGradient
          colors={[`${SPIN.accent}33`, 'transparent', `${SPIN.amber}22`]}
          style={styles.radarGlow}
        />
        <Text style={styles.radarLabel}>SPIN BEACONS</Text>
        <View style={styles.beaconsRow}>
          {OPTIONS.map((opt) => (
            <SpinBeacon
              key={opt.id}
              option={opt}
              selected={selected === opt.id}
              feedback={feedback}
              onPress={() => handleTap(opt.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Only one rectangle is rotated sideways</Text>
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
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1.5,
    borderColor: `${SPIN.accent}55`,
  },
  targetBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(11,10,26,0.6)',
    borderWidth: 2,
    borderColor: `${SPIN.glow}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetShapeWrap: { alignItems: 'center', justifyContent: 'center' },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: SPIN.glow,
    marginBottom: 2,
  },
  targetName: { fontSize: 18, fontWeight: '900', color: RD.textLight },
  targetHint: { fontSize: 13, fontWeight: '700', color: RD.textMuted, marginTop: 2 },
  radarFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${SPIN.accent}55`,
    backgroundColor: 'rgba(50,30,10,0.45)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  radarGlow: { ...StyleSheet.absoluteFillObject },
  radarLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: SPIN.glow,
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
    width: 108,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  beaconHalo: { ...StyleSheet.absoluteFillObject },
  shapeWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SPIN.amber,
    borderWidth: 2,
    borderColor: SPIN.glow,
  },
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: SPIN.accent,
    borderWidth: 2,
    borderColor: SPIN.glow,
  },
  rectangle: {
    width: 46,
    height: 28,
    borderRadius: 6,
    backgroundColor: SPIN.accent,
    borderWidth: 2,
    borderColor: SPIN.glow,
  },
  rectangleRotated: {
    width: 28,
    height: 46,
    borderRadius: 6,
    backgroundColor: SPIN.amber,
    borderWidth: 2,
    borderColor: SPIN.glow,
  },
  beaconLabel: { fontSize: 12, fontWeight: '800', color: RD.textMuted, textAlign: 'center' },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${SPIN.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: SPIN.glow, textAlign: 'center' },
});

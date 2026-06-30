/**
 * Level 9 (Clockwise) — Session 2, Game 3: Shape Rotation
 * Select the rotated pentagon. Options: circle, square, pentagon (normal), pentagon (rotated).
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

const OPTIONS = [
  { id: 'circle', label: 'Circle', symbol: '⭕' },
  { id: 'square', label: 'Square', symbol: '⬜' },
  { id: 'pentagon', label: 'Pentagon', symbol: '⬠', rotated: false },
  { id: 'pentagonRotated', label: 'Pentagon (rotated)', symbol: '⬠', rotated: true },
] as const;

type OptionId = (typeof OPTIONS)[number]['id'];
const CORRECT_ID: OptionId = 'pentagonRotated';

const VOICE = 'Find the rotated pentagon. One pentagon is turned.';
const PALETTE = { accent: '#0891B2', glow: '#67E8F9', secondary: '#22D3EE' } as const;

function TargetSpin() {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withSequence(withTiming(36, { duration: 1200 }), withTiming(-36, { duration: 1200 })),
      -1,
      true,
    );
  }, [spin]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${72 + spin.value}deg` }],
  }));

  return (
    <Animated.View style={anim}>
      <Text style={styles.targetGlyph}>⬠</Text>
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
      ? CW.good
      : feedback === 'wrong' && selected
        ? CW.warn
        : selected
          ? PALETTE.glow
          : CW.glassBorder;

  const rotated = 'rotated' in option && option.rotated;

  return (
    <Animated.View style={[styles.beaconWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.beacon, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <LinearGradient colors={[`${PALETTE.accent}33`, 'rgba(8,12,40,0.55)']} style={styles.beaconGrad} />
        <View style={[styles.symbolWrap, rotated && styles.rotatedWrap]}>
          <Text style={styles.symbol}>{option.symbol}</Text>
        </View>
        <Text style={styles.beaconLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ShapeRotationPentagonLevel9Session2GameProps {
  onComplete: () => void;
}

export function ShapeRotationPentagonLevel9Session2Game({
  onComplete,
}: ShapeRotationPentagonLevel9Session2GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<OptionId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

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

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! That is the rotated pentagon!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'pentagon'
            ? 'That pentagon is upright. Find the one that is turned!'
            : id === 'circle'
              ? 'A circle is round, not a pentagon!'
              : id === 'square'
                ? 'A square has four sides. Look for the rotated pentagon!'
                : 'Try again. Find the pentagon that is rotated.',
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

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You found the rotated pentagon!"
        badgeEmoji="⬠"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="SHAPE ROTATION · GAME 3"
      title="Find the rotated pentagon"
      instruction="Tap the pentagon that is turned."
      mascot="⬠"
      coachLine="Two pentagons look alike — one is spun to a different angle!"
      onReplayVoice={playVoice}
    >
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <TargetSpin />
        </View>
        <View>
          <Text style={styles.targetLabel}>TARGET SHAPE</Text>
          <Text style={styles.targetName}>Rotated pentagon</Text>
          <Text style={styles.targetHint}>turned from upright</Text>
        </View>
      </View>

      <View style={styles.radarFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.radarGlow}
        />
        <Text style={styles.radarLabel}>ORBIT SPIN BEACONS</Text>
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
        <Text style={styles.legendTxt}>Only one pentagon is rotated — the others are different shapes</Text>
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
    backgroundColor: 'rgba(8,145,178,0.12)',
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
    gap: 12,
  },
  beaconWrap: { alignItems: 'center' },
  beacon: {
    width: 108,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 2.5,
    backgroundColor: 'rgba(8,12,40,0.7)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  beaconGrad: { ...StyleSheet.absoluteFillObject },
  symbolWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rotatedWrap: { transform: [{ rotate: '72deg' }] },
  symbol: { fontSize: 36 },
  beaconLabel: { fontSize: 11, fontWeight: '800', color: CW.textMuted, textAlign: 'center' },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(8,145,178,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});

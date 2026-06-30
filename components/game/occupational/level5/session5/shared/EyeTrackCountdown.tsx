/**
 * Shared countdown overlay for Session 5 eye-tracking games.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  accent: string;
  label?: string;
  onDone: () => void;
};

export function EyeTrackCountdown({ accent, label = 'Watch with your eyes', onDone }: Props) {
  const [display, setDisplay] = useState(3);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    const sequence = [3, 2, 1, 0];

    const tick = (i: number) => {
      if (cancelled) return;
      if (i >= sequence.length) {
        onDone();
        return;
      }
      const val = sequence[i]!;
      setDisplay(val === 0 ? -1 : val);
      scale.value = 0.5;
      opacity.value = 0;
      scale.value = withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 150 }),
      );
      opacity.value = withTiming(1, { duration: 150 });
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(() => tick(i + 1), 220);
      }, 650);
    };

    tick(0);
    return () => {
      cancelled = true;
    };
  }, [onDone, opacity, scale]);

  const numStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={[styles.card, { borderColor: `${accent}55` }]}>
        <Text style={[styles.label, { color: accent }]}>{label}</Text>
        <Animated.Text style={[styles.number, { color: accent }, numStyle]}>
          {display === -1 ? 'Go!' : display}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 30,
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: 24,
    paddingHorizontal: 36,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 2,
  },
  label: { fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  number: { fontSize: 64, fontWeight: '900' },
});

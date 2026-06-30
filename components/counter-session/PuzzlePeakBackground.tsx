import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COUNTER_S7_HUB_THEME as T } from './counterSessionTheme';

const PIECES = [
  { left: '10%', top: '18%', rotation: '12deg', delay: 0 },
  { left: '68%', top: '12%', rotation: '-18deg', delay: 350 },
  { left: '42%', top: '36%', rotation: '45deg', delay: 700 },
  { left: '82%', top: '48%', rotation: '-8deg', delay: 200 },
] as const;

function PuzzlePiece({
  left,
  top,
  rotation,
  delay,
}: {
  left: string;
  top: string;
  rotation: string;
  delay: number;
}) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, float]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: rotation }, { translateY: -float.value * 10 }],
    opacity: 0.28 + float.value * 0.22,
  }));

  return (
    <Animated.Text style={[styles.piece, { left, top }, style]} pointerEvents="none">
      🧩
    </Animated.Text>
  );
}

export function PuzzlePeakBackground() {
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.25,
    transform: [{ scale: 0.9 + glow.value * 0.12 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.peakGlow, glowStyle]} />
      {PIECES.map((p, i) => (
        <PuzzlePiece key={i} {...p} />
      ))}
      <View style={[styles.ridge, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  peakGlow: {
    position: 'absolute',
    left: '32%',
    top: '8%',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.38)',
  },
  piece: { position: 'absolute', fontSize: 28 },
  ridge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '18%',
    opacity: 0.1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});

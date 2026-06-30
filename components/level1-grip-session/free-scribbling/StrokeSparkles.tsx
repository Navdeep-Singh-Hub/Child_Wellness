import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const SPARKLE_COLORS = ['#FBBF24', '#34D399', '#C084FC', '#38BDF8', '#F472B6'];

interface StrokeSparklesProps {
  trigger: number;
  x?: number;
  y?: number;
}

function Sparkle({ color, angle, dist, delay }: { color: string; angle: number; dist: number; delay: number }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    opacity.value = 0;
    opacity.value = withDelay(delay, withTiming(1, { duration: 80 }));
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 500 }),
    );
    opacity.value = withDelay(delay + 350, withTiming(0, { duration: 200 }));
  }, [delay, opacity, progress]);

  const style = useAnimatedStyle(() => {
    const rad = (angle * Math.PI) / 180;
    const d = dist * progress.value;
    return {
      opacity: opacity.value,
      transform: [
        { translateX: Math.cos(rad) * d },
        { translateY: Math.sin(rad) * d },
        { scale: 1 - progress.value * 0.5 },
        { rotate: `${angle + progress.value * 90}deg` },
      ],
    };
  });

  return (
    <Animated.Text style={[styles.sparkle, { color }, style]}>✦</Animated.Text>
  );
}

export function StrokeSparkles({ trigger }: StrokeSparklesProps) {
  if (trigger === 0) return null;

  const pieces = Array.from({ length: 8 }, (_, i) => ({
    color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
    angle: i * 45,
    dist: 28 + (i % 3) * 8,
    delay: i * 30,
  }));

  return (
    <Animated.View style={styles.container} pointerEvents="none" key={trigger}>
      {pieces.map((p, i) => (
        <Sparkle key={`${trigger}-${i}`} {...p} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '900',
  },
});

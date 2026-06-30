import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GALAXY } from './theme';

const { width: W, height: H } = Dimensions.get('window');

const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 23 + 7) % 98,
  y: (i * 31 + 13) % 92,
  size: i % 4 === 0 ? 3 : 2,
  delay: (i % 8) * 200,
}));

function TwinkleStar({ x, y, size, delay }: (typeof STARS)[0]) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 800 + delay, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.15, { duration: 800 + delay, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.star,
        { left: `${x}%`, top: `${y}%`, width: size, height: size },
        style,
      ]}
    />
  );
}

function NebulaOrb({ color, left, top, size }: { color: string; left: number; top: number; size: number }) {
  const pulse = useSharedValue(0.7);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value * 0.45, transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View
      style={[
        styles.nebula,
        { left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function GalaxyBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[GALAXY.void, GALAXY.nebulaPurple, GALAXY.nebulaBlue, GALAXY.void]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <NebulaOrb color={GALAXY.cosmicMagenta} left={W * 0.1} top={H * 0.15} size={W * 0.5} />
      <NebulaOrb color={GALAXY.cosmicCyan} left={W * 0.45} top={H * 0.45} size={W * 0.55} />
      {STARS.map((s, i) => (
        <TwinkleStar key={i} {...s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: GALAXY.starWhite,
  },
  nebula: { position: 'absolute' },
});

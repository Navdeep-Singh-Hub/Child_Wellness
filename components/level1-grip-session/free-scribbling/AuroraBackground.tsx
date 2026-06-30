import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
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
import { AURORA } from './theme';

const { width: W, height: H } = Dimensions.get('window');

const ORBS = [
  { x: 0.12, y: 0.18, size: W * 0.55, color: AURORA.auroraViolet, delay: 0 },
  { x: 0.55, y: 0.08, size: W * 0.45, color: AURORA.auroraGreen, delay: 400 },
  { x: 0.7, y: 0.55, size: W * 0.5, color: AURORA.auroraBlue, delay: 800 },
  { x: 0.05, y: 0.62, size: W * 0.4, color: AURORA.auroraPink, delay: 200 },
];

function AuroraOrb({ x, y, size, color, delay }: (typeof ORBS)[0]) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.88, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.28, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          left: x * W - size / 2,
          top: y * H - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[AURORA.spaceDeep, AURORA.spaceMid, '#1a1040']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      {ORBS.map((orb, i) => (
        <AuroraOrb key={i} {...orb} />
      ))}
      {/* Subtle star dust */}
      {Array.from({ length: 24 }).map((_, i) => (
        <View
          key={`star-${i}`}
          style={[
            styles.star,
            {
              left: `${(i * 17 + 7) % 96}%`,
              top: `${(i * 23 + 11) % 88}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              opacity: 0.25 + (i % 5) * 0.1,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute' },
  star: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
});

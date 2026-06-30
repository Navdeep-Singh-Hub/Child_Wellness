import { CW } from './clockwiseTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { reduceMotion?: boolean };

const STARS = [
  { top: '6%', left: '10%', size: 2 },
  { top: '12%', left: '65%', size: 3 },
  { top: '20%', left: '35%', size: 2 },
  { top: '28%', left: '80%', size: 2 },
  { top: '36%', left: '18%', size: 3 },
  { top: '44%', left: '52%', size: 2 },
  { top: '54%', left: '6%', size: 2 },
  { top: '62%', left: '42%', size: 3 },
  { top: '70%', left: '74%', size: 2 },
  { top: '78%', left: '28%', size: 2 },
];

export function ClockwiseBackdrop({ reduceMotion = false }: Props) {
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduceMotion, drift, pulse]);

  const nebulaStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.16,
    transform: [{ scale: 1 + drift.value * 0.06 }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + pulse.value * 0.1,
    transform: [{ rotate: `${drift.value * 12}deg` }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...CW.bg]} style={StyleSheet.absoluteFillObject} />
      {STARS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: s.top as `${number}%`,
              left: s.left as `${number}%`,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
            },
          ]}
        />
      ))}
      {!reduceMotion && <Animated.View style={[styles.nebula, nebulaStyle]} />}
      {!reduceMotion && <Animated.View style={[styles.orbitRing, orbitStyle]} />}
      <View style={styles.horizonGlow} />
      <LinearGradient colors={['transparent', 'rgba(5,8,24,0.6)']} style={StyleSheet.absoluteFillObject} />
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: CW.cyanGlow,
    opacity: 0.55,
  },
  nebula: {
    position: 'absolute',
    top: '15%',
    right: '5%',
    width: '50%',
    height: '32%',
    borderRadius: 100,
    backgroundColor: CW.accent,
  },
  orbitRing: {
    position: 'absolute',
    top: '40%',
    left: '15%',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: CW.cyanGlow,
  },
  horizonGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '18%',
    backgroundColor: CW.cyan,
    opacity: 0.05,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});

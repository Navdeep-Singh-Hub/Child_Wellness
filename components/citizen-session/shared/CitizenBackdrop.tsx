import { CZ } from './citizenTheme';
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

const LIGHTS = [
  { top: '10%', left: '15%', size: 3 },
  { top: '18%', left: '72%', size: 2 },
  { top: '28%', left: '42%', size: 2 },
  { top: '35%', left: '85%', size: 3 },
  { top: '42%', left: '25%', size: 2 },
  { top: '52%', left: '58%', size: 2 },
  { top: '60%', left: '10%', size: 3 },
  { top: '68%', left: '38%', size: 2 },
  { top: '75%', left: '78%', size: 3 },
];

export function CitizenBackdrop({ reduceMotion = false }: Props) {
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduceMotion, drift, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.12,
    transform: [{ scale: 1 + drift.value * 0.06 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...CZ.bg]} style={StyleSheet.absoluteFillObject} />
      {LIGHTS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.light,
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
      {!reduceMotion && <Animated.View style={[styles.cityGlow, glowStyle]} />}
      <View style={styles.streetGlow} />
      <LinearGradient colors={['transparent', 'rgba(26,10,18,0.55)']} style={StyleSheet.absoluteFillObject} />
    </View>
  );
}

const styles = StyleSheet.create({
  light: {
    position: 'absolute',
    backgroundColor: CZ.amberGlow,
    opacity: 0.55,
  },
  cityGlow: {
    position: 'absolute',
    top: '22%',
    left: '8%',
    width: '60%',
    height: '30%',
    borderRadius: 100,
    backgroundColor: CZ.accent,
  },
  streetGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '22%',
    backgroundColor: CZ.amber,
    opacity: 0.07,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});

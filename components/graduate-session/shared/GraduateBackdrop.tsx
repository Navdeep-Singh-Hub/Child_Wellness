import { GR } from './graduateTheme';
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
  { top: '8%', left: '12%', size: 2 },
  { top: '14%', left: '68%', size: 3 },
  { top: '22%', left: '38%', size: 2 },
  { top: '30%', left: '82%', size: 2 },
  { top: '38%', left: '22%', size: 3 },
  { top: '48%', left: '55%', size: 2 },
  { top: '58%', left: '8%', size: 2 },
  { top: '66%', left: '44%', size: 3 },
  { top: '74%', left: '76%', size: 2 },
];

export function GraduateBackdrop({ reduceMotion = false }: Props) {
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduceMotion, drift, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.14,
    transform: [{ scale: 1 + drift.value * 0.05 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...GR.bg]} style={StyleSheet.absoluteFillObject} />
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
      {!reduceMotion && <Animated.View style={[styles.scholarGlow, glowStyle]} />}
      <View style={styles.deskGlow} />
      <LinearGradient colors={['transparent', 'rgba(15,10,30,0.55)']} style={StyleSheet.absoluteFillObject} />
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: GR.accentGlow,
    opacity: 0.5,
  },
  scholarGlow: {
    position: 'absolute',
    top: '18%',
    left: '10%',
    width: '55%',
    height: '28%',
    borderRadius: 100,
    backgroundColor: GR.accent,
  },
  deskGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: GR.accentBright,
    opacity: 0.06,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});

import { RD } from './readerTheme';
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
  { top: '8%', left: '12%', size: 3 },
  { top: '14%', left: '78%', size: 2 },
  { top: '22%', left: '45%', size: 2 },
  { top: '32%', left: '88%', size: 3 },
  { top: '38%', left: '22%', size: 2 },
  { top: '48%', left: '62%', size: 2 },
  { top: '55%', left: '8%', size: 3 },
  { top: '62%', left: '38%', size: 2 },
  { top: '70%', left: '72%', size: 3 },
  { top: '78%', left: '18%', size: 2 },
  { top: '85%', left: '55%', size: 2 },
  { top: '18%', left: '58%', size: 2 },
];

export function ReaderBackdrop({ reduceMotion = false }: Props) {
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduceMotion, drift, pulse]);

  const nebulaStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.1,
    transform: [{ scale: 1 + drift.value * 0.08 }],
  }));

  const cometStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 40 - 20 }, { translateY: drift.value * 12 }],
    opacity: 0.15 + pulse.value * 0.12,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...RD.bg]} style={StyleSheet.absoluteFillObject} />
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
      {!reduceMotion && (
        <>
          <Animated.View style={[styles.nebula, nebulaStyle]} />
          <Animated.View style={[styles.comet, cometStyle]} />
        </>
      )}
      <View style={styles.horizonGlow} />
      <LinearGradient colors={['transparent', 'rgba(11,10,26,0.5)']} style={StyleSheet.absoluteFillObject} />
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: RD.star,
    opacity: 0.65,
  },
  nebula: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '55%',
    height: '35%',
    borderRadius: 120,
    backgroundColor: RD.accent,
  },
  comet: {
    position: 'absolute',
    top: '12%',
    right: '8%',
    width: 80,
    height: 3,
    borderRadius: 2,
    backgroundColor: RD.cyanGlow,
  },
  horizonGlow: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '24%',
    backgroundColor: RD.accent,
    opacity: 0.08,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});

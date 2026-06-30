import { LL } from './logicLabTheme';
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

export function LogicLabBackdrop({ reduceMotion = false }: Props) {
  const scan = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    scan.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduceMotion, scan, pulse]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scan.value * 120 - 60 }],
    opacity: 0.08 + pulse.value * 0.06,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...LL.bg]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: `${12 + i * 14}%` }]} />
        ))}
      </View>
      {!reduceMotion && <Animated.View style={[styles.scanBeam, scanStyle]} />}
      <View style={styles.cityGlow} />
      <LinearGradient colors={['transparent', 'rgba(15,23,42,0.45)']} style={StyleSheet.absoluteFillObject} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { ...StyleSheet.absoluteFillObject },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(129,140,248,0.12)',
  },
  scanBeam: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 48,
    backgroundColor: LL.cyan,
    borderRadius: 24,
  },
  cityGlow: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: '22%',
    backgroundColor: LL.accent,
    opacity: 0.1,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});

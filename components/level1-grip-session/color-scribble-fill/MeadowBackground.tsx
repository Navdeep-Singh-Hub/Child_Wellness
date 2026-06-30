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
import { MEADOW } from './theme';

const { width: W } = Dimensions.get('window');

const PETALS = Array.from({ length: 10 }, (_, i) => ({
  x: (i * 19 + 5) % 92,
  delay: i * 350,
  size: 10 + (i % 3) * 4,
  color: i % 2 === 0 ? MEADOW.coralLight : MEADOW.sunflowerLight,
}));

function DriftingPetal({ x, delay, size, color }: (typeof PETALS)[0]) {
  const drift = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 2800 + delay % 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(12, { duration: 2800 + delay % 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    spin.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 6000 + delay }), -1, false),
    );
  }, [delay, drift, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }, { rotate: `${spin.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.petal,
        { left: `${x}%`, width: size, height: size * 1.4, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function MeadowBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[MEADOW.skyTop, MEADOW.skyMid, MEADOW.skyBottom, MEADOW.grass]}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(22,163,74,0.25)']}
        style={styles.grassOverlay}
      />
      {PETALS.map((p, i) => (
        <DriftingPetal key={i} {...p} />
      ))}
      {/* Soft hills */}
      <View style={styles.hillLeft} />
      <View style={styles.hillRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  grassOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
  },
  petal: {
    position: 'absolute',
    top: '12%',
    borderRadius: 50,
    opacity: 0.65,
  },
  hillLeft: {
    position: 'absolute',
    bottom: 0,
    left: -W * 0.15,
    width: W * 0.7,
    height: 80,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(74,222,128,0.35)',
  },
  hillRight: {
    position: 'absolute',
    bottom: 0,
    right: -W * 0.1,
    width: W * 0.55,
    height: 60,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: 'rgba(34,197,94,0.3)',
  },
});

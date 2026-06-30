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
import { GROUPER_S8_HUB_THEME as T } from './grouperSessionTheme';

function GulchLayer({ bottom, height, color, delay }: { bottom: string; height: string; color: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 6 }],
    opacity: 0.48 + drift.value * 0.16,
  }));

  return (
    <Animated.View
      style={[
        styles.layer,
        { bottom, height, backgroundColor: color, borderTopLeftRadius: 999, borderTopRightRadius: 999 },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

export function GoldenGulchBackground() {
  const shimmer = useSharedValue(0.6);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.5, { duration: 2600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [shimmer]);

  const veinStyle = useAnimatedStyle(() => ({ opacity: 0.3 + shimmer.value * 0.35 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <GulchLayer bottom="9%" height="22%" color="rgba(217, 119, 6, 0.14)" delay={0} />
      <GulchLayer bottom="3%" height="15%" color="rgba(180, 83, 9, 0.18)" delay={400} />
      <Animated.View style={[styles.goldVein, veinStyle]} />
      <Animated.View style={[styles.goldVein, styles.goldVeinRight, veinStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  layer: { position: 'absolute', left: '-12%', right: '-12%' },
  goldVein: {
    position: 'absolute',
    left: '14%',
    bottom: '30%',
    width: 3,
    height: '18%',
    borderRadius: 2,
    backgroundColor: T.accentSoft,
    transform: [{ rotate: '-8deg' }],
  },
  goldVeinRight: {
    left: 'auto',
    right: '18%',
    transform: [{ rotate: '6deg' }],
  },
});

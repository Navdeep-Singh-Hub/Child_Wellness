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
import { GROUPER_S7_HUB_THEME as T } from './grouperSessionTheme';

function ShelfLayer({ bottom, height, color, delay }: { bottom: string; height: string; color: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 5 }],
    opacity: 0.5 + drift.value * 0.15,
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

export function SunsetShelfBackground() {
  const glow = useSharedValue(0.65);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.55, { duration: 2800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [glow]);

  const rayStyle = useAnimatedStyle(() => ({ opacity: 0.25 + glow.value * 0.3 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <ShelfLayer bottom="10%" height="20%" color="rgba(251, 113, 133, 0.12)" delay={0} />
      <ShelfLayer bottom="4%" height="14%" color="rgba(225, 29, 72, 0.14)" delay={300} />
      <Animated.View style={[styles.sunRay, rayStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  layer: { position: 'absolute', left: '-10%', right: '-10%' },
  sunRay: {
    position: 'absolute',
    right: '12%',
    top: '18%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: T.accentSoft,
    opacity: 0.2,
  },
});

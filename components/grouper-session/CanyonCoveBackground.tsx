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
import { GROUPER_S2_HUB_THEME as T } from './grouperSessionTheme';

function CanyonLayer({ bottom, height, color, delay }: { bottom: string; height: string; color: string; delay: number }) {
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
    opacity: 0.55 + drift.value * 0.12,
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

export function CanyonCoveBackground() {
  const ripple = useSharedValue(0);

  useEffect(() => {
    ripple.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.2, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [ripple]);

  const riverStyle = useAnimatedStyle(() => ({ opacity: 0.25 + ripple.value * 0.2 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <CanyonLayer bottom="8%" height="22%" color="rgba(251, 113, 133, 0.14)" delay={0} />
      <CanyonLayer bottom="2%" height="16%" color="rgba(249, 115, 22, 0.18)" delay={300} />
      <Animated.View style={[styles.river, riverStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  layer: { position: 'absolute', left: '-8%', right: '-8%' },
  river: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: '14%',
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accentSoft,
  },
});

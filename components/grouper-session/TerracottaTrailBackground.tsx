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
import { GROUPER_S6_HUB_THEME as T } from './grouperSessionTheme';

function TrailLayer({ bottom, height, color, delay }: { bottom: string; height: string; color: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 4 }],
    opacity: 0.48 + drift.value * 0.14,
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

export function TerracottaTrailBackground() {
  const glow = useSharedValue(0.6);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [glow]);

  const pathStyle = useAnimatedStyle(() => ({ opacity: 0.3 + glow.value * 0.25 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <TrailLayer bottom="9%" height="22%" color="rgba(194, 65, 12, 0.12)" delay={0} />
      <TrailLayer bottom="3%" height="15%" color="rgba(154, 52, 18, 0.16)" delay={350} />
      <Animated.View style={[styles.trailPath, pathStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  layer: { position: 'absolute', left: '-12%', right: '-12%' },
  trailPath: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    bottom: '22%',
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accentSoft,
  },
});

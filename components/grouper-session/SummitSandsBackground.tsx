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
import { GROUPER_S10_HUB_THEME as T } from './grouperSessionTheme';

function SummitLayer({ bottom, height, color, delay }: { bottom: string; height: string; color: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 5200, easing: Easing.inOut(Easing.sin) })
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

export function SummitSandsBackground() {
  const glow = useSharedValue(0.65);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.55, { duration: 3200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [glow]);

  const peakStyle = useAnimatedStyle(() => ({ opacity: 0.35 + glow.value * 0.3 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <SummitLayer bottom="11%" height="24%" color="rgba(245, 158, 11, 0.12)" delay={0} />
      <SummitLayer bottom="4%" height="16%" color="rgba(217, 119, 6, 0.16)" delay={400} />
      <Animated.View style={[styles.peakGlow, peakStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  layer: { position: 'absolute', left: '-14%', right: '-14%' },
  peakGlow: {
    position: 'absolute',
    left: '50%',
    top: '16%',
    marginLeft: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: T.accentSoft,
  },
});

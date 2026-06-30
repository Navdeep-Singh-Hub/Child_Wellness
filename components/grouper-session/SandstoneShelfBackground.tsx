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
import { GROUPER_S5_HUB_THEME as T } from './grouperSessionTheme';

function ShelfLayer({ bottom, height, color, delay }: { bottom: string; height: string; color: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4800, easing: Easing.inOut(Easing.sin) })
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

export function SandstoneShelfBackground() {
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

  const bandStyle = useAnimatedStyle(() => ({ opacity: 0.35 + glow.value * 0.25 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <ShelfLayer bottom="10%" height="20%" color="rgba(217, 119, 6, 0.12)" delay={0} />
      <ShelfLayer bottom="4%" height="14%" color="rgba(180, 83, 9, 0.16)" delay={400} />
      <Animated.View style={[styles.shelfBand, bandStyle]} />
      <Animated.View style={[styles.shelfBand, styles.shelfBandMid, bandStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  layer: { position: 'absolute', left: '-10%', right: '-10%' },
  shelfBand: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    bottom: '28%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.accentSoft,
  },
  shelfBandMid: { bottom: '42%', left: '12%', right: '12%', opacity: 0.5 },
});

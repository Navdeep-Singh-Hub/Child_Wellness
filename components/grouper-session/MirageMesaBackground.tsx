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
import { GROUPER_S3_HUB_THEME as T } from './grouperSessionTheme';

function HeatWave({ top, delay }: { top: string; delay: number }) {
  const wave = useSharedValue(0);

  useEffect(() => {
    wave.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, wave]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + wave.value * 0.2,
    transform: [{ scaleX: 1 + wave.value * 0.04 }],
  }));

  return (
    <Animated.View style={[styles.wave, { top }, style]} pointerEvents="none" />
  );
}

export function MirageMesaBackground() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.3, { duration: 2800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [shimmer]);

  const mesaStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + shimmer.value * 0.25,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.mesa, mesaStyle]} />
      <HeatWave top="42%" delay={0} />
      <HeatWave top="52%" delay={400} />
      <HeatWave top="62%" delay={800} />
      <View style={styles.sunHaze} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  mesa: {
    position: 'absolute',
    left: '-12%',
    right: '-12%',
    bottom: '-6%',
    height: '34%',
    backgroundColor: 'rgba(250, 204, 21, 0.16)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  wave: {
    position: 'absolute',
    left: '5%',
    right: '5%',
    height: 28,
    borderRadius: 14,
    backgroundColor: T.accentSoft,
  },
  sunHaze: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(254, 240, 138, 0.2)',
  },
});

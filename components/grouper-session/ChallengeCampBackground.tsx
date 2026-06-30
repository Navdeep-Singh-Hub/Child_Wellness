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
import { GROUPER_S9_HUB_THEME as T } from './grouperSessionTheme';

function CampLayer({ bottom, height, color, delay }: { bottom: string; height: string; color: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 4 }],
    opacity: 0.45 + drift.value * 0.18,
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

export function ChallengeCampBackground() {
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const boltStyle = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.45 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <CampLayer bottom="10%" height="20%" color="rgba(99, 102, 241, 0.12)" delay={0} />
      <CampLayer bottom="4%" height="14%" color="rgba(79, 70, 229, 0.16)" delay={350} />
      <Animated.View style={[styles.boltGlow, boltStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  layer: { position: 'absolute', left: '-10%', right: '-10%' },
  boltGlow: {
    position: 'absolute',
    left: '50%',
    top: '22%',
    marginLeft: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: T.accentSoft,
  },
});

import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { HUB } from './theme';

const { width: W } = Dimensions.get('window');

const GLOW_ORBS = [
  { color: '#8B5CF6', left: 0.05, top: 0.1, size: W * 0.5 },
  { color: '#22D3EE', left: 0.5, top: 0.35, size: W * 0.45 },
  { color: '#FBBF24', left: 0.2, top: 0.6, size: W * 0.4 },
];

function GlowOrb({ color, left, top, size }: (typeof GLOW_ORBS)[0]) {
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        styles.orb,
        { left: left * W, top: `${top * 100}%`, width: size, height: size, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function SessionHubBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[HUB.bgTop, HUB.bgMid, HUB.bgBottom]}
        style={StyleSheet.absoluteFill}
      />
      {GLOW_ORBS.map((o, i) => (
        <GlowOrb key={i} {...o} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', borderRadius: 9999 },
});

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = { active: boolean; color?: string; size?: number };

export const BeatPulseRing: React.FC<Props> = ({ active, color = 'rgba(251,191,36,0.55)', size = 200 }) => {
  const ringScale = useSharedValue(0.4);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      ringScale.value = 0.35;
      ringOpacity.value = 0.9;
      ringScale.value = withTiming(1.35, { duration: 420, easing: Easing.out(Easing.cubic) });
      ringOpacity.value = withTiming(0, { duration: 480 });
    }
  }, [active, ringOpacity, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
          ringStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 4 },
});

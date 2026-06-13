import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function BreathingAura() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.35);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.55, { duration: 2800 }), withTiming(0.25, { duration: 2800 })),
      -1,
      false,
    );
  }, [opacity, scale]);

  const aura = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.aura, aura]} />
      <Text style={styles.text}>Breathe slowly… 🧘</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  aura: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#A7F3D0',
  },
  text: { fontSize: 16, fontWeight: '800', color: '#047857', zIndex: 2 },
});

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
const FRUIT = [
  { left: '8%', top: '38%', emoji: '🍊', delay: 0 },
  { left: '78%', top: '44%', emoji: '🍎', delay: 300 },
  { left: '42%', top: '52%', emoji: '🍋', delay: 600 },
] as const;

function FloatingFruit({ left, top, emoji, delay }: { left: string; top: string; emoji: string; delay: number }) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [bob, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * 10 }],
    opacity: 0.35 + bob.value * 0.2,
  }));

  return (
    <Animated.Text style={[styles.fruit, { left, top }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

export function OasisOrchardBackground() {
  const glow = useSharedValue(0.7);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.65, { duration: 3000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [glow]);

  const hillStyle = useAnimatedStyle(() => ({ opacity: 0.45 + glow.value * 0.2 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.hillBack, hillStyle]} />
      <Animated.View style={[styles.hillFront, hillStyle]} />
      {FRUIT.map((f) => (
        <FloatingFruit key={`${f.left}-${f.emoji}`} {...f} />
      ))}
      <Text style={styles.palm}>🌴</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  hillBack: {
    position: 'absolute',
    left: '-10%',
    right: '-10%',
    bottom: '-8%',
    height: '36%',
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  hillFront: {
    position: 'absolute',
    left: '-15%',
    right: '-15%',
    bottom: '-12%',
    height: '26%',
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  fruit: { position: 'absolute', fontSize: 28 },
  palm: { position: 'absolute', right: '10%', bottom: '22%', fontSize: 36, opacity: 0.35 },
});
